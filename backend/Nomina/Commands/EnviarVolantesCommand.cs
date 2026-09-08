using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Features.Nomina.Commands
{
    public record EnviarVolantesCommand(
        List<NominaItemDto> Items,
        string ConceptoPeriodo,
        SmtpSettings SmtpConfig
    );

    public class EnviarVolantesCommandHandler
    {
        private readonly IPdfService _pdfService;
        private readonly IEmailService _emailService;
        private readonly AppDbContext _db;

        public EnviarVolantesCommandHandler(IPdfService pdfService, IEmailService emailService, AppDbContext db)
        {
            _pdfService = pdfService;
            _emailService = emailService;
            _db = db;
        }

        public async Task<IResult> HandleAsync(EnviarVolantesCommand command)
        {
            if (command.Items == null || command.Items.Count == 0)
            {
                return Results.BadRequest(new { mensaje = "No hay elementos de nómina para enviar." });
            }

            // VALIDACIÓN: Evitar envío si hay empleados no registrados
            var noRegistrados = command.Items.Where(i =>
                !i.EmpleadoExiste ||
                i.EStatusEmpleado == "NO_EXISTE" ||
                (i.NombreEmpleado != null && i.NombreEmpleado.Contains("NO REGISTRADO"))
            ).ToList();

            if (noRegistrados.Count > 0)
            {
                var codigos = string.Join(", ", noRegistrados.Select(i => i.CodigoEmpleado));
                return Results.BadRequest(new
                {
                    mensaje = $"No se pueden enviar los volantes porque existen {noRegistrados.Count} empleados no registrados en el catálogo: {codigos}"
                });
            }

            var tasks = new List<EmailTaskDto>();
            foreach (var item in command.Items)
            {
                if (string.IsNullOrWhiteSpace(item.EmailDestinatario) || !item.EmailDestinatario.Contains("@"))
                    continue;

                var pdfBytes = _pdfService.GenerarVolantePdf(item, command.ConceptoPeriodo);
                tasks.Add(new EmailTaskDto
                {
                    CodigoEmpleado = item.CodigoEmpleado,
                    NombreEmpleado = item.NombreEmpleado ?? "Empleado",
                    EmailDestinatario = item.EmailDestinatario,
                    PdfBytes = pdfBytes,
                    NetoPagado = item.NetoAPagar
                });
            }

            var resultados = await _emailService.EnviarVolantesMasivosAsync(tasks, command.ConceptoPeriodo, command.SmtpConfig);
            int exitosos = resultados.Count(r => r.Exitoso);
            int fallidos = resultados.Count(r => !r.Exitoso);

            if (exitosos > 0)
            {
                var hoy = DateTime.Now;
                var periodo = await _db.NominaPeriodos
                    .Where(p => p.Mes == hoy.Month)
                    .OrderByDescending(p => p.FechaProcesado)
                    .FirstOrDefaultAsync();

                if (periodo != null)
                {
                    periodo.FechaCorreosEnviados = DateTime.Now;
                    await _db.SaveChangesAsync();
                }
            }

            return Results.Ok(new
            {
                mensaje = $"Proceso finalizado. {exitosos} enviados, {fallidos} fallidos.",
                exitosos,
                fallidos,
                detalles = resultados
            });
        }
    }
}