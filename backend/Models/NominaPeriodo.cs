using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    public class NominaPeriodo
    {
        [Key]
    [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
    public int Id { get; set; }
    [Required]
    public int Mes { get; set; }
    [Required]
    [StringLength(5)]
    public string Quincena { get; set; } = "1Q";
     [Required]
    [StringLength(150)]
    public string Concepto { get; set; } = string.Empty;
    public DateTime FechaProcesado { get; set; } = DateTime.UtcNow;
    [Column(TypeName = "decimal(18,2)")]
    public decimal MontoTotalDevengado { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal MontoTotalDeducciones { get; set; }
    [Column(TypeName = "decimal(18,2)")]
    public decimal MontoTotalNeto { get; set; }
    [Required]
    [StringLength(20)]
    public string Estado { get; set; } = "PROCESADO";
    public ICollection<NominaDetalle> Detalles { get; set; } = new List<NominaDetalle>();



    }
}