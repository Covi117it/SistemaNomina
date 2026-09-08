using System;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace backend.Common
{
    public class SessionAuthFilter : IEndpointFilter
    {
        private readonly string? _permisoRequerido;

        public SessionAuthFilter(string? permisoRequerido = null)
        {
            _permisoRequerido = permisoRequerido;
        }

        public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
        {
            var httpContext = context.HttpContext;
            var authHeader = httpContext.Request.Headers["Authorization"].FirstOrDefault();


            if (string.IsNullOrWhiteSpace(authHeader))
            {
                return Results.Json(
                    new { message = "No autenticado: falta cabecera de autorización." },
                    statusCode: StatusCodes.Status401Unauthorized
                );
            }


            string token = authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase)
                ? authHeader.Substring(7).Trim()
                : authHeader.Trim();

            if (string.IsNullOrWhiteSpace(token))
            {
                return Results.Json(
                    new { message = "No autenticado: token no proporcionado." },
                    statusCode: StatusCodes.Status401Unauthorized
                );
            }


            var db = httpContext.RequestServices.GetRequiredService<AppDbContext>();

            var sesion = await db.SesionesUsuarios
                .Include(s => s.Usuario)
                .FirstOrDefaultAsync(s => s.Token == token && s.Activa);

            if (sesion == null || sesion.FechaExpiracion < DateTime.UtcNow)
            {
                if (sesion != null)
                {
                    sesion.Activa = false;
                    await db.SaveChangesAsync();
                }
                return Results.Json(
                    new { message = "Sesión inválida o expirada." },
                    statusCode: StatusCodes.Status401Unauthorized
                );
            }


            if (sesion.Usuario == null || !sesion.Usuario.Activo)
            {
                return Results.Json(
                    new { message = "El usuario se encuentra inactivo." },
                    statusCode: StatusCodes.Status401Unauthorized
                );
            }

            httpContext.Items["CurrentUser"] = sesion.Usuario;

            if (!string.IsNullOrWhiteSpace(_permisoRequerido))
            {
                bool autorizado = Permissions.TienePermiso(sesion.Usuario, _permisoRequerido);
                if (!autorizado)
                {
                    return Results.Json(
                        new { message = $"Acceso denegado: requiere el permiso '{_permisoRequerido}'." },
                        statusCode: StatusCodes.Status403Forbidden
                    );
                }
            }

            return await next(context);
        }
    }

  
    public static class SessionAuthExtensions
    {

        public static RouteHandlerBuilder RequireSession(this RouteHandlerBuilder builder)
        {
            return builder.AddEndpointFilter(new SessionAuthFilter());
        }

        public static RouteHandlerBuilder RequirePermission(this RouteHandlerBuilder builder, string permiso)
        {
            return builder.AddEndpointFilter(new SessionAuthFilter(permiso));
        }

  
        public static RouteGroupBuilder RequireSession(this RouteGroupBuilder group)
        {
            return group.AddEndpointFilter(new SessionAuthFilter());
        }

        public static RouteGroupBuilder RequirePermission(this RouteGroupBuilder group, string permiso)
        {
            return group.AddEndpointFilter(new SessionAuthFilter(permiso));
        }
    }
}