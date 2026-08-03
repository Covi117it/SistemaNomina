using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Empleado
    {
        [Key]
        [Required]
        [StringLength(20)]
        public string Codigo { get; set; } = string.Empty;
        [Required]
        [StringLength(150)]
        public string Nombres { get; set; } = string.Empty;
        [StringLength(11)]
        public string? TipoDocumento { get; set; }
        [StringLength(20)]
        public string? Cedula { get; set; }
        [Required]
        [StringLength(15)]
        public string EStatus { get; set; } = "ACTIVO";
        [StringLength(100)]
        public string? Puesto { get; set; }
        public DateTime? FechaIngreso { get; set; }
        public DateTime? FechaNacimiento { get; set; }
        [EmailAddress]
        [StringLength(150)]
        public string? Email { get; set; }
         public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
        public DateTime FechaActualizacion { get; set; } = DateTime.UtcNow;
    }
}