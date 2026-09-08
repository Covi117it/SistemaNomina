using System;
using System.Collections.Generic;

namespace backend.DTOs
{
    public class SmtpSettings
    {
        public string Server { get; set; } = "smtp.gmail.com";
        public int Port { get; set; } = 587;
        public string SenderName { get; set; } = "ENFOCO NÓMINA";
        public string SenderEmail { get; set; } = "";
        public string Username { get; set; } = "";
        public string Password { get; set; } = "";
        public bool EnableSsl { get; set; } = true;
    }

    public class EmailTaskDto
    {
        public string CodigoEmpleado { get; set; } = string.Empty;
        public string NombreEmpleado { get; set; } = string.Empty;
        public string EmailDestinatario { get; set; } = string.Empty;
        public byte[] PdfBytes { get; set; } = Array.Empty<byte>();
        public decimal NetoPagado { get; set; }
    }

    public class EmailSendResultDto
    {
        public string CodigoEmpleado { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool Exitoso { get; set; }
        public string? MensajeError { get; set; }
    }

    public class EnviarVolantesRequestDto
    {
        public List<NominaItemDto> Items { get; set; } = new();
        public string ConceptoPeriodo { get; set; } = string.Empty;
        public SmtpSettings SmtpConfig { get; set; } = new();
    }
}