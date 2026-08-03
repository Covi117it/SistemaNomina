using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;

namespace backend.Endpoints
{
    public static class NominaEndpoints
    {
        public static void MapNominaEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/nomina")
                           .WithTags("Nómina Quincenal");

            group.MapPost("/preview-quincena", async (IFormFile file, IExcelService excelService, AppDbContext db) =>
            {
                if (file == null || file.Length == 0)
                {
                    return Results.BadRequest(new { mensaje = "Debe proporcionar un archivo Excel de nómina válido." });
                }

                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                if (extension != ".xlsx" && extension != ".xls")
                {
                    return Results.BadRequest(new { mensaje = "El archivo debe tener formato .xlsx o .xls." });
                }

                using var stream = file.OpenReadStream();
                var itemsNomina = await excelService.ProcesarExcelNominaAsync(stream);

                if (itemsNomina.Count == 0)
                {
                    return Results.BadRequest(new { mensaje = "No se encontraron registros de nómina válidos en el archivo Excel." });
                }

                var listaEmpleados = await db.Empleados.AsNoTracking().ToListAsync();
                var empleadosMap = listaEmpleados.ToDictionary(e => e.Codigo.Trim(), StringComparer.OrdinalIgnoreCase);

                int codigosNoEncontrados = 0;

                foreach (var item in itemsNomina)
                {
                    if (empleadosMap.TryGetValue(item.CodigoEmpleado, out var emp))
                    {
                        item.NombreEmpleado = emp.Nombres;
                        item.PuestoEmpleado = emp.Puesto;
                        item.EStatusEmpleado = emp.EStatus;
                        item.EmailDestinatario = emp.Email;
                        item.EmpleadoExiste = true;
                    }
                    else
                    {
                        item.NombreEmpleado = "⚠️ EMPLEADO NO REGISTRADO";
                        item.PuestoEmpleado = "N/A";
                        item.EStatusEmpleado = "NO_EXISTE";
                        item.EmailDestinatario = null;
                        item.EmpleadoExiste = false;
                        codigosNoEncontrados++;
                    }
                }

                decimal totalDevengado = itemsNomina.Sum(i => i.TotalDevengado);
                decimal totalDeducciones = itemsNomina.Sum(i => i.TotalDeducciones);
                decimal totalNeto = itemsNomina.Sum(i => i.NetoAPagar);

                return Results.Ok(new
                {
                    totalRegistros = itemsNomina.Count,
                    codigosNoEncontrados,
                    resumenTotales = new
                    {
                        totalDevengado,
                        totalDeducciones,
                        totalNeto
                    },
                    items = itemsNomina
                });
            })
            .WithSummary("Lee el Excel 2 de pagos quincenales y realiza el cruce automático con la BD.")
            .DisableAntiforgery();

            group.MapPost("/procesar-quincena", async (List<NominaItemDto> itemsNomina, int? mes, string? quincena, string? concepto, AppDbContext db) =>
            {
                if (itemsNomina == null || itemsNomina.Count == 0)
                {
                    return Results.BadRequest(new { mensaje = "La lista de nómina enviada está vacía." });
                }

                int mesVal = (mes.HasValue && mes.Value >= 1 && mes.Value <= 12) ? mes.Value : DateTime.UtcNow.Month;
                string quincenaVal = string.IsNullOrWhiteSpace(quincena) ? "1Q" : quincena;
                string conceptoVal = string.IsNullOrWhiteSpace(concepto) ? $"Nómina Quincenal {quincenaVal} - Mes {mesVal}" : concepto;

                var nuevoPeriodo = new NominaPeriodo
                {
                    Mes = mesVal,
                    Quincena = quincenaVal,
                    Concepto = conceptoVal,
                    FechaProcesado = DateTime.UtcNow,
                    MontoTotalDevengado = itemsNomina.Sum(i => i.TotalDevengado),
                    MontoTotalDeducciones = itemsNomina.Sum(i => i.TotalDeducciones),
                    MontoTotalNeto = itemsNomina.Sum(i => i.NetoAPagar),
                    Estado = "PROCESADO"
                };

                await db.NominaPeriodos.AddAsync(nuevoPeriodo);
                await db.SaveChangesAsync();

                var listaEmpleados = await db.Empleados.AsNoTracking().ToListAsync();
                var empMap = listaEmpleados.ToDictionary(e => e.Codigo.Trim(), StringComparer.OrdinalIgnoreCase);

                foreach (var item in itemsNomina)
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

                    await db.NominaDetalles.AddAsync(detalle);
                }

                await db.SaveChangesAsync();

                return Results.Ok(new
                {
                    mensaje = $"Nómina de la quincena '{nuevoPeriodo.Quincena}' procesada y guardada en el histórico con éxito.",
                    periodoId = nuevoPeriodo.Id,
                    totalEmpleados = itemsNomina.Count,
                    totalNeto = nuevoPeriodo.MontoTotalNeto
                });
            })
            .WithSummary("Guarda la cabecera y detalles del pago quincenal en SQLite.")
            .DisableAntiforgery();

            group.MapGet("/historico", async (int? anio, int? mes, string? quincena, AppDbContext db) =>
            {
                var query = db.NominaPeriodos
                              .Include(p => p.Detalles)
                              .AsNoTracking()
                              .AsQueryable();

                if (anio.HasValue && anio.Value > 0)
                {
                    query = query.Where(p => p.FechaProcesado.Year == anio.Value);
                }

                if (mes.HasValue && mes.Value > 0)
                {
                    query = query.Where(p => p.Mes == mes.Value);
                }

                if (!string.IsNullOrWhiteSpace(quincena) && quincena != "TODAS")
                {
                    query = query.Where(p => p.Quincena == quincena);
                }

                var periodos = await query.OrderByDescending(p => p.FechaProcesado).ToListAsync();

                return Results.Ok(periodos);
            })
            .WithSummary("Obtiene los registros históricos de nóminas guardadas en SQLite.");

            group.MapPost("/generar-volante-pdf", (NominaItemDto item, string? conceptoPeriodo, IPdfService pdfService) =>
            {
                if (item == null)
                {
                    return Results.BadRequest(new { mensaje = "Los datos del empleado para el volante son requeridos." });
                }

                string concepto = string.IsNullOrWhiteSpace(conceptoPeriodo) ? "Primera Quincena de Enero 2026" : conceptoPeriodo;
                var pdfBytes = pdfService.GenerarVolantePdf(item, concepto);

                return Results.File(pdfBytes, "application/pdf", $"Volante_{item.CodigoEmpleado}.pdf");
            })
            .WithSummary("Generar el PDF del volante de pago quincenal para un empleado.")
            .DisableAntiforgery();

            group.MapPost("/enviar-volantes-correo", async (EnviarVolantesRequestDto request, IPdfService pdfService, IEmailService emailService) =>
{
    if (request.Items == null || request.Items.Count == 0)
    {
        return Results.BadRequest(new { mensaje = "No hay elementos de nómina para enviar." });
    }
    var tasks = new List<EmailTaskDto>();
    foreach (var item in request.Items)
    {
        if (string.IsNullOrWhiteSpace(item.EmailDestinatario) || !item.EmailDestinatario.Contains("@"))
            continue;
        var pdfBytes = pdfService.GenerarVolantePdf(item, request.ConceptoPeriodo);
        tasks.Add(new EmailTaskDto
        {
            CodigoEmpleado = item.CodigoEmpleado,
            NombreEmpleado = item.NombreEmpleado ?? "Empleado",
            EmailDestinatario = item.EmailDestinatario,
            PdfBytes = pdfBytes,
            NetoPagado = item.NetoAPagar
        });
    }
    var resultados = await emailService.EnviarVolantesMasivosAsync(tasks, request.ConceptoPeriodo, request.SmtpConfig);
    int exitosos = resultados.Count(r => r.Exitoso);
    int fallidos = resultados.Count(r => !r.Exitoso);
    return Results.Ok(new
    {
        mensaje = $"Proceso finalizado. {exitosos} enviados, {fallidos} fallidos.",
        exitosos,
        fallidos,
        detalles = resultados
    });
})
.WithSummary("Genera y envía por correo masivamente los volantes de pago en PDF.")
.DisableAntiforgery();
        }
    }
}