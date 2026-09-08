using System;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            try
            {
                await context.Database.MigrateAsync();
            }
            catch
            {
                await context.Database.EnsureCreatedAsync();
            }

            await SeedUsuariosAsync(context);
        }

        private static async Task SeedUsuariosAsync(AppDbContext context)
        {
            if (!await context.Usuarios.AnyAsync())
            {
                var adminEmail = Environment.GetEnvironmentVariable("ADMIN_INITIAL_EMAIL") ?? "admin@admin.com";
                var adminPassword = Environment.GetEnvironmentVariable("ADMIN_INITIAL_PASSWORD");

                if (string.IsNullOrWhiteSpace(adminPassword))
                {
                    var randomBytes = new byte[12];
                    System.Security.Cryptography.RandomNumberGenerator.Fill(randomBytes);
                    adminPassword = Convert.ToBase64String(randomBytes) + "!";
                    Console.ForegroundColor = ConsoleColor.Yellow;
                    Console.WriteLine("==========================================================================");
                    Console.WriteLine("[SEGURIDAD] Usuario Administrador inicial generado:");
                    Console.WriteLine($"Correo: {adminEmail}");
                    Console.WriteLine($"Contraseña temporal: {adminPassword}");
                    Console.WriteLine("Por favor cambie esta contraseña inmediatamente tras el primer inicio.");
                    Console.WriteLine("==========================================================================");
                    Console.ResetColor();
                }

                var adminUser = new Usuario
                {
                    NombreCompleto = "Administrador del Sistema",
                    Email = adminEmail.Trim().ToLower(),
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminPassword, workFactor: 12),
                    Rol = "Admin",
                    PermisosJson = "[\"*\"]", 
                    Activo = true,
                    FechaCreacion = DateTime.UtcNow,
                    FechaActualizacion = DateTime.UtcNow
                };

                await context.Usuarios.AddAsync(adminUser);
                await context.SaveChangesAsync();
            }
        }
    }
}