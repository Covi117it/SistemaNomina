using backend.Application.Features.Empleados.Queries;
using backend.Application.Features.Nomina.Commands;
using backend.Application.Features.Nomina.Queries;
using backend.Data;
using backend.Endpoints;  
using backend.Services;  
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var port = Environment.GetEnvironmentVariable("PORT") ?? "5289";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
ServerVersion serverVersion;
try
{
    serverVersion = ServerVersion.AutoDetect(connectionString);
}
catch
{
    serverVersion = new MySqlServerVersion(new Version(8, 0, 35));
}

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, serverVersion));
builder.Services.AddScoped<IExcelService, ExcelService>();
builder.Services.AddScoped<IExcelExportService, ExcelExportService>();
builder.Services.AddScoped<IPdfService, PdfService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IEmpleadoService, EmpleadoService>();
builder.Services.AddScoped<IMariaDbBackupService, MariaDbBackupService>();
builder.Services.AddDataProtection();
builder.Services.AddSingleton<ICryptoService, CryptoService>();
builder.Services.AddScoped<PreviewQuincenaQueryHandler>();
builder.Services.AddScoped<ProcesarQuincenaCommandHandler>();
builder.Services.AddScoped<ObtenerHistoricoQueryHandler>();
builder.Services.AddScoped<ObtenerEventosCalendarioQueryHandler>();
builder.Services.AddScoped<CrearEventoCommandHandler>();
builder.Services.AddScoped<EditarEventoCommandHandler>();
builder.Services.AddScoped<EliminarEventoCommandHandler>();
builder.Services.AddScoped<EnviarVolantesCommandHandler>();
builder.Services.AddScoped<ObtenerExportacionNominaQueryHandler>();
builder.Services.AddScoped<ObtenerExportacionEmpleadosQueryHandler>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    options.AddFixedWindowLimiter("LoginLimiter", opt =>
    {
        opt.PermitLimit = 5;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueLimit = 0;
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowTauriApp", policy =>
    {
        policy.SetIsOriginAllowed(origin =>
        {
            if (string.IsNullOrWhiteSpace(origin)) return false;
            try
            {
                var uri = new Uri(origin);
                return uri.Host == "localhost" 
                    || uri.Host == "127.0.0.1" 
                    || uri.Scheme == "tauri" 
                    || origin.StartsWith("https://tauri.localhost", StringComparison.OrdinalIgnoreCase);
            }
            catch
            {
                return false;
            }
        })
        .AllowAnyHeader()
        .AllowAnyMethod();
    });
});

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "API Sistema de Nómina v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseCors("AllowTauriApp");
app.UseRateLimiter();

app.MapGet("/api/health", () => Results.Ok(new 
{ 
    Status = "Online", 
    Message = "Backend .NET 10 funcionando correctamente", 
    Timestamp = DateTime.Now 
})).WithName("GetHealthCheck");

// Registro de endpoints
app.MapEmpleadosEndPoints();
app.MapNominaEndpoints(); 
app.MapConfigEndpoints();
app.MapAuthEndpoints();

// Inicialización de la base de datos
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbInitializer.SeedAsync(dbContext);
}

app.Run();  