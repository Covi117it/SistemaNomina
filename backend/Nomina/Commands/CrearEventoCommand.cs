using System;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Http;

namespace backend.Application.Features.Nomina.Commands
{
    public record CrearEventoDto(
        string Titulo,
        string? Subtitulo,
        string? FechaStr, // Formato "YYYY-MM-DD"
        string? HoraStr,  // Formato "HH:mm"
        string? TipoEvento,
        string? Prioridad,
        string? Descripcion,
        string? AdjuntoNombre,
        string? TextoAccion
    );

    public record CrearEventoCommand(CrearEventoDto Dto);

    public class CrearEventoCommandHandler
    {
        private readonly AppDbContext _db;

        public CrearEventoCommandHandler(AppDbContext db)
        {
            _db = db;
        }

        public async Task<IResult> HandleAsync(CrearEventoCommand command)
        {
            var dto = command.Dto;
            if (dto == null || string.IsNullOrWhiteSpace(dto.Titulo))
            {
                return Results.BadRequest(new { mensaje = "El título del evento es obligatorio." });
            }

            DateTime fechaHoraCombined = DateTime.Now;
            string datePart = string.IsNullOrWhiteSpace(dto.FechaStr) ? DateTime.Now.ToString("yyyy-MM-dd") : dto.FechaStr;
            string timePart = string.IsNullOrWhiteSpace(dto.HoraStr) ? "08:00" : dto.HoraStr;

            if (DateTime.TryParse($"{datePart} {timePart}", out DateTime parsed))
            {
                fechaHoraCombined = parsed;
            }

            var nuevoEvento = new EventoRecordatorio
            {
                Titulo = dto.Titulo.Trim(),
                Subtitulo = string.IsNullOrWhiteSpace(dto.Subtitulo) ? "General" : dto.Subtitulo.Trim(),
                FechaHora = fechaHoraCombined,
                TipoEvento = string.IsNullOrWhiteSpace(dto.TipoEvento) ? "general-reminder" : dto.TipoEvento.Trim(),
                Prioridad = string.IsNullOrWhiteSpace(dto.Prioridad) ? "ALTA" : dto.Prioridad.Trim(),
                Descripcion = dto.Descripcion?.Trim() ?? string.Empty,
                AdjuntoNombre = dto.AdjuntoNombre?.Trim() ?? string.Empty,
                TextoAccion = dto.TextoAccion?.Trim() ?? string.Empty,
                FechaCreacion = DateTime.Now
            };

            _db.EventosRecordatorios.Add(nuevoEvento);
            await _db.SaveChangesAsync();

            return Results.Ok(new { mensaje = "Evento guardado exitosamente en MariaDB.", id = nuevoEvento.Id });
        }
    }
}
