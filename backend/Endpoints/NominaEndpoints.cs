using System;
using System.Collections.Generic;
using backend.Application.Features.Nomina.Commands;
using backend.Application.Features.Nomina.Queries;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Http;

namespace backend.Endpoints
{
    public static class NominaEndpoints
    {
        public static void MapNominaEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/nomina")
                           .WithTags("Nómina Quincenal");

            // 1. Preview del Excel (Cruce automático con BD)
            group.MapPost("/preview-quincena", async (IFormFile file, PreviewQuincenaQueryHandler handler) =>
                await handler.HandleAsync(new PreviewQuincenaQuery(file))
            )
            .WithSummary("Lee el Excel de pagos quincenales y realiza el cruce automático con la BD.")
            .DisableAntiforgery();

            // 2. Procesar y Guardar Quincena en SQLite
            group.MapPost("/procesar-quincena", async (List<NominaItemDto> itemsNomina, int? mes, string? quincena, string? concepto, ProcesarQuincenaCommandHandler handler) =>
                await handler.HandleAsync(new ProcesarQuincenaCommand(itemsNomina, mes, quincena, concepto))
            )
            .WithSummary("Guarda la cabecera y detalles del pago quincenal en SQLite (con bloqueo para no registrados).")
            .DisableAntiforgery();

            // 3. Consultar Histórico (con búsqueda directa en BD)
            group.MapGet("/historico", async (int? anio, int? mes, string? quincena, string? search, ObtenerHistoricoQueryHandler handler) =>
                await handler.HandleAsync(new ObtenerHistoricoQuery(anio, mes, quincena, search))
            )
            .WithSummary("Obtiene los registros históricos de nóminas guardadas en SQLite.");

            // 3.1. Obtener Eventos del Calendario de Nóminas desde el Servidor
            group.MapGet("/eventos-calendario", async (int? anio, int? mes, ObtenerEventosCalendarioQueryHandler handler) =>
                await handler.HandleAsync(new ObtenerEventosCalendarioQuery(anio, mes))
            )
            .WithSummary("Obtiene los eventos y cálculos de nómina para el calendario en el servidor.");

            // 3.2. Crear Nuevo Evento en MariaDB
            group.MapPost("/eventos", async (CrearEventoDto dto, CrearEventoCommandHandler handler) =>
                await handler.HandleAsync(new CrearEventoCommand(dto))
            )
            .WithSummary("Guarda un nuevo evento de la agenda en la base de datos MariaDB.")
            .DisableAntiforgery();

            // 3.3. Editar Evento Existente en MariaDB
            group.MapPut("/eventos/{id:int}", async (int id, EditarEventoDto dto, EditarEventoCommandHandler handler) =>
                await handler.HandleAsync(new EditarEventoCommand(id, dto))
            )
            .WithSummary("Actualiza un evento existente en la base de datos MariaDB.")
            .DisableAntiforgery();

            // 3.4. Eliminar Evento de MariaDB
            group.MapDelete("/eventos/{id:int}", async (int id, EliminarEventoCommandHandler handler) =>
                await handler.HandleAsync(new EliminarEventoCommand(id))
            )
            .WithSummary("Elimina un evento de la base de datos MariaDB.")
            .DisableAntiforgery();

            // 4. Generar Volante PDF Individual
            group.MapPost("/generar-volante-pdf", (NominaItemDto item, string? conceptoPeriodo, IPdfService pdfService) =>
            {
                if (item == null) return Results.BadRequest(new { mensaje = "Los datos del empleado son requeridos." });

                // Generar concepto dinámico si no fue enviado
                string ordenQuincena = DateTime.UtcNow.Day <= 15 ? "Primera" : "Segunda";
                string conceptoFallback = $"{ordenQuincena} Quincena - Mes {DateTime.UtcNow.Month} {DateTime.UtcNow.Year}";
                string concepto = string.IsNullOrWhiteSpace(conceptoPeriodo) ? conceptoFallback : conceptoPeriodo;

                var pdfBytes = pdfService.GenerarVolantePdf(item, concepto);
                return Results.File(pdfBytes, "application/pdf", $"Volante_{item.CodigoEmpleado}.pdf");
            })
            .WithSummary("Generar el PDF del volante de pago quincenal para un empleado.")
            .DisableAntiforgery();

            // 5. Enviar Volantes por Correo
            group.MapPost("/enviar-volantes-correo", async (EnviarVolantesRequestDto request, EnviarVolantesCommandHandler handler) =>
                await handler.HandleAsync(new EnviarVolantesCommand(request.Items, request.ConceptoPeriodo, request.SmtpConfig))
            )
            .WithSummary("Genera y envía por correo masivamente los volantes de pago en PDF.")
            .DisableAntiforgery();

            // 6. Obtener Período Fiscal Sugerido
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
            .WithSummary("Obtiene la quincena, mes y concepto fiscal sugerido desde el servidor.");

            // 7. Recalcular Totales de Vista Previa
            group.MapPost("/recalcular", (List<NominaItemDto> items) =>
            {
                var itemsNomina = items ?? new List<NominaItemDto>();
                decimal totalDevengado = 0;
                decimal totalDeducciones = 0;
                decimal totalNeto = 0;

                foreach (var item in itemsNomina)
                {
                    item.NetoAPagar = item.TotalDevengado - item.TotalDeducciones;
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
            .WithSummary("Recalcula el Neto a Pagar de cada ítem y los totales generales en el servidor.")
            .DisableAntiforgery();
            

            group.MapGet("/exportar-excel/{id:int}", async (int id, ObtenerExportacionNominaQueryHandler handler) =>
            {
                var resultado = await handler.HandleAsync(id);
                if (resultado == null) return Results.NotFound(new { mensaje = "No se encontró el período de nómina." });
                return Results.File(resultado.Value.Bytes, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", resultado.Value.NombreArchivo);
            })
            .WithSummary("Exporta el detalle de una nómina procesada a Excel (.xlsx).");
        }
    }
}