using System.Threading.Tasks;
using backend.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Features.Nomina.Commands
{
    public record EliminarEventoCommand(int Id);

    public class EliminarEventoCommandHandler
    {
        private readonly AppDbContext _db;

        public EliminarEventoCommandHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IResult> HandleAsync(EliminarEventoCommand command)
        {
            var evento = await _db.EventosRecordatorios.FirstOrDefaultAsync(e => e.Id == command.Id);
            if (evento == null)
            {
                return Results.NotFound(new { mensaje = "El evento no existe o ya fue eliminado." });
            }

            _db.EventosRecordatorios.Remove(evento);
            await _db.SaveChangesAsync();

            return Results.Ok(new { mensaje = "Evento eliminado exitosamente de MariaDB." });
        }
    }
}
