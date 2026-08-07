using System.Collections.Generic;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace backend.Endpoints
{
    public static class EmpleadosEndpoints
    {
        public static void MapEmpleadosEndPoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/empleados")
                           .WithTags("Empleados");

            // 1. Obtener empleados con búsqueda, filtrado, conteos y paginación desde servidor
            group.MapGet("/", async (string? search, string? status, int? page, int? pageSize, IEmpleadoService empleadoService) =>
            {
                int pageNum = page ?? 1;
                int sizeNum = pageSize ?? 10;
                var resultado = await empleadoService.ObtenerEmpleadosAsync(search, status, pageNum, sizeNum);
                return Results.Ok(new
                {
                    totalTotal = resultado.TotalTotal,
                    totalActivos = resultado.TotalActivos,
                    totalInactivos = resultado.TotalInactivos,
                    totalFiltrados = resultado.TotalFiltrados,
                    page = resultado.Page,
                    pageSize = resultado.PageSize,
                    totalPages = resultado.TotalPages,
                    empleados = resultado.Empleados
                });
            })
            .WithSummary("Obtiene la lista de empleados con conteos de resumen y filtrado desde SQLite.");

            // 1.1 Obtener siguiente código sugerido para un nuevo empleado
            group.MapGet("/siguiente-codigo", async (IEmpleadoService empleadoService) =>
            {
                var codigo = await empleadoService.ObtenerSiguienteCodigoSugeridoAsync();
                return Results.Ok(new { siguienteCodigo = codigo });
            })
            .WithSummary("Obtiene el siguiente código autoincrementable sugerido de empleado desde el servidor.");

            // 2. Registra un nuevo empleado individual (Valida Cédula/Pasaporte)
            group.MapPost("/", async (Empleado nuevoEmpleado, IEmpleadoService empleadoService) =>
            {
                var resultado = await empleadoService.CrearEmpleadoAsync(nuevoEmpleado);
                if (!resultado.Exito)
                {
                    return Results.BadRequest(new { mensaje = resultado.MensajeError });
                }
                return Results.Created($"/api/empleados/{resultado.Empleado!.Codigo}", resultado.Empleado);
            })
            .WithSummary("Registra un nuevo empleado individual (con validación de documento).");

            // 3. Actualiza los datos de un empleado por su código
            group.MapPut("/{codigo}", async (string codigo, Empleado datosEditados, IEmpleadoService empleadoService) =>
            {
                var resultado = await empleadoService.ActualizarEmpleadoAsync(codigo, datosEditados);
                if (!resultado.Exito)
                {
                    if (resultado.MensajeError != null && resultado.MensajeError.Contains("No se encontró"))
                    {
                        return Results.NotFound(new { mensaje = resultado.MensajeError });
                    }
                    return Results.BadRequest(new { mensaje = resultado.MensajeError });
                }
                return Results.Ok(resultado.Empleado);
            })
            .WithSummary("Actualiza los datos de un empleado por su código.");

            // 4. Guarda o actualiza masivamente el lote de empleados
            group.MapPost("/guardar-lote", async (List<Empleado> empleadosLote, IEmpleadoService empleadoService) =>
            {
                if (empleadosLote == null || empleadosLote.Count == 0)
                {
                    return Results.BadRequest(new { mensaje = "La lista de empleados a guardar no contiene registros." });
                }
                int procesados = await empleadoService.GuardarLoteAsync(empleadosLote);
                return Results.Ok(new 
                { 
                    mensaje = "Sincronización masiva de empleados completada con éxito.", 
                    totalProcesados = procesados 
                });
            })
            .WithSummary("Guarda o actualiza masivamente el lote de empleados.");

            // 5. Elimina un empleado individual por su código
            group.MapDelete("/{codigo}", async (string codigo, IEmpleadoService empleadoService) =>
            {
                bool eliminado = await empleadoService.EliminarEmpleadoAsync(codigo);
                if (!eliminado)
                {
                    return Results.NotFound(new { mensaje = $"No se encontró ningún empleado con el código '{codigo}'." });
                }
                return Results.Ok(new { mensaje = $"Empleado con código '{codigo}' eliminado correctamente." });
            })
            .WithSummary("Elimina un empleado individual por su código.");

            // 6. Cambia el estatus de todos los empleados masivamente
            group.MapPost("/toggle-estatus-todos", async (string nuevoEstatus, IEmpleadoService empleadoService) =>
            {
                if (string.IsNullOrWhiteSpace(nuevoEstatus))
                {
                    return Results.BadRequest(new { mensaje = "Debe especificar un estatus válido (ej. ACTIVO o INACTIVO)." });
                }
                int filasAfectadas = await empleadoService.CambiarEstatusTodosAsync(nuevoEstatus);
                return Results.Ok(new 
                { 
                    mensaje = $"Se actualizó el estatus a '{nuevoEstatus.ToUpperInvariant().Trim()}' para todos los empleados.", 
                    totalAfectados = filasAfectadas 
                });
            })
            .WithSummary("Cambia el estatus de todos los empleados masivamente a ACTIVO o INACTIVO.");

            // 7. Elimina TODOS los registros de la tabla de empleados
            group.MapDelete("/vaciar-bd", async (IEmpleadoService empleadoService) =>
            {
                int eliminados = await empleadoService.VaciarBaseDatosAsync();
                return Results.Ok(new 
                { 
                    mensaje = "La base de datos de empleados ha sido vaciada completamente.", 
                    totalEliminados = eliminados 
                });
            })
            .WithSummary("Elimina TODOS los registros de la tabla de empleados.");
        }
    }
}