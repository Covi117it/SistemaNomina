using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public class EmpleadoService : IEmpleadoService
    {
        private readonly AppDbContext _db;

        public EmpleadoService(AppDbContext db)
        {
            _db = db;
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

            var conteosPorEstado = await _db.Empleados
                .AsNoTracking()
                .GroupBy(e => e.EStatus)
                .Select(g => new { Status = g.Key, Count = g.Count() })
                .ToListAsync();

            int totalActivos = conteosPorEstado.FirstOrDefault(x => x.Status == "ACTIVO")?.Count ?? 0;
            int totalInactivos = conteosPorEstado.FirstOrDefault(x => x.Status == "INACTIVO")?.Count ?? 0;
            int totalTotal = conteosPorEstado.Sum(x => x.Count);
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
                totalTotal, 
                totalActivos, 
                totalInactivos, 
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
                var codigos = await _db.Empleados
                                      .AsNoTracking()
                                      .Select(e => e.Codigo)
                                      .ToListAsync();
                int maxNum = 0;
                foreach (var c in codigos)
                {
                    if (int.TryParse(c, out int val))
                    {
                        if (val > maxNum) maxNum = val;
                    }
                }
                int siguiente = maxNum + 1;
                nuevoEmpleado.Codigo = siguiente.ToString("D3");
            }
            else
            {
                var existente = await _db.Empleados.FindAsync(nuevoEmpleado.Codigo);
                if (existente != null)
                {
                    return new EmpleadoOperacionResult(false, $"Ya existe un empleado registrado con el código '{nuevoEmpleado.Codigo}'.", null);
                }
            }

            // VALIDACIÓN DE CÉDULA / PASAPORTE
            if (!string.IsNullOrWhiteSpace(nuevoEmpleado.Cedula))
            {
                bool esPasaporte = nuevoEmpleado.TipoDocumento == "2";
                bool esValido = esPasaporte 
                    ? ValidadorDocumentoRD.ValidarPasaporte(nuevoEmpleado.Cedula)
                    : ValidadorDocumentoRD.ValidarCedula(nuevoEmpleado.Cedula);

                if (!esValido)
                {
                    return new EmpleadoOperacionResult(false, $"El {(esPasaporte ? "Pasaporte" : "número de Cédula de Identidad")} proporcionado no es válido.", null);
                }

                if (!esPasaporte)
                {
                    nuevoEmpleado.Cedula = FormateadorFormatoRD.FormatearCedula(nuevoEmpleado.Cedula);
                }
            }

            nuevoEmpleado.FechaCreacion = DateTime.UtcNow;
            nuevoEmpleado.FechaActualizacion = DateTime.UtcNow;

            await _db.Empleados.AddAsync(nuevoEmpleado);
            await _db.SaveChangesAsync();

            return new EmpleadoOperacionResult(true, null, nuevoEmpleado);
        }

        public async Task<EmpleadoOperacionResult> ActualizarEmpleadoAsync(string codigo, Empleado datosEditados)
        {
            var existente = await _db.Empleados.FindAsync(codigo);
            if (existente == null)
            {
                return new EmpleadoOperacionResult(false, $"No se encontró ningún empleado con el código '{codigo}'.", null);
            }

            // VALIDACIÓN DE CÉDULA / PASAPORTE
            if (!string.IsNullOrWhiteSpace(datosEditados.Cedula))
            {
                bool esPasaporte = datosEditados.TipoDocumento == "2";
                bool esValido = esPasaporte 
                    ? ValidadorDocumentoRD.ValidarPasaporte(datosEditados.Cedula)
                    : ValidadorDocumentoRD.ValidarCedula(datosEditados.Cedula);

                if (!esValido)
                {
                    return new EmpleadoOperacionResult(false, $"El {(esPasaporte ? "Pasaporte" : "número de Cédula de Identidad")} proporcionado no es válido.", null);
                }

                existente.Cedula = esPasaporte 
                    ? datosEditados.Cedula.Trim().ToUpper() 
                    : FormateadorFormatoRD.FormatearCedula(datosEditados.Cedula);
            }

            existente.Nombres = datosEditados.Nombres;
            existente.TipoDocumento = datosEditados.TipoDocumento;
            existente.EStatus = string.IsNullOrWhiteSpace(datosEditados.EStatus) ? "ACTIVO" : datosEditados.EStatus;
            existente.Puesto = datosEditados.Puesto;
            existente.FechaIngreso = datosEditados.FechaIngreso;
            existente.FechaNacimiento = datosEditados.FechaNacimiento;
            existente.Email = datosEditados.Email;
            existente.FechaActualizacion = DateTime.UtcNow;

            await _db.SaveChangesAsync();

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
                
                bool esPasaporte = emp.TipoDocumento == "2";
                string docFormateado = (!string.IsNullOrWhiteSpace(emp.Cedula) && !esPasaporte)
                    ? FormateadorFormatoRD.FormatearCedula(emp.Cedula)
                    : emp.Cedula ?? string.Empty;

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
            return procesados;
        }

        public async Task<bool> EliminarEmpleadoAsync(string codigo)
        {
            var existente = await _db.Empleados.FindAsync(codigo);
            if (existente == null) return false;

            _db.Empleados.Remove(existente);
            await _db.SaveChangesAsync();
            return true;
        }

        public async Task<int> CambiarEstatusTodosAsync(string nuevoEstatus)
        {
            if (string.IsNullOrWhiteSpace(nuevoEstatus)) return 0;

            string estatusNormalizado = nuevoEstatus.ToUpperInvariant().Trim();
            return await _db.Empleados
                .ExecuteUpdateAsync(s => s
                    .SetProperty(e => e.EStatus, estatusNormalizado)
                    .SetProperty(e => e.FechaActualizacion, DateTime.UtcNow));
        }

        public async Task<int> VaciarBaseDatosAsync()
        {
            return await _db.Empleados.ExecuteDeleteAsync();
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
                if (int.TryParse(c, out int val))
                {
                    if (val > maxNum) maxNum = val;
                }
            }
            int siguiente = maxNum + 1;
            return siguiente.ToString("D3");
        }
    }
}