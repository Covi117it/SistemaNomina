using System;
using System.Collections.Generic;
using backend.Application.Features.Nomina.Commands;
using backend.Application.Features.Nomina.Queries;
using backend.Common;
using backend.DTOs;
using backend.Services;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Http;

namespace backend.Endpoints
{
    public static class NominaEndpoints
    {
        public static void MapNominaEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/nomina")
                           .WithTags("Nómina Quincenal");

            // Vista previa de nómina desde archivo Excel
            group.MapPost("/preview-quincena", async (IFormFile file, PreviewQuincenaQueryHandler handler) =>
                await handler.HandleAsync(new PreviewQuincenaQuery(file))
            )
            .RequirePermission(Permissions.NominaProcess)
            .WithSummary("Lee el Excel de pagos quincenales y realiza el cruce automático con la BD.")
            .DisableAntiforgery();

            // Procesar y registrar quincena
            group.MapPost("/procesar-quincena", async (List<NominaItemDto> itemsNomina, int? mes, string? quincena, string? concepto, ProcesarQuincenaCommandHandler handler, AppDbContext db, HttpContext httpContext) =>
            {
                var resultado = await handler.HandleAsync(new ProcesarQuincenaCommand(itemsNomina, mes, quincena, concepto));
                var currentUser = httpContext.Items["CurrentUser"] as Usuario;
                if (currentUser != null)
                {
                    var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                    string desc = string.IsNullOrWhiteSpace(concepto)
                        ? $"Guardó nómina en histórico ({quincena} - Mes {mes})"
                        : $"Guardó nómina en histórico: {concepto}";
                    int totalEmpleados = itemsNomina?.Count ?? 0;
                    await AuditoriaHelper.RegistrarAsync(db, currentUser.Id, "NOMINA", "action", desc, $"{totalEmpleados} colaboradores procesados", ip);
                }
                return resultado;
            })
            .RequirePermission(Permissions.NominaProcess)
            .WithSummary("Guarda la cabecera y detalles del pago quincenal en SQLite (con bloqueo para no registrados).")
            .DisableAntiforgery();

            // Consulta de histórico de nóminas
            group.MapGet("/historico", async (int? anio, int? mes, string? quincena, string? search, ObtenerHistoricoQueryHandler handler) =>
                await handler.HandleAsync(new ObtenerHistoricoQuery(anio, mes, quincena, search))
            )
            .RequirePermission(Permissions.NominaRead)
            .WithSummary("Obtiene los registros históricos de nóminas guardadas en SQLite.");

            // Eventos del calendario de nóminas
            group.MapGet("/eventos-calendario", async (int? anio, int? mes, int? year, int? month, ObtenerEventosCalendarioQueryHandler handler) =>
                await handler.HandleAsync(new ObtenerEventosCalendarioQuery(anio ?? year, mes ?? month))
            )
            .RequirePermission(Permissions.EventosManage)
            .WithSummary("Obtiene los eventos y cálculos de nómina para el calendario en el servidor.");

            // Creación de evento de agenda
            group.MapPost("/eventos", async (CrearEventoDto dto, CrearEventoCommandHandler handler, AppDbContext db, HttpContext httpContext) =>
            {
                var resultado = await handler.HandleAsync(new CrearEventoCommand(dto));
                var currentUser = httpContext.Items["CurrentUser"] as Usuario;
                if (currentUser != null)
                {
                    var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                    await AuditoriaHelper.RegistrarAsync(db, currentUser.Id, "EVENTOS", "action", $"Creó evento de calendario: {dto.Titulo}", $"Fecha: {dto.FechaStr}", ip);
                }
                return resultado;
            })
            .RequirePermission(Permissions.EventosManage)
            .WithSummary("Guarda un nuevo evento de la agenda en la base de datos MariaDB.")
            .DisableAntiforgery();

            // Edición de evento de agenda
            group.MapPut("/eventos/{id:int}", async (int id, EditarEventoDto dto, EditarEventoCommandHandler handler, AppDbContext db, HttpContext httpContext) =>
            {
                var resultado = await handler.HandleAsync(new EditarEventoCommand(id, dto));
                var currentUser = httpContext.Items["CurrentUser"] as Usuario;
                if (currentUser != null)
                {
                    var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                    await AuditoriaHelper.RegistrarAsync(db, currentUser.Id, "EVENTOS", "action", $"Modificó evento de calendario #{id}: {dto.Titulo}", $"Fecha: {dto.FechaStr}", ip);
                }
                return resultado;
            })
            .RequirePermission(Permissions.EventosManage)
            .WithSummary("Actualiza un evento existente en la base de datos MariaDB.")
            .DisableAntiforgery();

            // Eliminación de evento de agenda
            group.MapDelete("/eventos/{id:int}", async (int id, EliminarEventoCommandHandler handler, AppDbContext db, HttpContext httpContext) =>
            {
                var resultado = await handler.HandleAsync(new EliminarEventoCommand(id));
                var currentUser = httpContext.Items["CurrentUser"] as Usuario;
                if (currentUser != null)
                {
                    var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                    await AuditoriaHelper.RegistrarAsync(db, currentUser.Id, "EVENTOS", "warn", $"Eliminó evento de calendario #{id}", null, ip);
                }
                return resultado;
            })
            .RequirePermission(Permissions.EventosManage)
            .WithSummary("Elimina un evento de la base de datos MariaDB.")
            .DisableAntiforgery();

            // Generación de comprobante PDF individual
            group.MapPost("/generar-volante-pdf", async (NominaItemDto item, string? conceptoPeriodo, IPdfService pdfService, AppDbContext db, HttpContext httpContext) =>
            {
                if (item == null) return Results.BadRequest(new { mensaje = "Los datos del empleado son requeridos." });

                item.NormalizarCalculos();

                // Concepto dinámico por defecto
                string ordenQuincena = DateTime.UtcNow.Day <= 15 ? "Primera" : "Segunda";
                string conceptoFallback = $"{ordenQuincena} Quincena - Mes {DateTime.UtcNow.Month} {DateTime.UtcNow.Year}";
                string concepto = string.IsNullOrWhiteSpace(conceptoPeriodo) ? conceptoFallback : conceptoPeriodo;

                var pdfBytes = pdfService.GenerarVolantePdf(item, concepto);

                var currentUser = httpContext.Items["CurrentUser"] as Usuario;
                if (currentUser != null)
                {
                    var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                    await AuditoriaHelper.RegistrarAsync(
                        db,
                        currentUser.Id,
                        "NOMINA",
                        "info",
                        $"Generó volante PDF para #{item.CodigoEmpleado}",
                        $"{item.NombreEmpleado} • {concepto}",
                        ip
                    );
                }

                return Results.File(pdfBytes, "application/pdf", $"Volante_{item.CodigoEmpleado}.pdf");
            })
            .RequirePermission(Permissions.VolantesSend)
            .WithSummary("Generar el PDF del volante de pago quincenal para un empleado.")
            .DisableAntiforgery();

            // Envío de volantes de pago por correo
            group.MapPost("/enviar-volantes-correo", async (EnviarVolantesRequestDto request, EnviarVolantesCommandHandler handler, AppDbContext db, HttpContext httpContext) =>
            {
                var resultado = await handler.HandleAsync(new EnviarVolantesCommand(request.Items, request.ConceptoPeriodo, request.SmtpConfig));
                var currentUser = httpContext.Items["CurrentUser"] as Usuario;
                if (currentUser != null)
                {
                    var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                    int totalEnviados = request.Items?.Count ?? 0;
                    await AuditoriaHelper.RegistrarAsync(
                        db,
                        currentUser.Id,
                        "NOMINA",
                        "action",
                        "Envío masivo de volantes por correo",
                        $"{totalEnviados} volantes distribuidos • {request.ConceptoPeriodo}",
                        ip
                    );
                }
                return resultado;
            })
            .RequirePermission(Permissions.VolantesSend)
            .WithSummary("Genera y envía por correo masivamente los volantes de pago en PDF.")
            .DisableAntiforgery();

            // Sugerencia automática de período fiscal
            group.MapGet("/periodo-sugerido", () =>
            {
                var hoy = DateTime.Now;
                string quincena = hoy.Day <= 15 ? "1Q" : "2Q";
                int mes = hoy.Month;
                string concepto = $"Nómina Quincenal {quincena} - Mes {mes}";
                return Results.Ok(new
                {
                    quincena,
                    mes,
                    concepto
                });
            })
            .RequireSession()
            .WithSummary("Obtiene la quincena, mes y concepto fiscal sugerido desde el servidor.");

            // Recálculo de totales de vista previa
            group.MapPost("/recalcular", (List<NominaItemDto> items) =>
            {
                var itemsNomina = items ?? new List<NominaItemDto>();
                decimal totalDevengado = 0;
                decimal totalDeducciones = 0;
                decimal totalNeto = 0;

                foreach (var item in itemsNomina)
                {
                    item.NormalizarCalculos();
                    totalDevengado += item.TotalDevengado;
                    totalDeducciones += item.TotalDeducciones;
                    totalNeto += item.NetoAPagar;
                }

                return Results.Ok(new
                {
                    items = itemsNomina,
                    resumenTotales = new
                    {
                        totalDevengado,
                        totalDeducciones,
                        totalNeto
                    }
                });
            })
            .RequirePermission(Permissions.NominaProcess)
            .WithSummary("Recalcula el Neto a Pagar de cada ítem y los totales generales en el servidor.")
            .DisableAntiforgery();
            

            group.MapGet("/exportar-excel/{id:int}", async (int id, ObtenerExportacionNominaQueryHandler handler, AppDbContext db, HttpContext httpContext) =>
            {
                var resultado = await handler.HandleAsync(id);
                if (resultado == null) return Results.NotFound(new { mensaje = "No se encontró el período de nómina." });

                var currentUser = httpContext.Items["CurrentUser"] as Usuario;
                if (currentUser != null)
                {
                    var ip = httpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                    await AuditoriaHelper.RegistrarAsync(
                        db,
                        currentUser.Id,
                        "NOMINA",
                        "info",
                        $"Exportó nómina #{id} a Excel",
                        resultado.Value.NombreArchivo,
                        ip
                    );
                }

                return Results.File(resultado.Value.Bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", resultado.Value.NombreArchivo);
            })
            .RequirePermission(Permissions.NominaRead)
            .WithSummary("Exporta el detalle de una nómina procesada a Excel (.xlsx).");
        }
    }
}