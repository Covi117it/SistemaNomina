using System.Threading.Tasks;
using backend.Data;
using backend.Services;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Features.Nomina.Queries
{
    public class ObtenerExportacionNominaQueryHandler
    {
        private readonly AppDbContext _context;
        private readonly IExcelExportService _excelExportService;

        public ObtenerExportacionNominaQueryHandler(AppDbContext context, IExcelExportService excelExportService)
        {
            _context = context;
            _excelExportService = excelExportService;
        }

        public async Task<(byte[] Bytes, string NombreArchivo)?> HandleAsync(int id)
        {
            var periodo = await _context.NominaPeriodos
                .Include(p => p.Detalles)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (periodo == null) return null;

            byte[] bytes = _excelExportService.GenerarExcelNomina(periodo);
            string nombreArchivo = $"Nomina_{periodo.Quincena}_Mes_{periodo.Mes}_{periodo.FechaProcesado.Year}.xlsx";

            return (bytes, nombreArchivo);
        }
    }
}