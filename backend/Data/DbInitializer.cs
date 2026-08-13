using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public static class DbInitializer
    {
        public static async Task SeedAsync(AppDbContext context)
        {
            // 1. Aplica migraciones pendientes y crea las tablas si no existen
            await context.Database.MigrateAsync();

            // 2. Si ya existen empleados registrados, no hace nada
            if (await context.Empleados.AnyAsync())
            {
                return;
            }

            // 3. Si la tabla Empleados está vacía, la puebla automáticamente con los 14 empleados actuales
            var empleadosIniciales = new List<Empleado>
            {
                new Empleado
                {
                    Codigo = "001",
                    Nombres = "Jorge Martínez",
                    TipoDocumento = "1",
                    Cedula = "001-1193998-9",
                    EStatus = "ACTIVO",
                    Puesto = "Gerente General",
                    FechaIngreso = new DateTime(2017, 1, 2),
                    FechaNacimiento = new DateTime(2026, 1, 21),
                    Email = "Jmartinez@enfoco.com.do",
                    FechaCreacion = DateTime.UtcNow,
                    FechaActualizacion = DateTime.UtcNow
                },
                new Empleado
                {
                    Codigo = "002",
                    Nombres = "Yinet Jerez Noboa",
                    TipoDocumento = "1",
                    Cedula = "001-0131654-5",
                    EStatus = "ACTIVO",
                    Puesto = "Directora Administrativa",
                    FechaIngreso = new DateTime(2017, 1, 2),
                    FechaNacimiento = new DateTime(2026, 3, 14),
                    Email = "yjerez@enfoco.com.do",
                    FechaCreacion = DateTime.UtcNow,
                    FechaActualizacion = DateTime.UtcNow
                },
                new Empleado
                {
                    Codigo = "003",
                    Nombres = "José Manuel De León",
                    TipoDocumento = "1",
                    Cedula = "223-0103411-6",
                    EStatus = "ACTIVO",
                    Puesto = "Gerente Desarrollo de Software",
                    FechaIngreso = new DateTime(2017, 6, 16),
                    FechaNacimiento = new DateTime(2026, 1, 19),
                    Email = "jdeleon@enfoco.com.do",
                    FechaCreacion = DateTime.UtcNow,
                    FechaActualizacion = DateTime.UtcNow
                },
                new Empleado
                {
                    Codigo = "004",
                    Nombres = "Miguel Angel Carrión",
                    TipoDocumento = "1",
                    Cedula = "001-1859583-4",
                    EStatus = "ACTIVO",
                    Puesto = "Ingeniero de Software Senior",
                    FechaIngreso = new DateTime(2017, 5, 22),
                    FechaNacimiento = new DateTime(2026, 5, 8),
                    Email = "Mcarrion@enfoco.com.do",
                    FechaCreacion = DateTime.UtcNow,
                    FechaActualizacion = DateTime.UtcNow
                },
                new Empleado
                {
                    Codigo = "005",
                    Nombres = "Delvin Martínez",
                    TipoDocumento = "1",
                    Cedula = "229-0021149-5",
                    EStatus = "ACTIVO",
                    Puesto = "Ingeniero de Software",
                    FechaIngreso = new DateTime(2018, 6, 11),
                    FechaNacimiento = new DateTime(2026, 6, 20),
                    Email = "Dmartinez@enfoco.com.do",
                    FechaCreacion = DateTime.UtcNow,
                    FechaActualizacion = DateTime.UtcNow
                },
                new Empleado
                {
                    Codigo = "006",
                    Nombres = "Rosa Elba Martínez",
                    TipoDocumento = "1",
                    Cedula = "229-0002689-3",
                    EStatus = "ACTIVO",
                    Puesto = "Analista de Proyectos",
                    FechaIngreso = new DateTime(2019, 4, 30),
                    FechaNacimiento = new DateTime(2026, 10, 27),
                    Email = "Rmartinez@enfoco.com.do",
                    FechaCreacion = DateTime.UtcNow,
                    FechaActualizacion = DateTime.UtcNow
                },
                new Empleado
                {
                    Codigo = "007",
                    Nombres = "Talia Villaman Guzman",
                    TipoDocumento = "1",
                    Cedula = "061-0031753-3",
                    EStatus = "ACTIVO",
                    Puesto = "Ingeniero de Software Junior",
                    FechaIngreso = new DateTime(2022, 9, 12),
                    FechaNacimiento = new DateTime(2026, 9, 2),
                    Email = "Tvillaman@enfoco.com.do",
                    FechaCreacion = DateTime.UtcNow,
                    FechaActualizacion = DateTime.UtcNow
                },
                new Empleado
                {
                    Codigo = "008",
                    Nombres = "Isaias Emil Gomez",
                    TipoDocumento = "1",
                    Cedula = "402-3035128-6",
                    EStatus = "ACTIVO",
                    Puesto = "Ingeniero de Software Junior",
                    FechaIngreso = new DateTime(2024, 10, 1),
                    FechaNacimiento = new DateTime(2026, 12, 27),
                    Email = "Igomez@enfoco.com.do",
                    FechaCreacion = DateTime.UtcNow,
                    FechaActualizacion = DateTime.UtcNow
                },
                new Empleado
                {
                    Codigo = "009",
                    Nombres = "Enmanuel Leandro Gomez",
                    TipoDocumento = "1",
                    Cedula = "402-1237492-6",
                    EStatus = "ACTIVO",
                    Puesto = "Ingeniero de Software Junior",
                    FechaIngreso = new DateTime(2024, 10, 1),
                    FechaNacimiento = new DateTime(2026, 4, 5),
                    Email = "Egomez@enfoco.com.do",
                    FechaCreacion = DateTime.UtcNow,
                    FechaActualizacion = DateTime.UtcNow
                },
                new Empleado
                {
                    Codigo = "010",
                    Nombres = "Maria Rondon (Alexandra)",
                    TipoDocumento = "1",
                    Cedula = "001-1354425-8",
                    EStatus = "ACTIVO",
                    Puesto = "Conserje",
                    FechaIngreso = new DateTime(2024, 9, 2),
                    FechaNacimiento = new DateTime(2026, 3, 6),
                    Email = "mariadelcarmenrondonvasquez@gmail.com",
                    FechaCreacion = DateTime.UtcNow,
                    FechaActualizacion = DateTime.UtcNow
                },
                new Empleado
                {
                    Codigo = "011",
                    Nombres = "José Manuel Peña Ventura",
                    TipoDocumento = "1",
                    Cedula = "402-2934971-3",
                    EStatus = "ACTIVO",
                    Puesto = "Ingeniero de Software Junior",
                    FechaIngreso = new DateTime(2026, 4, 6),
                    FechaNacimiento = new DateTime(2026, 9, 4),
                    Email = "josemanuelpenav507@gmail.com",
                    FechaCreacion = DateTime.UtcNow,
                    FechaActualizacion = DateTime.UtcNow
                },
                new Empleado
                {
                    Codigo = "012",
                    Nombres = "Daniel Emil Mejia Valerio",
                    TipoDocumento = "1",
                    Cedula = "402-0890983-4",
                    EStatus = "ACTIVO",
                    Puesto = "Ingeniero de Software Junior",
                    FechaIngreso = new DateTime(2026, 7, 1),
                    FechaNacimiento = new DateTime(2026, 1, 29),
                    Email = "danielemilmejia@gmail.com",
                    FechaCreacion = DateTime.UtcNow,
                    FechaActualizacion = DateTime.UtcNow
                },
                new Empleado
                {
                    Codigo = "013",
                    Nombres = "Denzel Martínez",
                    TipoDocumento = "1",
                    Cedula = "402-0202904-6",
                    EStatus = "ACTIVO",
                    Puesto = "Ingeniero de Software Junior",
                    FechaIngreso = new DateTime(2026, 7, 1),
                    FechaNacimiento = new DateTime(2026, 9, 17),
                    Email = "dmcarrion17@gmail.com",
                    FechaCreacion = DateTime.UtcNow,
                    FechaActualizacion = DateTime.UtcNow
                },
                new Empleado
                {
                    Codigo = "014",
                    Nombres = "Heral Reyes Sanchez",
                    TipoDocumento = "1",
                    Cedula = "402-1380047-3",
                    EStatus = "ACTIVO",
                    Puesto = "Ingeniero de Software Junior",
                    FechaIngreso = new DateTime(2026, 7, 1),
                    FechaNacimiento = new DateTime(2026, 7, 8),
                    Email = "heralsreyes@gmail.com",
                    FechaCreacion = DateTime.UtcNow,
                    FechaActualizacion = DateTime.UtcNow
                }
            };

            await context.Empleados.AddRangeAsync(empleadosIniciales);
            await context.SaveChangesAsync();
        }
    }
}