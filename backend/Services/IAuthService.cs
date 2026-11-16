using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public record AuthResult<T>(bool Exitoso, string? Error, int StatusCode, T? Datos = default);

    public interface IAuthService
    {
        Task<AuthResult<LoginResponseDto>> IniciarSesionAsync(LoginRequestDto request, string ipCliente);
        Task<AuthResult<LoginResponseDto>> VerificarSesionAsync(string token);
        Task CerrarSesionAsync(string token);
        Task<SesionUsuario?> ObtenerSesionActivaAsync(string token);
        Task InvalidarSesionAsync(string token, SesionUsuario? sesionExistente = null);
    }
}
