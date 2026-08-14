using backend.DTOs;
using FluentAssertions;
using Xunit;

namespace backend.Tests
{
    public class NominaFallbackTests
    {
        [Fact]
        public void TotalDevengado_DeberiaPermitirSetYMantenerValorExplicitamente()
        {
            // Arrange
            var dto = new NominaItemDto
            {
                SueldoBase = 0m,
                Incentivo = 0m,
                Reembolso = 0m,
                HorasExtras = 0m,
                TotalDevengado = 25000m
            };

            // Assert
            dto.TotalDevengado.Should().Be(25000m);
        }

        [Fact]
        public void TotalDevengado_DeberiaCalcularSumaSiNoSeEspecifico()
        {
            // Arrange
            var dto = new NominaItemDto
            {
                SueldoBase = 20000m,
                Incentivo = 1000m,
                Reembolso = 500m,
                HorasExtras = 2000m
            };

            // Assert
            dto.TotalDevengado.Should().Be(23500m);
        }
    }
}
