using System.Globalization;
using System.IO.Compression;
using System.Text;
using backend.Data;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using Microsoft.EntityFrameworkCore;

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
            string tempEncryptedPath = string.Empty;

            try
            {
                _logger.LogInformation("Iniciando respaldo nativo en C# para la quincena {Quincena}/{Mes}/{Ano}...", quincena, mes, ano);

                string backupName = $"Respaldo_Nomina_{quincena}_{mes}_{ano}_{DateTime.Now:yyyyMMdd_HHmmss}";
                tempSqlPath = Path.Combine(Path.GetTempPath(), $"{backupName}.sql");
                tempZipPath = Path.Combine(Path.GetTempPath(), $"{backupName}.zip");

                string sqlScript = await GenerarScriptSqlNativoAsync();
                await File.WriteAllTextAsync(tempSqlPath, sqlScript, Encoding.UTF8);

                using (var zip = ZipFile.Open(tempZipPath, ZipArchiveMode.Create))
                {
                    zip.CreateEntryFromFile(tempSqlPath, $"{backupName}.sql");
                }

                string backupKeyStr = Environment.GetEnvironmentVariable("BACKUP_ENCRYPTION_KEY") 
                    ?? _config["GoogleDriveBackup:EncryptionKey"] 
                    ?? "NominaBackupClaveSegura2026!";
                tempEncryptedPath = Path.Combine(Path.GetTempPath(), $"{backupName}.zip.enc");
                await CifrarArchivoAsync(tempZipPath, tempEncryptedPath, backupKeyStr);
                
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

                var fileMetadata = new Google.Apis.Drive.v3.Data.File()
                {
                    Name = $"{backupName}.zip.enc",
                    Parents = new[] { folderId }
                };

                using (var stream = new FileStream(tempEncryptedPath, FileMode.Open, FileAccess.Read))
                {
                    var request = driveService.Files.Create(fileMetadata, stream, "application/octet-stream");
                    request.Fields = "id";
                    var progress = await request.UploadAsync();
                    if (progress.Exception != null)
                    {
                        throw new Exception($"Error al subir archivo a Google Drive: {progress.Exception.Message}", progress.Exception);
                    }
                    _logger.LogInformation("Respaldo nativo cifrado subido a Google Drive con éxito. ID: {FileId}", request.ResponseBody?.Id);
                }

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
                if (File.Exists(tempEncryptedPath)) File.Delete(tempEncryptedPath);
            }
        }

        private static async Task CifrarArchivoAsync(string inputFile, string outputFile, string secretKey)
        {
            byte[] key = System.Security.Cryptography.SHA256.HashData(Encoding.UTF8.GetBytes(secretKey));
            using var aes = System.Security.Cryptography.Aes.Create();
            aes.Key = key;
            aes.GenerateIV();

            using var outStream = new FileStream(outputFile, FileMode.Create, FileAccess.Write);
            await outStream.WriteAsync(aes.IV, 0, aes.IV.Length);

            using var encryptor = aes.CreateEncryptor();
            using var cryptoStream = new System.Security.Cryptography.CryptoStream(outStream, encryptor, System.Security.Cryptography.CryptoStreamMode.Write);
            using var inStream = new FileStream(inputFile, FileMode.Open, FileAccess.Read);
            await inStream.CopyToAsync(cryptoStream);
        }

        private async Task<string> GenerarScriptSqlNativoAsync()
        {
            var sb = new StringBuilder();
            sb.AppendLine("SET FOREIGN_KEY_CHECKS = 0;");
            sb.AppendLine();

            sb.AppendLine("DELETE FROM `Configuraciones`;");
            var configs = await _db.Configuraciones.AsNoTracking().ToListAsync();
            if (configs.Any())
            {
                sb.AppendLine("INSERT INTO `Configuraciones` (`Id`, `SmtpServer`, `SmtpPort`, `SmtpSenderEmail`, `SmtpSenderName`, `SmtpUsername`, `SmtpPassword`, `SmtpEnableSsl`) VALUES");
                var configValues = configs.Select(c => $"({c.Id}, {SqlStr(c.SmtpServer)}, {c.SmtpPort}, {SqlStr(c.SmtpSenderEmail)}, {SqlStr(c.SmtpSenderName)}, {SqlStr(c.SmtpUsername)}, {SqlStr(c.SmtpPassword)}, {(c.SmtpEnableSsl ? 1 : 0)})");
                sb.AppendLine(string.Join(",\n", configValues) + ";");
            }
            sb.AppendLine();

            sb.AppendLine("DELETE FROM `Empleados`;");
            var empleados = await _db.Empleados.AsNoTracking().OrderBy(e => e.Codigo).ToListAsync();
            if (empleados.Any())
            {
                sb.AppendLine("INSERT INTO `Empleados` (`Codigo`, `Nombres`, `TipoDocumento`, `Cedula`, `EStatus`, `Puesto`, `FechaIngreso`, `FechaNacimiento`, `Email`, `FechaCreacion`, `FechaActualizacion`) VALUES");
                var empValues = empleados.Select(e => $"({SqlStr(e.Codigo)}, {SqlStr(e.Nombres)}, {SqlStr(e.TipoDocumento)}, {SqlStr(e.Cedula)}, {SqlStr(e.EStatus)}, {SqlStr(e.Puesto)}, {SqlDate(e.FechaIngreso)}, {SqlDate(e.FechaNacimiento)}, {SqlStr(e.Email)}, {SqlDate(e.FechaCreacion)}, {SqlDate(e.FechaActualizacion)})");
                sb.AppendLine(string.Join(",\n", empValues) + ";");
            }
            sb.AppendLine();

            sb.AppendLine("DELETE FROM `NominaPeriodos`;");
            var periodos = await _db.NominaPeriodos.AsNoTracking().OrderBy(p => p.Id).ToListAsync();
            if (periodos.Any())
            {
                sb.AppendLine("INSERT INTO `NominaPeriodos` (`Id`, `Mes`, `Quincena`, `Concepto`, `FechaProcesado`, `MontoTotalDevengado`, `MontoTotalDeducciones`, `MontoTotalNeto`, `Estado`) VALUES");
                var periodValues = periodos.Select(p => $"({p.Id}, {p.Mes}, {SqlStr(p.Quincena)}, {SqlStr(p.Concepto)}, {SqlDate(p.FechaProcesado)}, {SqlNum(p.MontoTotalDevengado)}, {SqlNum(p.MontoTotalDeducciones)}, {SqlNum(p.MontoTotalNeto)}, {SqlStr(p.Estado)})");
                sb.AppendLine(string.Join(",\n", periodValues) + ";");
            }
            sb.AppendLine();

            sb.AppendLine("DELETE FROM `NominaDetalles`;");
            var detalles = await _db.NominaDetalles.AsNoTracking().OrderBy(d => d.Id).ToListAsync();
            if (detalles.Any())
            {
                sb.AppendLine("INSERT INTO `NominaDetalles` (`Id`, `NominaPeriodoId`, `CodigoEmpleado`, `NombreEmpleadoSnapshot`, `CedulaSnapshot`, `EmailDestinatario`, `SueldoPeriodo`, `Incentivo`, `Reembolso`, `HorasExtras`, `Prestamo`, `CuotaCumpleanos`, `TotalDevengado`, `SeguroVehiculo`, `SeguroMedico`, `Sfs`, `Afp`, `Isr`, `TotalDeducciones`, `NetoPagado`, `CorreoEnviado`, `FechaEnvioCorreo`) VALUES");
                var detValues = detalles.Select(d => $"({d.Id}, {d.NominaPeriodoId}, {SqlStr(d.CodigoEmpleado)}, {SqlStr(d.NombreEmpleadoSnapshot)}, {SqlStr(d.CedulaSnapshot)}, {SqlStr(d.EmailDestinatario)}, {SqlNum(d.SueldoPeriodo)}, {SqlNum(d.Incentivo)}, {SqlNum(d.Reembolso)}, {SqlNum(d.HorasExtras)}, {SqlNum(d.Prestamo)}, {SqlNum(d.CuotaCumpleanos)}, {SqlNum(d.TotalDevengado)}, {SqlNum(d.SeguroVehiculo)}, {SqlNum(d.SeguroMedico)}, {SqlNum(d.Sfs)}, {SqlNum(d.Afp)}, {SqlNum(d.Isr)}, {SqlNum(d.TotalDeducciones)}, {SqlNum(d.NetoPagado)}, {(d.CorreoEnviado ? 1 : 0)}, {SqlDate(d.FechaEnvioCorreo)})");
                sb.AppendLine(string.Join(",\n", detValues) + ";");
            }
            sb.AppendLine();

            sb.AppendLine("DELETE FROM `EventosRecordatorios`;");
            var eventos = await _db.EventosRecordatorios.AsNoTracking().OrderBy(ev => ev.Id).ToListAsync();
            if (eventos.Any())
            {
                sb.AppendLine("INSERT INTO `EventosRecordatorios` (`Id`, `Titulo`, `Subtitulo`, `FechaHora`, `TipoEvento`, `Prioridad`, `Descripcion`, `AdjuntoNombre`, `TextoAccion`, `FechaCreacion`) VALUES");
                var eventValues = eventos.Select(ev => $"({ev.Id}, {SqlStr(ev.Titulo)}, {SqlStr(ev.Subtitulo)}, {SqlDate(ev.FechaHora)}, {SqlStr(ev.TipoEvento)}, {SqlStr(ev.Prioridad)}, {SqlStr(ev.Descripcion)}, {SqlStr(ev.AdjuntoNombre)}, {SqlStr(ev.TextoAccion)}, {SqlDate(ev.FechaCreacion)})");
                sb.AppendLine(string.Join(",\n", eventValues) + ";");
            }
            sb.AppendLine();

            sb.AppendLine("DELETE FROM `Usuarios`;");
            var usuarios = await _db.Usuarios.AsNoTracking().OrderBy(u => u.Id).ToListAsync();
            if (usuarios.Any())
            {
                sb.AppendLine("INSERT INTO `Usuarios` (`Id`, `NombreCompleto`, `Email`, `PasswordHash`, `Rol`, `PermisosJson`, `Activo`, `UltimoAcceso`, `FechaCreacion`, `FechaActualizacion`) VALUES");
                var userValues = usuarios.Select(u => $"({u.Id}, {SqlStr(u.NombreCompleto)}, {SqlStr(u.Email)}, {SqlStr(u.PasswordHash)}, {SqlStr(u.Rol)}, {SqlStr(u.PermisosJson)}, {(u.Activo ? 1 : 0)}, {SqlDate(u.UltimoAcceso)}, {SqlDate(u.FechaCreacion)}, {SqlDate(u.FechaActualizacion)})");
                sb.AppendLine(string.Join(",\n", userValues) + ";");
            }
            sb.AppendLine();

            sb.AppendLine("DELETE FROM `SesionesUsuarios`;");
            var sesiones = await _db.SesionesUsuarios.AsNoTracking().OrderBy(s => s.Id).ToListAsync();
            if (sesiones.Any())
            {
                sb.AppendLine("INSERT INTO `SesionesUsuarios` (`Id`, `UsuarioId`, `Token`, `FechaCreacion`, `FechaExpiracion`, `UltimoUso`, `Dispositivo`, `Activa`) VALUES");
                var sessionValues = sesiones.Select(s => $"({s.Id}, {s.UsuarioId}, {SqlStr(s.Token)}, {SqlDate(s.FechaCreacion)}, {SqlDate(s.FechaExpiracion)}, {SqlDate(s.UltimoUso)}, {SqlStr(s.Dispositivo)}, {(s.Activa ? 1 : 0)})");
                sb.AppendLine(string.Join(",\n", sessionValues) + ";");
            }
            sb.AppendLine();

            sb.AppendLine("DELETE FROM `AuditoriasAcciones`;");
            var auditorias = await _db.AuditoriasAcciones.AsNoTracking().OrderBy(a => a.Id).ToListAsync();
            if (auditorias.Any())
            {
                sb.AppendLine("INSERT INTO `AuditoriasAcciones` (`Id`, `UsuarioId`, `Modulo`, `Tipo`, `Tarea`, `Detalles`, `FechaHora`, `DireccionIp`, `Dispositivo`) VALUES");
                var auditValues = auditorias.Select(a => $"({a.Id}, {a.UsuarioId}, {SqlStr(a.Modulo)}, {SqlStr(a.Tipo)}, {SqlStr(a.Tarea)}, {SqlStr(a.Detalles)}, {SqlDate(a.FechaHora)}, {SqlStr(a.DireccionIp)}, {SqlStr(a.Dispositivo)})");
                sb.AppendLine(string.Join(",\n", auditValues) + ";");
            }
            sb.AppendLine();

            sb.AppendLine("SET FOREIGN_KEY_CHECKS = 1;");
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