using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    public class MariaDbBackupService : IMariaDbBackupService
    {
        private readonly AppDbContext _db;
        private readonly IConfiguration _config;
        private readonly ILogger<MariaDbBackupService> _logger;

        public MariaDbBackupService(AppDbContext db, IConfiguration config, ILogger<MariaDbBackupService> logger)
        {
            _db = db;
            _config = config;
            _logger = logger;
        }

        public async Task GenerarYSubirRespaldoAsync(string quincena, int mes, int ano)
        {
            string tempSqlPath = string.Empty;
            string tempZipPath = string.Empty;

            try
            {
                _logger.LogInformation("Iniciando respaldo nativo en C# para la quincena {Quincena}/{Mes}/{Ano}...", quincena, mes, ano);

                string backupName = $"Respaldo_Nomina_{quincena}_{mes}_{ano}_{DateTime.Now:yyyyMMdd_HHmmss}";
                tempSqlPath = Path.Combine(Path.GetTempPath(), $"{backupName}.sql");
                tempZipPath = Path.Combine(Path.GetTempPath(), $"{backupName}.zip");

                // 1. Generar contenido SQL directamente desde la base de datos (EF Core)
                string sqlScript = await GenerarScriptSqlNativoAsync();
                await File.WriteAllTextAsync(tempSqlPath, sqlScript, Encoding.UTF8);

                // 2. Comprimir a formato .ZIP
                using (var zip = ZipFile.Open(tempZipPath, ZipArchiveMode.Create))
                {
                    zip.CreateEntryFromFile(tempSqlPath, $"{backupName}.sql");
                }
                
                // 3. Autenticación con OAuth 2.0 User Credentials
                string clientId = _config["GoogleDriveBackup:ClientId"]!;
                string clientSecret = _config["GoogleDriveBackup:ClientSecret"]!;
                string refreshToken = _config["GoogleDriveBackup:RefreshToken"]!;
                string folderId = _config["GoogleDriveBackup:FolderId"]!;

                var tokenResponse = new TokenResponse { RefreshToken = refreshToken };
                var flowInitializer = new GoogleAuthorizationCodeFlow.Initializer
                {
                    ClientSecrets = new ClientSecrets
                    {
                        ClientId = clientId,
                        ClientSecret = clientSecret
                    },
                    Scopes = new[] { DriveService.ScopeConstants.DriveFile }
                };

                var flow = new GoogleAuthorizationCodeFlow(flowInitializer);
                var credential = new UserCredential(flow, "user", tokenResponse);

                var driveService = new DriveService(new BaseClientService.Initializer()
                {
                    HttpClientInitializer = credential,
                    ApplicationName = "SistemaNominaBackup"
                });

                // 4. Subir archivo ZIP a Google Drive
                var fileMetadata = new Google.Apis.Drive.v3.Data.File()
                {
                    Name = $"{backupName}.zip",
                    Parents = new[] { folderId }
                };

                using (var stream = new FileStream(tempZipPath, FileMode.Open, FileAccess.Read))
                {
                    var request = driveService.Files.Create(fileMetadata, stream, "application/zip");
                    request.Fields = "id";
                    var progress = await request.UploadAsync();
                    if (progress.Exception != null)
                    {
                        throw new Exception($"Error al subir archivo a Google Drive: {progress.Exception.Message}", progress.Exception);
                    }
                    _logger.LogInformation("Respaldo nativo subido a Google Drive con éxito. ID: {FileId}", request.ResponseBody?.Id);
                }

                // 5. Aplicar política de retención
                await AplicarRetencionDriveAsync(driveService, folderId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar o subir el respaldo automático nativo a Google Drive.");
            }
            finally
            {
                if (File.Exists(tempSqlPath)) File.Delete(tempSqlPath);
                if (File.Exists(tempZipPath)) File.Delete(tempZipPath);
            }
        }

        private async Task<string> GenerarScriptSqlNativoAsync()
        {
            var sb = new StringBuilder();
            sb.AppendLine("-- ========================================================");
            sb.AppendLine($"-- Respaldo Oficial de Base de Datos - Sistema de Nómina ENFOCO");
            sb.AppendLine($"-- Fecha de Generación: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss} UTC");
            sb.AppendLine("-- ========================================================");
            sb.AppendLine("SET FOREIGN_KEY_CHECKS = 0;");
            sb.AppendLine();

            // 1. Configuraciones
            var configs = await _db.Configuraciones.AsNoTracking().ToListAsync();
            if (configs.Any())
            {
                sb.AppendLine("-- Tabla: Configuraciones");
                sb.AppendLine("DELETE FROM `Configuraciones`;");
                sb.AppendLine("INSERT INTO `Configuraciones` (`Id`, `SmtpServer`, `SmtpPort`, `SmtpSenderEmail`, `SmtpSenderName`, `SmtpUsername`, `SmtpPassword`, `SmtpEnableSsl`) VALUES");
                var configValues = configs.Select(c => $"({c.Id}, {SqlStr(c.SmtpServer)}, {c.SmtpPort}, {SqlStr(c.SmtpSenderEmail)}, {SqlStr(c.SmtpSenderName)}, {SqlStr(c.SmtpUsername)}, {SqlStr(c.SmtpPassword)}, {(c.SmtpEnableSsl ? 1 : 0)})");
                sb.AppendLine(string.Join(",\n", configValues) + ";");
                sb.AppendLine();
            }

            // 2. Empleados
            var empleados = await _db.Empleados.AsNoTracking().OrderBy(e => e.Codigo).ToListAsync();
            if (empleados.Any())
            {
                sb.AppendLine("-- Tabla: Empleados");
                sb.AppendLine("DELETE FROM `Empleados`;");
                sb.AppendLine("INSERT INTO `Empleados` (`Codigo`, `Nombres`, `TipoDocumento`, `Cedula`, `EStatus`, `Puesto`, `FechaIngreso`, `FechaNacimiento`, `Email`, `FechaCreacion`, `FechaActualizacion`) VALUES");
                var empValues = empleados.Select(e => $"({SqlStr(e.Codigo)}, {SqlStr(e.Nombres)}, {SqlStr(e.TipoDocumento)}, {SqlStr(e.Cedula)}, {SqlStr(e.EStatus)}, {SqlStr(e.Puesto)}, {SqlDate(e.FechaIngreso)}, {SqlDate(e.FechaNacimiento)}, {SqlStr(e.Email)}, {SqlDate(e.FechaCreacion)}, {SqlDate(e.FechaActualizacion)})");
                sb.AppendLine(string.Join(",\n", empValues) + ";");
                sb.AppendLine();
            }

            // 3. NominaPeriodos
            var periodos = await _db.NominaPeriodos.AsNoTracking().OrderBy(p => p.Id).ToListAsync();
            if (periodos.Any())
            {
                sb.AppendLine("-- Tabla: NominaPeriodos");
                sb.AppendLine("DELETE FROM `NominaPeriodos`;");
                sb.AppendLine("INSERT INTO `NominaPeriodos` (`Id`, `Mes`, `Quincena`, `Concepto`, `FechaProcesado`, `MontoTotalDevengado`, `MontoTotalDeducciones`, `MontoTotalNeto`, `Estado`) VALUES");
                var periodValues = periodos.Select(p => $"({p.Id}, {p.Mes}, {SqlStr(p.Quincena)}, {SqlStr(p.Concepto)}, {SqlDate(p.FechaProcesado)}, {SqlNum(p.MontoTotalDevengado)}, {SqlNum(p.MontoTotalDeducciones)}, {SqlNum(p.MontoTotalNeto)}, {SqlStr(p.Estado)})");
                sb.AppendLine(string.Join(",\n", periodValues) + ";");
                sb.AppendLine();
            }

            // 4. NominaDetalles
            var detalles = await _db.NominaDetalles.AsNoTracking().OrderBy(d => d.Id).ToListAsync();
            if (detalles.Any())
            {
                sb.AppendLine("-- Tabla: NominaDetalles");
                sb.AppendLine("DELETE FROM `NominaDetalles`;");
                sb.AppendLine("INSERT INTO `NominaDetalles` (`Id`, `NominaPeriodoId`, `CodigoEmpleado`, `NombreEmpleadoSnapshot`, `CedulaSnapshot`, `EmailDestinatario`, `SueldoPeriodo`, `Incentivo`, `Reembolso`, `HorasExtras`, `Prestamo`, `CuotaCumpleanos`, `TotalDevengado`, `SeguroVehiculo`, `SeguroMedico`, `Sfs`, `Afp`, `Isr`, `TotalDeducciones`, `NetoPagado`, `CorreoEnviado`, `FechaEnvioCorreo`) VALUES");
                var detValues = detalles.Select(d => $"({d.Id}, {d.NominaPeriodoId}, {SqlStr(d.CodigoEmpleado)}, {SqlStr(d.NombreEmpleadoSnapshot)}, {SqlStr(d.CedulaSnapshot)}, {SqlStr(d.EmailDestinatario)}, {SqlNum(d.SueldoPeriodo)}, {SqlNum(d.Incentivo)}, {SqlNum(d.Reembolso)}, {SqlNum(d.HorasExtras)}, {SqlNum(d.Prestamo)}, {SqlNum(d.CuotaCumpleanos)}, {SqlNum(d.TotalDevengado)}, {SqlNum(d.SeguroVehiculo)}, {SqlNum(d.SeguroMedico)}, {SqlNum(d.Sfs)}, {SqlNum(d.Afp)}, {SqlNum(d.Isr)}, {SqlNum(d.TotalDeducciones)}, {SqlNum(d.NetoPagado)}, {(d.CorreoEnviado ? 1 : 0)}, {SqlDate(d.FechaEnvioCorreo)})");
                sb.AppendLine(string.Join(",\n", detValues) + ";");
                sb.AppendLine();
            }

            // 5. EventosRecordatorios
            var eventos = await _db.EventosRecordatorios.AsNoTracking().OrderBy(ev => ev.Id).ToListAsync();
            if (eventos.Any())
            {
                sb.AppendLine("-- Tabla: EventosRecordatorios");
                sb.AppendLine("DELETE FROM `EventosRecordatorios`;");
                sb.AppendLine("INSERT INTO `EventosRecordatorios` (`Id`, `Titulo`, `Subtitulo`, `FechaHora`, `TipoEvento`, `Prioridad`, `Descripcion`, `AdjuntoNombre`, `TextoAccion`, `FechaCreacion`) VALUES");
                var eventValues = eventos.Select(ev => $"({ev.Id}, {SqlStr(ev.Titulo)}, {SqlStr(ev.Subtitulo)}, {SqlDate(ev.FechaHora)}, {SqlStr(ev.TipoEvento)}, {SqlStr(ev.Prioridad)}, {SqlStr(ev.Descripcion)}, {SqlStr(ev.AdjuntoNombre)}, {SqlStr(ev.TextoAccion)}, {SqlDate(ev.FechaCreacion)})");
                sb.AppendLine(string.Join(",\n", eventValues) + ";");
                sb.AppendLine();
            }

            sb.AppendLine("SET FOREIGN_KEY_CHECKS = 1;");
            sb.AppendLine("-- Fin del Respaldo");
            return sb.ToString();
        }

        private static string SqlStr(string? value)
        {
            if (value == null) return "NULL";
            return $"'{value.Replace("\\", "\\\\").Replace("'", "''")}'";
        }

        private static string SqlDate(DateTime? value)
        {
            if (value == null) return "NULL";
            return $"'{value.Value:yyyy-MM-dd HH:mm:ss}'";
        }

        private static string SqlNum(decimal value)
        {
            return value.ToString("F2", CultureInfo.InvariantCulture);
        }

        private async Task AplicarRetencionDriveAsync(DriveService driveService, string folderId)
        {
            int maxLimit = int.TryParse(_config["GoogleDriveBackup:MaxRespaldosRetencion"], out int l) ? l : 48;

            var listRequest = driveService.Files.List();
            listRequest.Q = $"'{folderId}' in parents and trashed = false and name contains 'Respaldo_Nomina_'";
            listRequest.Fields = "files(id, name, createdTime)";
            listRequest.OrderBy = "createdTime desc";

            var result = await listRequest.ExecuteAsync();
            var archivos = result.Files;

            if (archivos != null && archivos.Count > maxLimit)
            {
                foreach (var file in archivos.Skip(maxLimit))
                {
                    _logger.LogInformation("Eliminando respaldo antiguo: {Name}", file.Name);
                    await driveService.Files.Delete(file.Id).ExecuteAsync();
                }
            }
        }
    }
}