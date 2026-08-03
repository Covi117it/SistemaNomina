using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models
{
    public class NominaDetalle
    {
    [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    [Required]
    public int NominaPeriodoId { get; set; }
    [ForeignKey(nameof(NominaPeriodoId))]
    [JsonIgnore]
    public NominaPeriodo? NominaPeriodo { get; set; }
    [Required]
    [StringLength(20)]
    public string CodigoEmpleado { get; set; } = string.Empty;
    [Required]
    [StringLength(150)]
    public string NombreEmpleadoSnapshot { get; set; } = string.Empty;
    [StringLength(20)]
    public string? CedulaSnapshot { get; set; }
    [StringLength(150)]
    public string? EmailDestinatario { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal SueldoPeriodo { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal Incentivo { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal Reembolso { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal HorasExtras { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal Prestamo { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal CuotaCumpleanos { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalDevengado { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal SeguroVehiculo { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal SeguroMedico { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal Sfs { get; set; } // Seguro Familiar de Salud
    [Column(TypeName = "decimal(18,2)")]
    public decimal Afp { get; set; } // Fondo de Pensiones
    [Column(TypeName = "decimal(18,2)")]
    public decimal Isr { get; set; } // Impuesto Sobre la Renta
    [Column(TypeName = "decimal(18,2)")]
    public decimal TotalDeducciones { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal NetoPagado { get; set; }
    // Control de envío de correo
    public bool CorreoEnviado { get; set; } = false;
    public DateTime? FechaEnvioCorreo { get; set; }
    }
}