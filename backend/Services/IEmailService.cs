using System.Collections.Generic;
using System.Threading.Tasks;
using backend.DTOs;

namespace backend.Services
{
    public interface IEmailService
    {
        Task<EmailSendResultDto> EnviarVolanteIndividualAsync(EmailTaskDto task, string conceptoPeriodo, SmtpSettings settings);
        Task<List<EmailSendResultDto>> EnviarVolantesMasivosAsync(List<EmailTaskDto> tasks, string conceptoPeriodo, SmtpSettings settings);
    }
}