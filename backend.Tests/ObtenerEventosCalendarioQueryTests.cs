using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using backend.Application.Features.Nomina.Queries;
using backend.Data;
using backend.Models;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace backend.Tests
{
    public class ObtenerEventosCalendarioQueryTests
    {
        private (AppDbContext db, SqliteConnection connection) GetInMemoryDbContext()
        {
            var connection = new SqliteConnection("DataSource=:memory:");
            connection.Open();

            var options = new DbContextOptionsBuilder<AppDbContext>()
                .UseSqlite(connection)
                .Options;

            var db = new AppDbContext(options);
            db.Database.EnsureCreated();

            return (db, connection);
        }

        private object? GetResultValue(IResult result)
        {
            return result.GetType().GetProperty("Value", BindingFlags.Public | BindingFlags.Instance)?.GetValue(result);
        }

        [Fact]
        public async Task HandleAsync_MesActual_DeberiaIncluirEventosAutomaticos()
        {
            // Arrange
            var (db, connection) = GetInMemoryDbContext();
            using (connection)
            using (db)
            {
                var handler = new ObtenerEventosCalendarioQueryHandler(db);
                var hoy = DateTime.Now;

                // Act
                var result = await handler.HandleAsync(new ObtenerEventosCalendarioQuery(hoy.Year, hoy.Month));

                // Assert
                var val = GetResultValue(result);
                val.Should().NotBeNull();

                var eventosProp = val!.GetType().GetProperty("eventos")?.GetValue(val) as System.Collections.IEnumerable;
                eventosProp.Should().NotBeNull();

                var eventosList = eventosProp!.Cast<object>().ToList();
                eventosList.Should().NotBeEmpty();
                eventosList.Any(e => e.GetType().GetProperty("id")?.GetValue(e)?.ToString() == "auto-1").Should().BeTrue();
            }
        }

        [Fact]
        public async Task HandleAsync_MesFuturo_NoDeberiaIncluirEventosAutomaticos()
        {
            // Arrange
            var (db, connection) = GetInMemoryDbContext();
            using (connection)
            using (db)
            {
                var handler = new ObtenerEventosCalendarioQueryHandler(db);
                var hoy = DateTime.Now;
                var mesFuturo = hoy.AddMonths(1);

                // Act
                var result = await handler.HandleAsync(new ObtenerEventosCalendarioQuery(mesFuturo.Year, mesFuturo.Month));

                // Assert
                var val = GetResultValue(result);
                val.Should().NotBeNull();

                var eventosProp = val!.GetType().GetProperty("eventos")?.GetValue(val) as System.Collections.IEnumerable;
                var eventosList = eventosProp!.Cast<object>().ToList();

                // En un mes futuro sin eventos de usuario, no debe haber ningún evento (ni auto-1 ni auto-2)
                eventosList.Should().BeEmpty();
            }
        }

        [Fact]
        public async Task HandleAsync_MesPasado_NoDeberiaIncluirEventosAutomaticos()
        {
            // Arrange
            var (db, connection) = GetInMemoryDbContext();
            using (connection)
            using (db)
            {
                var handler = new ObtenerEventosCalendarioQueryHandler(db);
                var hoy = DateTime.Now;
                var mesPasado = hoy.AddMonths(-1);

                // Act
                var result = await handler.HandleAsync(new ObtenerEventosCalendarioQuery(mesPasado.Year, mesPasado.Month));

                // Assert
                var val = GetResultValue(result);
                val.Should().NotBeNull();

                var eventosProp = val!.GetType().GetProperty("eventos")?.GetValue(val) as System.Collections.IEnumerable;
                var eventosList = eventosProp!.Cast<object>().ToList();

                // En un mes pasado sin eventos de usuario, no debe haber ningún evento automático
                eventosList.Should().BeEmpty();
            }
        }
    }
}
