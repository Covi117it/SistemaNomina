using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;
using backend.Services.Excel;

namespace backend.Services
{
    public interface IExcelService
    {
        Task<List<Empleado>> ProcesarExcelEmpleadosAsync(Stream stream);
        Task<List<NominaItemDto>> ProcesarExcelNominaAsync(Stream stream);
    }

    public class ExcelService : IExcelService
    {
        public Task<List<Empleado>> ProcesarExcelEmpleadosAsync(Stream stream)
        {
            var resultado = EmpleadoExcelParser.Parse(stream);
            return Task.FromResult(resultado);
        }

        public Task<List<NominaItemDto>> ProcesarExcelNominaAsync(Stream stream)
        {
            var resultado = NominaExcelParser.Parse(stream);
            return Task.FromResult(resultado);
        }
    }
}