using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Json;
using System.Threading.Tasks;
using backend.DTOs;
using MailKit.Security;
using MimeKit;
using MailKitSmtpClient = MailKit.Net.Smtp.SmtpClient;

namespace backend.Services
{
    public class EmailService : IEmailService
    {
        private readonly IHttpClientFactory _httpClientFactory;

        public EmailService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
        }

        public async Task<EmailSendResultDto> EnviarVolanteIndividualAsync(EmailTaskDto task, string conceptoPeriodo,
        SmtpSettings settings)
        {
            Console.WriteLine($"[EmailService] Iniciando envío para {task.NombreEmpleado} ({task.EmailDestinatario})...");
            Console.WriteLine($"[EmailService] Config: Servidor={settings.Server}, Puerto={settings.Port}, SenderEmail={settings.SenderEmail}, SenderName={settings.SenderName}, SSL={settings.EnableSsl}, PassLen={settings.Password?.Length ?? 0}");

            try
            {
                if (!string.IsNullOrWhiteSpace(settings.Password) && settings.Password.Trim().StartsWith("xkeysib-"))
                {
                    Console.WriteLine("[EmailService] Detectada API Key de Brevo (xkeysib-). Enviando vía Brevo API...");
                    return await EnviarViaBrevoApiAsync(task, conceptoPeriodo, settings);
                }

                var senderDisplayName = string.IsNullOrWhiteSpace(settings.SenderName) || settings.SenderName.Contains("Institucional")
                    ? "Enfoco Nómina"
                    : settings.SenderName;

                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(senderDisplayName, settings.SenderEmail));
                message.To.Add(new MailboxAddress(task.NombreEmpleado, task.EmailDestinatario));

                message.Subject = $"Comprobante de pago - {conceptoPeriodo} - ENFOCO NÓMINA";

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = $@"
                         <div style='font-family: ""Roboto"", -apple-system, BlinkMacSystemFont, ""Segoe UI"", Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px 24px 20px 24px; background-color: #ffffff;'>
                            <div style='text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 16px;'>
                                <h2 style='color: #0f172a; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;'>ENFOCO NÓMINA</h2>
                                <p style='color: #64748b; font-size: 14px; margin: 4px 0 0 0;'>Comprobante Oficial de Pago Quincenal</p>
                            </div>
                        </div>
                    "
                };

                if (task.PdfBytes != null && task.PdfBytes.Length > 0)
                {
                    bodyBuilder.Attachments.Add($"Volante_Pago_{task.CodigoEmpleado}.pdf", 
                    task.PdfBytes, ContentType.Parse("application/pdf")
                    );
                }

                message.Body = bodyBuilder.ToMessageBody();

                using var client = new MailKitSmtpClient();

                // Desactivar verificación de revocación de certificados para compatibilidad con macOS Keychain
                client.CheckCertificateRevocation = false;
                client.Timeout = 15000;

                var socketOptions = settings.Port == 465 
                    ? SecureSocketOptions.SslOnConnect 
                    : (settings.EnableSsl ? SecureSocketOptions.StartTls : SecureSocketOptions.None);

                await client.ConnectAsync(settings.Server, settings.Port, socketOptions);

                
                if (!string.IsNullOrWhiteSpace(settings.Username) &&
                !string.IsNullOrWhiteSpace(settings.Password))
                {
                    await client.AuthenticateAsync(settings.Username, settings.Password);
                }

                await client.SendAsync(message);
                await client.DisconnectAsync(true);

                Console.WriteLine($"[EmailService] ¡ÉXITO! Correo enviado a {task.EmailDestinatario}");

                return new EmailSendResultDto
                {
                    CodigoEmpleado = task.CodigoEmpleado,
                    Email = task.EmailDestinatario,
                    Exitoso = true
                };
            }

            catch (Exception ex)
            {
                Console.WriteLine($"[EmailService ERROR] Falló el envío a {task.EmailDestinatario}: {ex.GetType().Name} - {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"[EmailService INNER ERROR] {ex.InnerException.GetType().Name} - {ex.InnerException.Message}");
                }

                return new EmailSendResultDto
                {
                    CodigoEmpleado = task.CodigoEmpleado,
                    Email = task.EmailDestinatario,
                    Exitoso = false,
                    MensajeError = ex.Message
                };
            }
        }    

       public async Task<List<EmailSendResultDto>> EnviarVolantesMasivosAsync(List<EmailTaskDto> tasks, string conceptoPeriodo, SmtpSettings settings)
        {
            var resultados = new List<EmailSendResultDto>();

            for (int i = 0; i < tasks.Count; i++)
            {
               var task = tasks[i];

               var res = await EnviarVolanteIndividualAsync(task, conceptoPeriodo, settings);
                resultados.Add(res);

                if (i < tasks.Count - 1)
                {
                    await Task.Delay(300);
                } 
            }
            return resultados;
        }

        private async Task<EmailSendResultDto> EnviarViaBrevoApiAsync(EmailTaskDto task, string conceptoPeriodo, SmtpSettings settings)
        {
            var httpClient = _httpClientFactory.CreateClient();
            httpClient.DefaultRequestHeaders.Add("api-key", settings.Password.Trim());
            httpClient.DefaultRequestHeaders.Add("accept", "application/json");

            var htmlContent = $@"
                 <div style='font-family: ""Roboto"", -apple-system, BlinkMacSystemFont, ""Segoe UI"", Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px 24px 20px 24px; background-color: #ffffff;'>
                    <div style='text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 16px;'>
                        <h2 style='color: #0f172a; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.3px;'>ENFOCO NÓMINA</h2>
                        <p style='color: #64748b; font-size: 14px; margin: 4px 0 0 0;'>Comprobante Oficial de Pago Quincenal</p>
                    </div>
                </div>
            ";

            var brevoSenderName = string.IsNullOrWhiteSpace(settings.SenderName) || settings.SenderName.Contains("Institucional")
                ? "Enfoco Nómina"
                : settings.SenderName;

            var payload = new
            {
                sender = new { name = brevoSenderName, email = settings.SenderEmail },
                to = new[] { new { email = task.EmailDestinatario, name = task.NombreEmpleado } },
                subject = $"Comprobante de pago - {conceptoPeriodo} - ENFOCO NÓMINA",
                htmlContent = htmlContent,
                attachment = task.PdfBytes != null && task.PdfBytes.Length > 0 ? new[]
                {
                    new
                    {
                        name = $"Volante_Pago_{task.CodigoEmpleado}.pdf",
                        content = Convert.ToBase64String(task.PdfBytes)
                    }
                } : null
            };

            var response = await httpClient.PostAsJsonAsync("https://api.brevo.com/v3/smtp/email", payload);
            if (response.IsSuccessStatusCode)
            {
                Console.WriteLine($"[EmailService Brevo] ¡ÉXITO! Correo enviado a {task.EmailDestinatario}");
                return new EmailSendResultDto
                {
                    CodigoEmpleado = task.CodigoEmpleado,
                    Email = task.EmailDestinatario,
                    Exitoso = true
                };
            }

            var errContent = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"[EmailService Brevo ERROR] StatusCode: {response.StatusCode}, Detalle: {errContent}");
            return new EmailSendResultDto
            {
                CodigoEmpleado = task.CodigoEmpleado,
                Email = task.EmailDestinatario,
                Exitoso = false,
                MensajeError = $"Brevo API Error: {response.StatusCode} - {errContent}"
            };
        }
    }
}
