using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Features.Nomina.Queries
{
    public record PreviewQuincenaQuery(IFormFile File);

    public class PreviewQuincenaQueryHandler
    {
        private readonly IExcelService _excelService;
        private readonly AppDbContext _db;

        public PreviewQuincenaQueryHandler(IExcelService excelService, AppDbContext db)
        {
            _excelService = excelService;
            _db = db;
        }

        public async Task<IResult> HandleAsync(PreviewQuincenaQuery query)
        {
            if (query.File == null || query.File.Length == 0)
            {
                return Results.BadRequest(new { mensaje = "Debe proporcionar un archivo Excel de nómina válido." });
            }

            var extension = Path.GetExtension(query.File.FileName).ToLowerInvariant();
            if (extension != ".xlsx" && extension != ".xls")
            {
                return Results.BadRequest(new { mensaje = "El archivo debe tener formato .xlsx o .xls." });
            }

            using var stream = query.File.OpenReadStream();
            var itemsNomina = await _excelService.ProcesarExcelNominaAsync(stream);

            if (itemsNomina.Count == 0)
            {
                return Results.BadRequest(new { mensaje = "No se encontraron registros de nómina válidos en el archivo Excel." });
            }

            var listaEmpleados = await _db.Empleados.AsNoTracking().ToListAsync();
            var empleadosMap = listaEmpleados.ToDictionary(e => e.Codigo.Trim(), StringComparer.OrdinalIgnoreCase);

            int codigosNoEncontrados = 0;

            foreach (var item in itemsNomina)
            {
                if (empleadosMap.TryGetValue(item.CodigoEmpleado, out var emp))
                {
                    item.NombreEmpleado = emp.Nombres;
                    item.PuestoEmpleado = emp.Puesto;
                    item.EStatusEmpleado = emp.EStatus;
                    item.EmailDestinatario = emp.Email;
                    item.EmpleadoExiste = true;
                }
                else
                {
                    item.NombreEmpleado = "⚠️ EMPLEADO NO REGISTRADO";
                    item.PuestoEmpleado = "N/A";
                    item.EStatusEmpleado = "NO_EXISTE";
                    item.EmailDestinatario = null;
                    item.EmpleadoExiste = false;
                    codigosNoEncontrados++;
                }
            }

            

            decimal totalDevengado = itemsNomina.Sum(i => i.TotalDevengado);
            decimal totalDeducciones = itemsNomina.Sum(i => i.TotalDeducciones);
            decimal totalNeto = itemsNomina.Sum(i => i.NetoAPagar);

            string quincenaSugerida = itemsNomina.FirstOrDefault()?.Quincena ?? (DateTime.UtcNow.Day <= 15 ? "1Q" : "2Q");
            int mesSugerido = DateTime.UtcNow.Month;
            return Results.Ok(new
            {
                totalRegistros = itemsNomina.Count,
                codigosNoEncontrados,
                quincenaSugerida, 
                mesSugerido, 
                resumenTotales = new
                {
                    totalDevengado,
                    totalDeducciones,
                    totalNeto
                },
                items = itemsNomina
            });
        }
    }
}