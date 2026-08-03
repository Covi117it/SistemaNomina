using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;

namespace backend.Endpoints
{
    public static class EmpleadosEndpoints
    {
        public static void MapEmpleadosEndPoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/empleados")
                           .WithTags("Empleados");

            group.MapGet("/", async (AppDbContext db) =>
            {
                var lista = await db.Empleados
                                    .AsNoTracking()
                                    .OrderBy(e => e.Codigo)
                                    .ToListAsync();
                return Results.Ok(lista);
            })
            .WithSummary("Obtiene la lista completa de empleados ordenados por código.");

            group.MapPost("/", async (Empleado nuevoEmpleado, AppDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(nuevoEmpleado.Codigo))
                {
                    return Results.BadRequest(new { mensaje = "El Código del empleado es obligatorio." });
                }
                var existente = await db.Empleados.FindAsync(nuevoEmpleado.Codigo);
                if (existente != null)
                {
                    return Results.BadRequest(new { mensaje = $"Ya existe un empleado registrado con el código '{nuevoEmpleado.Codigo}'." });
                }
                nuevoEmpleado.FechaCreacion = DateTime.UtcNow;
                nuevoEmpleado.FechaActualizacion = DateTime.UtcNow;
                await db.Empleados.AddAsync(nuevoEmpleado);
                await db.SaveChangesAsync();
                return Results.Created($"/api/empleados/{nuevoEmpleado.Codigo}", nuevoEmpleado);
            })
            .WithSummary("Registra un nuevo empleado individual manualmente.");

            group.MapPut("/{codigo}", async (string codigo, Empleado datosEditados, AppDbContext db) =>
            {
                var existente = await db.Empleados.FindAsync(codigo);
                if (existente == null)
                {
                    return Results.NotFound(new { mensaje = $"No se encontró ningún empleado con el código '{codigo}'." });
                }
                existente.Nombres = datosEditados.Nombres;
                existente.TipoDocumento = datosEditados.TipoDocumento;
                existente.Cedula = datosEditados.Cedula;
                existente.EStatus = string.IsNullOrWhiteSpace(datosEditados.EStatus) ? "ACTIVO" : datosEditados.EStatus;
                existente.Puesto = datosEditados.Puesto;
                existente.FechaIngreso = datosEditados.FechaIngreso;
                existente.FechaNacimiento = datosEditados.FechaNacimiento;
                existente.Email = datosEditados.Email;
                existente.FechaActualizacion = DateTime.UtcNow;
                await db.SaveChangesAsync();
                return Results.Ok(existente);
            })
            .WithSummary("Actualiza los datos de un empleado por su código.");

            group.MapPost("/guardar-lote", async (List<Empleado> empleadosLote, AppDbContext db) =>
            {
                if (empleadosLote == null || empleadosLote.Count == 0)
                {
                    return Results.BadRequest(new { mensaje = "La lista de empleados a guardar no contiene registros." });
                }
                int procesados = 0;
                foreach (var emp in empleadosLote)
                {
                    if (string.IsNullOrWhiteSpace(emp.Codigo)) continue;
                    var existente = await db.Empleados.FindAsync(emp.Codigo);
                    if (existente != null)
                    {
                        existente.Nombres = emp.Nombres;
                        existente.TipoDocumento = emp.TipoDocumento;
                        existente.Cedula = emp.Cedula;
                        existente.EStatus = string.IsNullOrWhiteSpace(emp.EStatus) ? "ACTIVO" : emp.EStatus;
                        existente.Puesto = emp.Puesto;
                        existente.FechaIngreso = emp.FechaIngreso;
                        existente.FechaNacimiento = emp.FechaNacimiento;
                        existente.Email = emp.Email;
                        existente.FechaActualizacion = DateTime.UtcNow;
                    }
                    else
                    {
                        emp.EStatus = string.IsNullOrWhiteSpace(emp.EStatus) ? "ACTIVO" : emp.EStatus;
                        emp.FechaCreacion = DateTime.UtcNow;
                        emp.FechaActualizacion = DateTime.UtcNow;
                        await db.Empleados.AddAsync(emp);
                    }
                    procesados++;
                }
                await db.SaveChangesAsync();
                return Results.Ok(new 
                { 
                    mensaje = "Sincronización masiva de empleados completada con éxito.", 
                    totalProcesados = procesados 
                });
            })
            .WithSummary("Guarda o actualiza masivamente el lote de empleados.");

            group.MapDelete("/{codigo}", async (string codigo, AppDbContext db) =>
            {
                var existente = await db.Empleados.FindAsync(codigo);
                if (existente == null)
                {
                    return Results.NotFound(new { mensaje = $"No se encontró ningún empleado con el código '{codigo}'." });
                }
                db.Empleados.Remove(existente);
                await db.SaveChangesAsync();
                return Results.Ok(new { mensaje = $"Empleado con código '{codigo}' eliminado correctamente." });
            })
            .WithSummary("Elimina un empleado individual por su código.");

            group.MapPost("/toggle-estatus-todos", async (string nuevoEstatus, AppDbContext db) =>
            {
                if (string.IsNullOrWhiteSpace(nuevoEstatus))
                {
                    return Results.BadRequest(new { mensaje = "Debe especificar un estatus válido (ej. ACTIVO o INACTIVO)." });
                }
                string estatusNormalizado = nuevoEstatus.ToUpperInvariant().Trim();
                int filasAfectadas = await db.Empleados
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(e => e.EStatus, estatusNormalizado)
                        .SetProperty(e => e.FechaActualizacion, DateTime.UtcNow));
                return Results.Ok(new 
                { 
                    mensaje = $"Se actualizó el estatus a '{estatusNormalizado}' para todos los empleados.", 
                    totalAfectados = filasAfectadas 
                });
            })
            .WithSummary("Cambia el estatus de todos los empleados masivamente a ACTIVO o INACTIVO.");

            group.MapDelete("/vaciar-bd", async (AppDbContext db) =>
            {
                int eliminados = await db.Empleados.ExecuteDeleteAsync();
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