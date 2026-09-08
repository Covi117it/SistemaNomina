using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class EventoRecordatorio
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Titulo { get; set; } = string.Empty;

        public string Subtitulo { get; set; } = string.Empty;

        [Required]
        public DateTime FechaHora { get; set; }

        [Required]
        public string TipoEvento { get; set; } = "general-reminder";

        public string Prioridad { get; set; } = "ALTA";

        public string Descripcion { get; set; } = string.Empty;

        public string AdjuntoNombre { get; set; } = string.Empty;

        public string TextoAccion { get; set; } = string.Empty;

        public DateTime FechaCreacion { get; set; } = DateTime.Now;
    }
}
