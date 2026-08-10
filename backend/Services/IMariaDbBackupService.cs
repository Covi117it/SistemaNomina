using System.Threading.Tasks;

namespace backend.Services
{
    public interface IMariaDbBackupService
    {
        Task GenerarYSubirRespaldoAsync(string quincena, int mes, int ano);
    }
}