using backend.Application.Features.Empleados.Queries;
using backend.Application.Features.Nomina.Commands;
using backend.Application.Features.Nomina.Queries;
using backend.Data;
using backend.Endpoints;  
using backend.Services;  
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
if (!builder.Environment.IsDevelopment())
{
    builder.WebHost.UseUrls("http://localhost:5289");
}
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
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowTauriApp", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "API Sistema de Nómina v1");
    c.RoutePrefix = "swagger";
});

app.UseCors("AllowTauriApp");

app.MapGet("/api/health", () => Results.Ok(new 
{ 
    Status = "Online", 
    Message = "Backend .NET 10 funcionando correctamente", 
    Timestamp = DateTime.Now 
})).WithName("GetHealthCheck");

// 4. Registrar Endpoints Minimal API
app.MapEmpleadosEndPoints();
app.MapNominaEndpoints(); 
app.MapConfigEndpoints();

// 5. Inicializar y sembrar la base de datos de empleados automáticamente al arrancar
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    await DbInitializer.SeedAsync(dbContext);
}

app.Run();  