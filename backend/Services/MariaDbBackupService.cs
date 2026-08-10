using System;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Diagnostics;
using System.Threading;
using System.Threading.Tasks;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Responses;
using Google.Apis.Drive.v3;
using Google.Apis.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace backend.Services
{
    public class MariaDbBackupService : IMariaDbBackupService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<MariaDbBackupService> _logger;

        public MariaDbBackupService(IConfiguration config, ILogger<MariaDbBackupService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task GenerarYSubirRespaldoAsync(string quincena, int mes, int ano)
        {
            string tempSqlPath = string.Empty;
            string tempZipPath = string.Empty;

            try
            {
                _logger.LogInformation("Iniciando respaldo para la quincena {Quincena}/{Mes}/{Ano}...", quincena, mes, ano);

                string backupName = $"Respaldo_Nomina_{quincena}_{mes}_{ano}_{DateTime.Now:yyyyMMdd_HHmmss}";
                tempSqlPath = Path.Combine(Path.GetTempPath(), $"{backupName}.sql");
                tempZipPath = Path.Combine(Path.GetTempPath(), $"{backupName}.zip");

                // 1. Ejecutar mariadb-dump
                var processInfo = new ProcessStartInfo
                {
                    FileName = "mariadb-dump",
                    Arguments = $"-u admin -pdaniel2901 sistema_nomina1q2q --result-file=\"{tempSqlPath}\"",
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true
                };

                using (var process = Process.Start(processInfo))
                {
                    await process!.WaitForExitAsync();
                    if (process.ExitCode != 0)
                    {
                        string err = await process.StandardError.ReadToEndAsync();
                        throw new Exception($"Error en mariadb-dump: {err}");
                    }
                }

                // 2. Comprimir a formato .ZIP
                using (var zip = ZipFile.Open(tempZipPath, ZipArchiveMode.Create))
                {
                    zip.CreateEntryFromFile(tempSqlPath, $"{backupName}.sql");
                }
                
                // 3. Autenticación con OAuth 2.0 User Credentials (usando tus 15 GB reales)
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

                using (var stream = new FileStream(tempZipPath, FileMode.Open))
                {
                    var request = driveService.Files.Create(fileMetadata, stream, "application/zip");
                    request.Fields = "id";
                    var progress = await request.UploadAsync();
                    if (progress.Exception != null)
                    {
                        throw new Exception($"Error al subir archivo a Google Drive: {progress.Exception.Message}", progress.Exception);
                    }
                    _logger.LogInformation("Respaldo subido a Google Drive con éxito. ID: {FileId}", request.ResponseBody?.Id);
                }

                // 5. Aplicar política de retención
                await AplicarRetencionDriveAsync(driveService, folderId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error al generar o subir el respaldo automático a Google Drive.");
            }
            finally
            {
                if (File.Exists(tempSqlPath)) File.Delete(tempSqlPath);
                if (File.Exists(tempZipPath)) File.Delete(tempZipPath);
            }
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