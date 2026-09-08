using System.Threading.Tasks;
using backend.Data;
using backend.Services;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Features.Empleados.Queries
{
    public class ObtenerExportacionEmpleadosQueryHandler
    {
        private readonly AppDbContext _context;
        private readonly IExcelExportService _excelExportService;

        public ObtenerExportacionEmpleadosQueryHandler(AppDbContext context, IExcelExportService excelExportService)
        {
            _context = context;
            _excelExportService = excelExportService;
        }

        public async Task<(byte[] Bytes, string NombreArchivo)> HandleAsync()
        {
            var empleados = await _context.Empleados
                .AsNoTracking()
                .OrderBy(e => e.Codigo)
                .ToListAsync();

            byte[] bytes = _excelExportService.GenerarExcelEmpleados(empleados);
            string nombreArchivo = $"Directorio_Empleados_{System.DateTime.Now:yyyy-MM-dd}.xlsx";

            return (bytes, nombreArchivo);
        }
    }
}
