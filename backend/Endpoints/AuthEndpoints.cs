using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace backend.Endpoints
{
    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
        {
            var authGroup = app.MapGroup("/api/auth").WithTags("Autenticación");

            authGroup.MapPost("/login", async (LoginRequestDto request, IAuthService authService, HttpContext httpContext) =>
            {
                var ipCliente = httpContext.Connection.RemoteIpAddress?.ToString() ?? "127.0.0.1";
                var result = await authService.IniciarSesionAsync(request, ipCliente);
                return result.Exitoso
                    ? Results.Ok(result.Datos)
                    : Results.Json(new { message = result.Error }, statusCode: result.StatusCode);
            })
            .RequireRateLimiting("LoginLimiter");

            authGroup.MapPost("/verificar-sesion", async (VerificarSesionRequestDto request, IAuthService authService) =>
            {
                var result = await authService.VerificarSesionAsync(request.Token);
                return result.Exitoso
                    ? Results.Ok(result.Datos)
                    : Results.Json(new { message = result.Error }, statusCode: result.StatusCode);
            });

            authGroup.MapPost("/cerrar-sesion", async (CerrarSesionRequestDto request, IAuthService authService) =>
            {
                await authService.CerrarSesionAsync(request.Token);
                return Results.Ok(new { message = "Sesión cerrada correctamente." });
            });
        }
    }
}
