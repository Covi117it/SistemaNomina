using System;
using System.ComponentModel.DataAnnotations;

namespace backend.DTOs
{
    public record LoginRequestDto(
        [Required, EmailAddress] string Email,
        [Required] string Password,
        bool RememberMe = false
    );

    public record LoginResponseDto(
        int Id,
        string NombreCompleto,
        string Email,
        string Rol,
        string PermisosJson,
        bool Activo,
        string? TokenSesion = null
    );

    public record UsuarioDto(
        int Id,
        string NombreCompleto,
        string Email,
        string Rol,
        string PermisosJson,
        bool Activo,
        DateTime? UltimoAcceso,
        DateTime FechaCreacion
    );

    public record CrearUsuarioDto(
        [Required, MaxLength(150)] string NombreCompleto,
        [Required, EmailAddress, MaxLength(150)] string Email,
        [Required, MinLength(6)] string Password,
        [Required] string Rol,
        string PermisosJson = "[]"
    );

    public record ActualizarUsuarioDto(
        [Required, MaxLength(150)] string NombreCompleto,
        [Required, EmailAddress, MaxLength(150)] string Email,
        string? Password, 
        [Required] string Rol,
        string PermisosJson,
        bool Activo
    );

    public record VerificarSesionRequestDto(
        [Required] string Token
    );

    public record CerrarSesionRequestDto(
        [Required] string Token
    );

    public record AuditoriaAccionDto(
        int Id,
        int UsuarioId,
        string Fecha,
        string Hora,
        string Modulo,
        string Tipo,
        string Tarea,
        string? Detalles,
        string? DireccionIp,
        string? Dispositivo,
        DateTime FechaHora
    );
}