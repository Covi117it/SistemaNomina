using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("AuditoriasAcciones")]
    public class AuditoriaAccion
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int UsuarioId { get; set; }

        [ForeignKey(nameof(UsuarioId))]
        public Usuario Usuario { get; set; } = null!;

        [Required]
        [MaxLength(30)]
        public string Modulo { get; set; } = "SISTEMA";

        [Required]
        [MaxLength(20)]
        public string Tipo { get; set; } = "info"; 

        [Required]
        [MaxLength(250)]
        public string Tarea { get; set; } = string.Empty;

        [MaxLength(500)]
        public string? Detalles { get; set; }

        [MaxLength(50)]
        public string? DireccionIp { get; set; }

        [MaxLength(100)]
        public string? Dispositivo { get; set; } = "Tauri Desktop";

        public DateTime FechaHora { get; set; } = DateTime.UtcNow;
    }
}