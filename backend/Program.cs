using backend.Data;
using backend.Endpoints;  
using backend.Services;  
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=nomina.db";

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(connectionString));
builder.Services.AddScoped<IExcelService, ExcelService>();
builder.Services.AddScoped<IPdfService, PdfService>();
builder.Services.AddScoped<IEmailService, EmailService>();
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

// Registrar Endpoints del Backend
app.MapEmpleadosEndPoints();
app.MapNominaEndpoints(); 
app.MapConfigEndpoints();

app.Run();