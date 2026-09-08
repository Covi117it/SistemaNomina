using System;
using System.Linq;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services
{
    public static class AuditoriaHelper
    {
        // Límite de retención: 30 días para no sobrecargar la base de datos
        public const int DIAS_RETENCION = 30;

        public static async Task RegistrarAsync(
            AppDbContext db,
            int usuarioId,
            string modulo,
            string tipo,
            string tarea,
            string? detalles = null,
            string? ip = null,
            string? dispositivo = "Tauri Desktop")
        {
            try
            {
                var log = new AuditoriaAccion
                {
                    UsuarioId = usuarioId,
                    Modulo = modulo.ToUpperInvariant(),
                    Tipo = tipo.ToLowerInvariant(),
                    Tarea = tarea,
                    Detalles = detalles,
                    DireccionIp = ip,
                    Dispositivo = dispositivo,
                    FechaHora = DateTime.UtcNow
                };

                db.AuditoriasAcciones.Add(log);
                await db.SaveChangesAsync();

                // Limpieza automática por retención de 30 días (ejecuta DELETE directo en MariaDB)
                var fechaLimite = DateTime.UtcNow.AddDays(-DIAS_RETENCION);
                await db.AuditoriasAcciones
                    .Where(a => a.FechaHora < fechaLimite)
                    .ExecuteDeleteAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Auditoria Error] No se pudo registrar acción: {ex.Message}");
            }
        }
    }
}