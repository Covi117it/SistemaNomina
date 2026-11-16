using System;
using System.Security.Cryptography;
using System.Threading.Tasks;
using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _db;
        private readonly IMemoryCache _cache;
        private const string CacheKeyPrefix = "auth_session_";

        public AuthService(AppDbContext db, IMemoryCache cache)
        {
            _db = db;
            _cache = cache;
        }

        public async Task<AuthResult<LoginResponseDto>> IniciarSesionAsync(LoginRequestDto request, string ipCliente)
        {
            var emailNormalizado = request.Email.Trim().ToLower();

            var usuario = await _db.Usuarios
                .FirstOrDefaultAsync(u => u.Email.ToLower() == emailNormalizado);

            if (usuario == null)
            {
                return new AuthResult<LoginResponseDto>(false, "Correo electrónico o contraseña incorrectos.", StatusCodes.Status400BadRequest);
            }

            if (!usuario.Activo)
            {
                return new AuthResult<LoginResponseDto>(false, "Este usuario se encuentra inactivo. Contacte al administrador.", StatusCodes.Status400BadRequest);
            }

            bool passwordValida = BCrypt.Net.BCrypt.Verify(request.Password, usuario.PasswordHash);
            if (!passwordValida)
            {
                return new AuthResult<LoginResponseDto>(false, "Correo electrónico o contraseña incorrectos.", StatusCodes.Status400BadRequest);
            }

            usuario.UltimoAcceso = DateTime.UtcNow;

            string tokenGenerado = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));
            var expiracion = request.RememberMe 
                ? DateTime.UtcNow.AddDays(30) 
                : DateTime.UtcNow.AddHours(24);

            var nuevaSesion = new SesionUsuario
            {
                UsuarioId = usuario.Id,
                Token = tokenGenerado,
                FechaCreacion = DateTime.UtcNow,
                FechaExpiracion = expiracion,
                UltimoUso = DateTime.UtcNow,
                Dispositivo = "Tauri Desktop",
                Activa = true
            };

            _db.SesionesUsuarios.Add(nuevaSesion);
            await _db.SaveChangesAsync();

            await AuditoriaHelper.RegistrarAsync(
                _db, 
                usuario.Id, 
                "AUTH", 
                "info", 
                "Inicio de sesión exitoso en el sistema", 
                "Sesión iniciada vía cliente de escritorio", 
                ipCliente
            );

            var response = new LoginResponseDto(
                usuario.Id,
                usuario.NombreCompleto,
                usuario.Email,
                usuario.Rol,
                usuario.PermisosJson,
                usuario.Activo,
                tokenGenerado
            );

            return new AuthResult<LoginResponseDto>(true, null, StatusCodes.Status200OK, response);
        }

        public async Task<AuthResult<LoginResponseDto>> VerificarSesionAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return new AuthResult<LoginResponseDto>(false, "Token de sesión no proporcionado.", StatusCodes.Status400BadRequest);
            }

            var sesion = await _db.SesionesUsuarios
                .Include(s => s.Usuario)
                .FirstOrDefaultAsync(s => s.Token == token && s.Activa);

            if (sesion == null)
            {
                _cache.Remove($"{CacheKeyPrefix}{token}");
                return new AuthResult<LoginResponseDto>(false, "Sesión no encontrada.", StatusCodes.Status401Unauthorized);
            }

            if (sesion.FechaExpiracion < DateTime.UtcNow)
            {
                _cache.Remove($"{CacheKeyPrefix}{token}");
                sesion.Activa = false;
                await _db.SaveChangesAsync();
                return new AuthResult<LoginResponseDto>(false, "Sesión expirada.", StatusCodes.Status401Unauthorized);
            }

            if (!sesion.Usuario.Activo)
            {
                _cache.Remove($"{CacheKeyPrefix}{token}");
                sesion.Activa = false;
                await _db.SaveChangesAsync();
                return new AuthResult<LoginResponseDto>(false, "El usuario se encuentra inactivo. Contacte al administrador.", StatusCodes.Status400BadRequest);
            }

            // Renueva la sesión por otros 30 días
            sesion.UltimoUso = DateTime.UtcNow;
            sesion.FechaExpiracion = DateTime.UtcNow.AddDays(30);
            sesion.Usuario.UltimoAcceso = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            _cache.Remove($"{CacheKeyPrefix}{token}");

            var response = new LoginResponseDto(
                sesion.Usuario.Id,
                sesion.Usuario.NombreCompleto,
                sesion.Usuario.Email,
                sesion.Usuario.Rol,
                sesion.Usuario.PermisosJson,
                sesion.Usuario.Activo,
                sesion.Token
            );

            return new AuthResult<LoginResponseDto>(true, null, StatusCodes.Status200OK, response);
        }

        public async Task CerrarSesionAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token)) return;

            _cache.Remove($"{CacheKeyPrefix}{token}");
            var sesion = await _db.SesionesUsuarios
                .FirstOrDefaultAsync(s => s.Token == token);

            if (sesion != null)
            {
                sesion.Activa = false;
                await _db.SaveChangesAsync();
            }
        }

        public async Task<SesionUsuario?> ObtenerSesionActivaAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token)) return null;

            string cacheKey = $"{CacheKeyPrefix}{token}";
            if (_cache.TryGetValue(cacheKey, out SesionUsuario? cachedSesion) && cachedSesion != null)
            {
                return cachedSesion;
            }

            var sesion = await _db.SesionesUsuarios
                .Include(s => s.Usuario)
                .FirstOrDefaultAsync(s => s.Token == token && s.Activa);

            if (sesion != null && sesion.FechaExpiracion > DateTime.UtcNow && sesion.Usuario != null && sesion.Usuario.Activo)
            {
                var tiempoRestante = sesion.FechaExpiracion - DateTime.UtcNow;
                var ttl = tiempoRestante < TimeSpan.FromMinutes(2) ? tiempoRestante : TimeSpan.FromMinutes(2);
                if (ttl > TimeSpan.Zero)
                {
                    _cache.Set(cacheKey, sesion, ttl);
                }
            }

            return sesion;
        }

        public async Task InvalidarSesionAsync(string token, SesionUsuario? sesionExistente = null)
        {
            if (string.IsNullOrWhiteSpace(token)) return;

            _cache.Remove($"{CacheKeyPrefix}{token}");
            if (sesionExistente != null)
            {
                sesionExistente.Activa = false;
                await _db.SaveChangesAsync();
            }
            else
            {
                var s = await _db.SesionesUsuarios.FirstOrDefaultAsync(x => x.Token == token);
                if (s != null)
                {
                    s.Activa = false;
                    await _db.SaveChangesAsync();
                }
            }
        }
    }
}
