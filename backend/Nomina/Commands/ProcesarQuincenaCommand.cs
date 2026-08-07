using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Features.Nomina.Commands
{
    public record ProcesarQuincenaCommand(
        List<NominaItemDto> ItemsNomina,
        int? Mes,
        string? Quincena,
        string? Concepto
    );

    public class ProcesarQuincenaCommandHandler
    {
        private readonly AppDbContext _db;

        public ProcesarQuincenaCommandHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IResult> HandleAsync(ProcesarQuincenaCommand command)
        {
            if (command.ItemsNomina == null || command.ItemsNomina.Count == 0)
            {
                return Results.BadRequest(new { mensaje = "La lista de nómina enviada está vacía." });
            }

            // 1. VALIDACIÓN DE SEGURIDAD EN BACKEND: Bloqueo de empleados no registrados
            var codigosUnicos = command.ItemsNomina
                                       .Select(i => i.CodigoEmpleado.Trim())
                                       .Distinct()
                                       .ToList();

            var empleadosExistentes = await _db.Empleados
                                              .Where(e => codigosUnicos.Contains(e.Codigo))
                                              .Select(e => e.Codigo)
                                              .ToListAsync();

            var codigosFaltantes = codigosUnicos.Except(empleadosExistentes, StringComparer.OrdinalIgnoreCase).ToList();
            if (codigosFaltantes.Count > 0)
            {
                return Results.BadRequest(new
                {
                    mensaje = $"No se puede guardar la nómina porque existen {codigosFaltantes.Count} códigos no registrados en el catálogo: {string.Join(", ", codigosFaltantes)}"
                });
            }

            // 2. Preparar Período de Nómina
            int mesVal = (command.Mes.HasValue && command.Mes.Value >= 1 && command.Mes.Value <= 12) ? command.Mes.Value : DateTime.UtcNow.Month;
            string quincenaVal = string.IsNullOrWhiteSpace(command.Quincena) ? "1Q" : command.Quincena;
            string conceptoVal = string.IsNullOrWhiteSpace(command.Concepto) ? $"Nómina Quincenal {quincenaVal} - Mes {mesVal}" : command.Concepto;

            // 3. Transacción atómica ACID
            await using var transaction = await _db.Database.BeginTransactionAsync();

            try
            {
                var nuevoPeriodo = new NominaPeriodo
                {
                    Mes = mesVal,
                    Quincena = quincenaVal,
                    Concepto = conceptoVal,
                    FechaProcesado = DateTime.UtcNow,
                    MontoTotalDevengado = command.ItemsNomina.Sum(i => i.TotalDevengado),
                    MontoTotalDeducciones = command.ItemsNomina.Sum(i => i.TotalDeducciones),
                    MontoTotalNeto = command.ItemsNomina.Sum(i => i.NetoAPagar),
                    Estado = "PROCESADO"
                };

                await _db.NominaPeriodos.AddAsync(nuevoPeriodo);
                await _db.SaveChangesAsync();

                var listaEmpleados = await _db.Empleados.AsNoTracking().ToListAsync();
                var empMap = listaEmpleados.ToDictionary(e => e.Codigo.Trim(), StringComparer.OrdinalIgnoreCase);

                foreach (var item in command.ItemsNomina)
                {
                    empMap.TryGetValue(item.CodigoEmpleado, out var empInfo);

                    var detalle = new NominaDetalle
                    {
                        NominaPeriodoId = nuevoPeriodo.Id,
                        CodigoEmpleado = item.CodigoEmpleado,
                        NombreEmpleadoSnapshot = item.NombreEmpleado ?? empInfo?.Nombres ?? "Empleado",
                        CedulaSnapshot = empInfo?.Cedula,
                        EmailDestinatario = item.EmailDestinatario ?? empInfo?.Email,
                        SueldoPeriodo = item.SueldoBase,
                        Incentivo = item.Incentivo,
                        Reembolso = item.Reembolso,
                        HorasExtras = item.HorasExtras,
                        Prestamo = item.Prestamo,
                        CuotaCumpleanos = item.CuotaCumpleanos,
                        TotalDevengado = item.TotalDevengado,
                        SeguroVehiculo = item.SeguroVehiculo,
                        SeguroMedico = item.SeguroMedico,
                        Sfs = item.Sfs,
                        Afp = item.Afp,
                        Isr = item.Isr,
                        TotalDeducciones = item.TotalDeducciones,
                        NetoPagado = item.NetoAPagar,
                        CorreoEnviado = false
                    };

                    await _db.NominaDetalles.AddAsync(detalle);
                }

                await _db.SaveChangesAsync();
                await transaction.CommitAsync();

                return Results.Ok(new
                {
                    mensaje = $"Nómina de la quincena '{nuevoPeriodo.Quincena}' procesada y guardada en el histórico con éxito.",
                    periodoId = nuevoPeriodo.Id,
                    totalEmpleados = command.ItemsNomina.Count,
                    totalNeto = nuevoPeriodo.MontoTotalNeto
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                return Results.Problem($"Error al procesar la nómina: {ex.Message}");
            }
        }
    }
}