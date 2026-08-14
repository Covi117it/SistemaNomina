using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Features.Nomina.Queries
{
    public record ObtenerEventosCalendarioQuery(int? Anio, int? Mes);

    public class ObtenerEventosCalendarioQueryHandler
    {
        private readonly AppDbContext _db;

        public ObtenerEventosCalendarioQueryHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IResult> HandleAsync(ObtenerEventosCalendarioQuery query)
        {
            var hoy = DateTime.Now;
            int targetAnio = query.Anio.HasValue && query.Anio.Value > 0 ? query.Anio.Value : hoy.Year;
            int targetMes = query.Mes.HasValue && query.Mes.Value >= 1 && query.Mes.Value <= 12 ? query.Mes.Value : hoy.Month;

            int daysInTargetMonth = DateTime.DaysInMonth(targetAnio, targetMes);
            int assignedPayrollDay = hoy.Day <= 15 ? 15 : Math.Min(30, daysInTargetMonth);
            string currentQuincenaCode = hoy.Day <= 15 ? "1Q" : "2Q";
            string quincenaLabel = hoy.Day <= 15 ? "1ra Quincena" : "2da Quincena";

            var culture = new CultureInfo("es-ES");
            string nombreMes = culture.DateTimeFormat.GetMonthName(targetMes);
            nombreMes = char.ToUpper(nombreMes[0]) + nombreMes.Substring(1);



            var eventosList = new List<object>();

            NominaPeriodo? periodoActual = null;
            List<NominaPeriodo> periodosHistorial = new();
            try
            {
                // 1. Consultar históricos de nóminas procesadas en MariaDB para este año y mes
                periodosHistorial = await _db.NominaPeriodos
                    .Include(p => p.Detalles)
                    .Where(p => p.FechaProcesado.Year == targetAnio && p.Mes == targetMes)
                    .AsNoTracking()
                    .ToListAsync();

                periodoActual = periodosHistorial.FirstOrDefault(p => p.Quincena == currentQuincenaCode);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Warning] No se pudieron cargar los periodos de nómina: {ex.Message}");
            }

            // EVALUACIÓN DE REGLAS DE ELIMINACIÓN/COMPLETADO DE EVENTOS AUTOMÁTICOS:
            bool nominaProcesadaEnDiaAsignado = periodoActual != null;
            bool correosEnviadosEnDiaAsignado = periodoActual != null && periodoActual.FechaCorreosEnviados.HasValue;

            int effectiveReminderDay = (hoy.Year == targetAnio && hoy.Month == targetMes && hoy.Day > assignedPayrollDay && !nominaProcesadaEnDiaAsignado) 
                ? hoy.Day 
                : assignedPayrollDay;
            string effectiveDateStr = $"{targetAnio}-{targetMes:D2}-{effectiveReminderDay:D2}";

            // 1. Evento Automático de Quincena "Supervisión / Procesar Nómina"
            if (nominaProcesadaEnDiaAsignado)
            {
                eventosList.Add(new
                {
                    id = "auto-1",
                    day = assignedPayrollDay,
                    dateStr = $"{targetAnio}-{targetMes:D2}-{assignedPayrollDay:D2}",
                    time = "Procesada",
                    startTime = "07:00",
                    title = $"Supervisión de Quincena ({quincenaLabel})",
                    description = $"Quincena procesada exitosamente ({periodoActual?.Detalles?.Count ?? 0} empleados)",
                    badge = "COMPLETADO",
                    eventType = "payroll-completed"
                });
            }
            else
            {
                eventosList.Add(new
                {
                    id = "auto-1",
                    day = effectiveReminderDay,
                    dateStr = effectiveDateStr,
                    time = "07:00 AM - Carga Límite",
                    startTime = "07:00",
                    title = $"Supervisión de Quincena ({quincenaLabel})",
                    description = $"Fecha programada para cargar y procesar la {quincenaLabel} de {nombreMes}",
                    badge = "QUINCENAL PENDIENTE",
                    eventType = "payroll-pending",
                    actionText = "Procesar"
                });
            }

            // 2. Evento Automático de Quincena "Enviar Volantes de Pago"
            if (!correosEnviadosEnDiaAsignado)
            {
                eventosList.Add(new
                {
                    id = "auto-2",
                    day = effectiveReminderDay,
                    dateStr = effectiveDateStr,
                    time = "08:00 AM - Despacho",
                    startTime = "08:00",
                    title = "Enviar Volantes de Pago",
                    description = "Generación y envío masivo de comprobantes PDF al correo de cada empleado",
                    badge = "CORREOS PDF",
                    eventType = "pdf-dispatch",
                    actionText = "Despachar"
                });
            }

            // 3. Consultar eventos personalizados creados por usuarios en MariaDB para el año y mes solicitados
            try
            {
                var eventosUsuarios = await _db.EventosRecordatorios
                    .Where(e => e.FechaHora.Year == targetAnio && e.FechaHora.Month == targetMes)
                    .OrderBy(e => e.FechaHora)
                    .AsNoTracking()
                    .ToListAsync();

                foreach (var evt in eventosUsuarios)
                {
                    eventosList.Add(new
                    {
                        id = evt.Id.ToString(),
                        day = evt.FechaHora.Day,
                        dateStr = evt.FechaHora.ToString("yyyy-MM-dd"),
                        time = evt.FechaHora.ToString("hh:mm tt"),
                        startTime = evt.FechaHora.ToString("HH:mm"),
                        title = evt.Titulo,
                        subtitle = evt.Subtitulo,
                        description = evt.Descripcion,
                        badge = evt.Prioridad,
                        eventType = evt.TipoEvento,
                        priority = evt.Prioridad,
                        attachmentName = evt.AdjuntoNombre,
                        actionText = evt.TextoAccion,
                    });
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Warning] No se pudieron cargar los eventos personalizados: {ex.Message}");
            }

            return Results.Ok(new
            {
                anio = targetAnio,
                mes = targetMes,
                nombreMes = nombreMes,
                nextPayrollDay = assignedPayrollDay,
                nextPayrollMonth = hoy.Month,
                nextPayrollQuincenaLabel = quincenaLabel,
                eventos = eventosList
            });
        }
    }
}
