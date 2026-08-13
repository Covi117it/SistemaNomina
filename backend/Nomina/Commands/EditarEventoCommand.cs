using System;
using System.Threading.Tasks;
using backend.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace backend.Application.Features.Nomina.Commands
{
    public record EditarEventoDto(
        string Titulo,
        string? Subtitulo,
        string? FechaStr,
        string? HoraStr,
        string? TipoEvento,
        string? Prioridad,
        string? Descripcion
    );

    public record EditarEventoCommand(int Id, EditarEventoDto Dto);

    public class EditarEventoCommandHandler
    {
        private readonly AppDbContext _db;

        public EditarEventoCommandHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IResult> HandleAsync(EditarEventoCommand command)
        {
            var evento = await _db.EventosRecordatorios.FirstOrDefaultAsync(e => e.Id == command.Id);
            if (evento == null)
            {
                return Results.NotFound(new { mensaje = $"El evento con ID {command.Id} no fue encontrado en MariaDB." });
            }

            var dto = command.Dto;
            if (dto == null || string.IsNullOrWhiteSpace(dto.Titulo))
            {
                return Results.BadRequest(new { mensaje = "El título del evento es obligatorio." });
            }

            string datePart = string.IsNullOrWhiteSpace(dto.FechaStr) ? evento.FechaHora.ToString("yyyy-MM-dd") : dto.FechaStr;
            if (!string.IsNullOrWhiteSpace(datePart) && datePart.Contains("T"))
            {
                datePart = datePart.Split('T')[0];
            }

            string timePart = string.IsNullOrWhiteSpace(dto.HoraStr) ? evento.FechaHora.ToString("HH:mm") : dto.HoraStr;

            if (DateTime.TryParse($"{datePart} {timePart}", out DateTime parsed))
            {
                evento.FechaHora = parsed;
            }

            evento.Titulo = dto.Titulo.Trim();
            if (dto.Subtitulo != null) evento.Subtitulo = dto.Subtitulo.Trim();
            if (dto.TipoEvento != null) evento.TipoEvento = dto.TipoEvento.Trim();
            if (dto.Prioridad != null) evento.Prioridad = dto.Prioridad.Trim();
            if (dto.Descripcion != null) evento.Descripcion = dto.Descripcion.Trim();

            await _db.SaveChangesAsync();

            return Results.Ok(new { mensaje = "Evento actualizado exitosamente en MariaDB.", id = evento.Id });
        }
    }
}
