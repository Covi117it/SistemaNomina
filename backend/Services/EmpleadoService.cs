using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace backend.Services
{
    public class EmpleadoService : IEmpleadoService
    {
        private readonly AppDbContext _db;
        private readonly IMemoryCache _cache;
        private const string CacheKeyTotales = "empleados_conteos_totales";

        public EmpleadoService(AppDbContext db, IMemoryCache cache)
        {
            _db = db;
            _cache = cache;
        }

        public async Task<EmpleadosConsultaResult> ObtenerEmpleadosAsync(string? search, string? status, int page = 1, int pageSize = 10)
        {
            var query = _db.Empleados.AsNoTracking().AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var term = search.Trim().ToLower();
                bool isShortCode = term.Length <= 3 && !term.Contains('-');

                query = query.Where(e =>
                    e.Codigo.ToLower().Contains(term) ||
                    e.Nombres.ToLower().Contains(term) ||
                    (e.Puesto != null && e.Puesto.ToLower().Contains(term)) ||
                    (!isShortCode && e.Cedula != null && e.Cedula.ToLower().Contains(term))
                );
            }

            if (!string.IsNullOrWhiteSpace(status) && status != "TODOS")
            {
                query = query.Where(e => e.EStatus == status);
            }

            if (!_cache.TryGetValue(CacheKeyTotales, out (int act, int inact, int tot) conteos))
            {
                var conteosPorEstado = await _db.Empleados
                    .AsNoTracking()
                    .GroupBy(e => e.EStatus)
                    .Select(g => new { Status = g.Key, Count = g.Count() })
                    .ToListAsync();

                int act = conteosPorEstado.FirstOrDefault(x => x.Status == "ACTIVO")?.Count ?? 0;
                int inact = conteosPorEstado.FirstOrDefault(x => x.Status == "INACTIVO")?.Count ?? 0;
                int tot = conteosPorEstado.Sum(x => x.Count);
                conteos = (act, inact, tot);

                _cache.Set(CacheKeyTotales, conteos, TimeSpan.FromSeconds(60));
            }

            int totalFiltrados = await query.CountAsync();
            int size = pageSize > 0 ? pageSize : 10;
            int totalPages = (int)Math.Ceiling((double)totalFiltrados / size);
            if (totalPages == 0) totalPages = 1;
            int currentPage = page > 0 ? page : 1;

            var lista = await query.OrderBy(e => e.Codigo)
                                  .Skip((currentPage - 1) * size)
                                  .Take(size)
                                  .ToListAsync();

            return new EmpleadosConsultaResult(
                conteos.tot, 
                conteos.act, 
                conteos.inact, 
                totalFiltrados, 
                currentPage, 
                size, 
                totalPages, 
                lista
            );
        }

        public async Task<EmpleadoOperacionResult> CrearEmpleadoAsync(Empleado nuevoEmpleado)
        {
            if (string.IsNullOrWhiteSpace(nuevoEmpleado.Codigo))
            {
                nuevoEmpleado.Codigo = await ObtenerSiguienteCodigoSugeridoAsync();
            }
            else
            {
                var existente = await _db.Empleados.FindAsync(nuevoEmpleado.Codigo);
                if (existente != null)
                {
                    return new EmpleadoOperacionResult(false, $"Ya existe un empleado registrado con el código '{nuevoEmpleado.Codigo}'.", null);
                }
            }

            if (!ValidarYFormatearDocumento(nuevoEmpleado.Cedula, nuevoEmpleado.TipoDocumento, out var docFormateado, out var errorDoc))
            {
                return new EmpleadoOperacionResult(false, errorDoc, null);
            }
            nuevoEmpleado.Cedula = docFormateado;

            nuevoEmpleado.FechaCreacion = DateTime.UtcNow;
            nuevoEmpleado.FechaActualizacion = DateTime.UtcNow;

            await _db.Empleados.AddAsync(nuevoEmpleado);
            await _db.SaveChangesAsync();
            _cache.Remove(CacheKeyTotales);

            return new EmpleadoOperacionResult(true, null, nuevoEmpleado);
        }

        public async Task<EmpleadoOperacionResult> ActualizarEmpleadoAsync(string codigo, Empleado datosEditados)
        {
            var existente = await _db.Empleados.FindAsync(codigo);
            if (existente == null)
            {
                return new EmpleadoOperacionResult(false, $"No se encontró ningún empleado con el código '{codigo}'.", null);
            }

            if (!ValidarYFormatearDocumento(datosEditados.Cedula, datosEditados.TipoDocumento, out var docFormateado, out var errorDoc))
            {
                return new EmpleadoOperacionResult(false, errorDoc, null);
            }

            existente.Cedula = docFormateado;
            existente.Nombres = datosEditados.Nombres;
            existente.TipoDocumento = datosEditados.TipoDocumento;
            existente.EStatus = string.IsNullOrWhiteSpace(datosEditados.EStatus) ? "ACTIVO" : datosEditados.EStatus;
            existente.Puesto = datosEditados.Puesto;
            existente.FechaIngreso = datosEditados.FechaIngreso;
            existente.FechaNacimiento = datosEditados.FechaNacimiento;
            existente.Email = datosEditados.Email;
            existente.FechaActualizacion = DateTime.UtcNow;

            await _db.SaveChangesAsync();
            _cache.Remove(CacheKeyTotales);

            return new EmpleadoOperacionResult(true, null, existente);
        }

        public async Task<int> GuardarLoteAsync(List<Empleado> empleadosLote)
        {
            if (empleadosLote == null || empleadosLote.Count == 0) return 0;

            int procesados = 0;
            foreach (var emp in empleadosLote)
            {
                if (string.IsNullOrWhiteSpace(emp.Codigo)) continue;
                var existente = await _db.Empleados.FindAsync(emp.Codigo);
                ValidarYFormatearDocumento(emp.Cedula, emp.TipoDocumento, out var docFormateado, out _);

                if (existente != null)
                {
                    existente.Nombres = emp.Nombres;
                    existente.TipoDocumento = emp.TipoDocumento;
                    existente.Cedula = docFormateado;
                    existente.EStatus = string.IsNullOrWhiteSpace(emp.EStatus) ? "ACTIVO" : emp.EStatus;
                    existente.Puesto = emp.Puesto;
                    existente.FechaIngreso = emp.FechaIngreso;
                    existente.FechaNacimiento = emp.FechaNacimiento;
                    existente.Email = emp.Email;
                    existente.FechaActualizacion = DateTime.UtcNow;
                }
                else
                {
                    emp.Cedula = docFormateado;
                    emp.EStatus = string.IsNullOrWhiteSpace(emp.EStatus) ? "ACTIVO" : emp.EStatus;
                    emp.FechaCreacion = DateTime.UtcNow;
                    emp.FechaActualizacion = DateTime.UtcNow;
                    await _db.Empleados.AddAsync(emp);
                }
                procesados++;
            }
            await _db.SaveChangesAsync();
            _cache.Remove(CacheKeyTotales);
            return procesados;
        }

        public async Task<bool> EliminarEmpleadoAsync(string codigo)
        {
            var existente = await _db.Empleados.FindAsync(codigo);
            if (existente == null) return false;

            _db.Empleados.Remove(existente);
            await _db.SaveChangesAsync();
            _cache.Remove(CacheKeyTotales);
            return true;
        }

        public async Task<int> CambiarEstatusTodosAsync(string nuevoEstatus)
        {
            if (string.IsNullOrWhiteSpace(nuevoEstatus)) return 0;

            string estatusNormalizado = nuevoEstatus.ToUpperInvariant().Trim();
            int afectados = await _db.Empleados
                .ExecuteUpdateAsync(s => s
                    .SetProperty(e => e.EStatus, estatusNormalizado)
                    .SetProperty(e => e.FechaActualizacion, DateTime.UtcNow));
            if (afectados > 0)
            {
                _cache.Remove(CacheKeyTotales);
            }
            return afectados;
        }

        public async Task<string> ObtenerSiguienteCodigoSugeridoAsync()
        {
            var codigos = await _db.Empleados
                                  .AsNoTracking()
                                  .Select(e => e.Codigo)
                                  .ToListAsync();
            int maxNum = 0;
            foreach (var c in codigos)
            {
                if (int.TryParse(c, out int val) && val > maxNum)
                {
                    maxNum = val;
                }
            }
            return (maxNum + 1).ToString("D3");
        }

        private static bool ValidarYFormatearDocumento(string? cedula, string? tipoDocumento, out string? docFormateado, out string? error)
        {
            docFormateado = null;
            error = null;
            if (string.IsNullOrWhiteSpace(cedula)) return true;

            bool esPasaporte = tipoDocumento == "2";
            bool esValido = esPasaporte 
                ? ValidadorDocumentoRD.ValidarPasaporte(cedula)
                : ValidadorDocumentoRD.ValidarCedula(cedula);

            if (!esValido)
            {
                error = $"El {(esPasaporte ? "Pasaporte" : "número de Cédula de Identidad")} proporcionado no es válido.";
                return false;
            }

            docFormateado = esPasaporte 
                ? cedula.Trim().ToUpper() 
                : FormateadorFormatoRD.FormatearCedula(cedula);
            return true;
        }
    }
}
