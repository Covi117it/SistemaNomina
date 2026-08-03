using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class ConfiguracionSistema
    {
        [Key]
        public int Id { get; set; } = 1;

        [StringLength(100)]
        public string SmtpServer { get; set; } = "smtp.gmail.com";

        public int SmtpPort { get; set; } = 587;

        [StringLength(150)]
        public string SmtpSenderEmail { get; set; } = "";

        [StringLength(150)]
        public string SmtpSenderName { get; set; } = "Nómina Enfoco Institucional";

        [StringLength(150)]
        public string SmtpUsername { get; set; } = "";

        [StringLength(250)]
        public string SmtpPassword { get; set; } = "";

        public bool SmtpEnableSsl { get; set; } = true;
    }
}