using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Mail;
using System.Threading.Tasks;
using backend.DTOs;
using MailKit.Security;
using MimeKit;
using MailKitSmtpClient = MailKit.Net.Smtp.SmtpClient;

namespace backend.Services
{
    public class EmailService : IEmailService
    {
        public async Task<EmailSendResultDto> EnviarVolanteIndividualAsync(EmailTaskDto task, string conceptoPeriodo,
        SmtpSettings settings)
        {
            try
            {
                var message = new MimeMessage();
                message.From.Add(new MailboxAddress(settings.SenderName, settings.SenderEmail));
                message.To.Add(new MailboxAddress(task.NombreEmpleado, task.EmailDestinatario));

                message.Subject = $"Comprobante de pago - {conceptoPeriodo} - ENFOCO NOMINA";

                var bodyBuilder = new BodyBuilder
                {
                    HtmlBody = $@"
                         <div style='font-family: Arial, sans-serif; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; background-color: #ffffff;'>
                            <div style='text-align: center; border-bottom: 2px solid #10b981; padding-bottom: 16px;'>
                                <h2 style='color: #0f172a; margin: 0; font-size: 22px;'>ENFOCO NÓMINA</h2>
                                <p style='color: #64748b; font-size: 14px; margin: 4px 0 0 0;'>Comprobante Oficial de Pago Quincenal</p>
                            </div>
                            <div style='padding: 20px 0;'>
                                <p style='font-size: 15px;'>Estimado/a <strong>{task.NombreEmpleado}</strong>,</p>
                                <p style='font-size: 14px; color: #334155;'>Adjunto a este correo encontrará su volante de pago correspondiente a la <strong>{conceptoPeriodo}</strong> en formato PDF.</p>
                                
                                <div style='background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; padding: 16px; margin: 18px 0;'>
                                    <p style='margin: 0 0 6px 0; font-size: 12px; font-weight: bold; text-transform: uppercase; color: #64748b;'>Resumen de Pago:</p>
                                    <p style='margin: 0; font-size: 18px; font-weight: bold; color: #059669;'>Neto Recibido: DOP$ {task.NetoPagado:N2}</p>
                                </div>
                                
                                <p style='font-size: 13px; color: #64748b; margin-top: 16px;'>Si tiene alguna inquietud respecto a sus devengados o deducciones, favor comunicarse con el departamento de Gestión Humana.</p>
                            </div>
                            <div style='border-top: 1px solid #e2e8f0; padding-top: 14px; font-size: 11px; color: #94a3b8; text-align: center;'>
                                Mensaje generado automáticamente por el Sistema de Nómina ENFOCO. No responda a este correo.
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

                return new EmailSendResultDto
                {
                    CodigoEmpleado = task.CodigoEmpleado,
                    Email = task.EmailDestinatario,
                    Exitoso = true
                };
            }

            catch (Exception ex)
            {
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
        }
    }
