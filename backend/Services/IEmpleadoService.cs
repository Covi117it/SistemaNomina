using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Models;

namespace backend.Services
{
    public record EmpleadosConsultaResult(
        int TotalTotal,
        int TotalActivos,
        int TotalInactivos,
        int TotalFiltrados,
        int Page,
        int PageSize,
        int TotalPages,
        List<Empleado> Empleados
    );

    public record EmpleadoOperacionResult(
        bool Exito,
        string? MensajeError,
        Empleado? Empleado
    );

    public interface IEmpleadoService
    {
        Task<EmpleadosConsultaResult> ObtenerEmpleadosAsync(string? search, string? status, int page = 1, int pageSize = 10);
        Task<EmpleadoOperacionResult> CrearEmpleadoAsync(Empleado nuevoEmpleado);
        Task<EmpleadoOperacionResult> ActualizarEmpleadoAsync(string codigo, Empleado datosEditados);
        Task<int> GuardarLoteAsync(List<Empleado> empleadosLote);
        Task<bool> EliminarEmpleadoAsync(string codigo);
        Task<int> CambiarEstatusTodosAsync(string nuevoEstatus);
        Task<int> VaciarBaseDatosAsync();
        Task<string> ObtenerSiguienteCodigoSugeridoAsync();
    }
}