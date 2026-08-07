using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.EntityFrameworkCore;

namespace backend.Endpoints
{
    public static class ConfigEndpoints
    {
        public static void MapConfigEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/config")
                           .WithTags("Configuración del Sistema");

            group.MapGet("/smtp", async (AppDbContext db, ICryptoService cryptoService) =>
            {
                var config = await db.Configuraciones.FirstOrDefaultAsync();
                if (config == null)
                {
                    config = new ConfiguracionSistema();
                    await db.Configuraciones.AddAsync(config);
                    await db.SaveChangesAsync();
                }

                // Descifrar la contraseña almacenada de forma segura
                string decryptedPassword = cryptoService.Decrypt(config.SmtpPassword ?? "");

                return Results.Ok(new SmtpSettings
                {
                    Server = config.SmtpServer,
                    Port = config.SmtpPort,
                    SenderName = config.SmtpSenderName,
                    SenderEmail = config.SmtpSenderEmail,
                    Username = config.SmtpUsername,
                    Password = decryptedPassword,
                    EnableSsl = config.SmtpEnableSsl
                });
            })
            .WithSummary("Obtiene la configuración del servidor SMTP guardada en la base de datos.");

            group.MapPost("/smtp", async (SmtpSettings dto, AppDbContext db, ICryptoService cryptoService) =>
            {
                var config = await db.Configuraciones.FirstOrDefaultAsync();
                if (config == null)
                {
                    config = new ConfiguracionSistema();
                    await db.Configuraciones.AddAsync(config);
                }

                config.SmtpServer = string.IsNullOrWhiteSpace(dto.Server) ? "smtp.gmail.com" : dto.Server.Trim();
                config.SmtpPort = dto.Port > 0 ? dto.Port : 587;
                config.SmtpSenderName = string.IsNullOrWhiteSpace(dto.SenderName) ? "Nómina Enfoco Institucional" : dto.SenderName.Trim();
                config.SmtpSenderEmail = dto.SenderEmail?.Trim() ?? "";
                config.SmtpUsername = string.IsNullOrWhiteSpace(dto.Username) ? (dto.SenderEmail?.Trim() ?? "") : dto.Username.Trim();
                
                // Cifrar la contraseña SMTP antes de persistir en la base de datos
                config.SmtpPassword = string.IsNullOrWhiteSpace(dto.Password) ? "" : cryptoService.Encrypt(dto.Password.Trim());
                config.SmtpEnableSsl = dto.EnableSsl;

                await db.SaveChangesAsync();

                return Results.Ok(new { mensaje = "Configuración SMTP guardada exitosamente en la base de datos de forma cifrada." });
            })
            .WithSummary("Guarda o actualiza la configuración del servidor SMTP en la base de datos.");

            group.MapGet("/periodos-disponibles", async (AppDbContext db) =>
            {
                var aniosRegistrados = await db.NominaPeriodos
                    .Select(p => p.FechaProcesado.Year)
                    .Distinct()
                    .ToListAsync();

                int currentYear = DateTime.UtcNow.Year;
                if (!aniosRegistrados.Contains(currentYear))
                {
                    aniosRegistrados.Add(currentYear);
                }

                var aniosOrdenados = aniosRegistrados.OrderByDescending(a => a).ToList();

                return Results.Ok(new
                {
                    anios = aniosOrdenados.Select(a => new { label = $"Año {a}", value = a.ToString() }),
                    meses = new[]
                    {
                        new { label = "Todos los Meses", value = "TODOS" },
                        new { label = "Enero", value = "1" },
                        new { label = "Febrero", value = "2" },
                        new { label = "Marzo", value = "3" },
                        new { label = "Abril", value = "4" },
                        new { label = "Mayo", value = "5" },
                        new { label = "Junio", value = "6" },
                        new { label = "Julio", value = "7" },
                        new { label = "Agosto", value = "8" },
                        new { label = "Septiembre", value = "9" },
                        new { label = "Octubre", value = "10" },
                        new { label = "Noviembre", value = "11" },
                        new { label = "Diciembre", value = "12" }
                    },
                    quincenas = new[]
                    {
                        new { label = "Todas las Quincenas", value = "TODAS" },
                        new { label = "1ra Quincena (1Q)", value = "1Q" },
                        new { label = "2da Quincena (2Q)", value = "2Q" }
                    }
                });
            })
            .WithSummary("Obtiene los años, meses y quincenas dinámicos desde la BD.");

            group.MapGet("/catalogos", () =>
            {
                return Results.Ok(new
                {
                    tiposDocumento = new[]
                    {
                        new { label = "1 - Cédula de Identidad", value = "1" },
                        new { label = "2 - Pasaporte", value = "2" }
                    },
                    estatusEmpleado = new[]
                    {
                        new { label = "ACTIVO", value = "ACTIVO" },
                        new { label = "INACTIVO", value = "INACTIVO" }
                    }
                });
            })
            .WithSummary("Devuelve los catálogos estandarizados del sistema.");
        }
    }
}