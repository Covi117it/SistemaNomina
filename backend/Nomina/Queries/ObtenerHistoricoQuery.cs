using System;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Features.Nomina.Queries
{
    public record ObtenerHistoricoQuery(
        int? Anio,
        int? Mes,
        string? Quincena,
        string? Search // <-- Parámetro de Búsqueda Agregado
    );

    public class ObtenerHistoricoQueryHandler
    {
        private readonly AppDbContext _db;

        public ObtenerHistoricoQueryHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IResult> HandleAsync(ObtenerHistoricoQuery query)
        {
            var dbQuery = _db.NominaPeriodos
                              .Include(p => p.Detalles)
                              .AsNoTracking()
                              .AsQueryable();

            if (query.Anio.HasValue && query.Anio.Value > 0)
            {
                dbQuery = dbQuery.Where(p => p.FechaProcesado.Year == query.Anio.Value);
            }

            if (query.Mes.HasValue && query.Mes.Value > 0)
            {
                dbQuery = dbQuery.Where(p => p.Mes == query.Mes.Value);
            }

            if (!string.IsNullOrWhiteSpace(query.Quincena) && query.Quincena != "TODAS")
            {
                dbQuery = dbQuery.Where(p => p.Quincena == query.Quincena);
            }

            if (!string.IsNullOrWhiteSpace(query.Search))
            {
                var term = query.Search.Trim().ToLower();
                bool isShortCode = term.Length <= 3 && !term.Contains('-');

                dbQuery = dbQuery.Where(p =>
                    p.Detalles.Any(d =>
                        d.CodigoEmpleado.ToLower().Contains(term) ||
                        d.NombreEmpleadoSnapshot.ToLower().Contains(term) ||
                        (d.EmailDestinatario != null && d.EmailDestinatario.ToLower().Contains(term)) ||
                        (!isShortCode && d.CedulaSnapshot != null && d.CedulaSnapshot.ToLower().Contains(term))
                    )
                );
            }

            var periodos = await dbQuery.OrderByDescending(p => p.FechaProcesado).ToListAsync();

            return Results.Ok(periodos);
        }
    }
}