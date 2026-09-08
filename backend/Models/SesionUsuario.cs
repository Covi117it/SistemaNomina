using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("SesionesUsuarios")]
    public class SesionUsuario
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int UsuarioId { get; set; }

        [ForeignKey(nameof(UsuarioId))]
        public Usuario Usuario { get; set; } = null!;

        [Required]
        [MaxLength(128)]
        public string Token { get; set; } = string.Empty;

        public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;

        [Required]
        public DateTime FechaExpiracion { get; set; }

        public DateTime UltimoUso { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string? Dispositivo { get; set; } = "Tauri Desktop";

        public bool Activa { get; set; } = true;
    }
}