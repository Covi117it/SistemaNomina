using backend.Services;
using FluentAssertions;
using Xunit;

namespace backend.Tests
{
    public class ValidadorDocumentoRDTests
    {
        [Theory]
        [InlineData("00100000000", false)]
        [InlineData("40225896321", false)]
        [InlineData("", false)]
        [InlineData(null, false)]
        public void ValidarCedula_DeberiaRechazarCedulasInvalidas(string? cedula, bool resultadoEsperado)
        {
            // Act
            bool esValida = ValidadorDocumentoRD.ValidarCedula(cedula);

            // Assert
            esValida.Should().Be(resultadoEsperado);
        }

        [Theory]
        // Casos Válidos - Pasaporte Dominicano Oficial (2 letras + 7 dígitos)
        [InlineData("AA1234567", true)]
        [InlineData("RD7654321", true)]
        [InlineData("aa1234567", true)]

        // Casos Válidos - Pasaporte Extranjero OACI Doc 9303 (6 a 9 caracteres alfanuméricos)
        [InlineData("A1234567", true)]
        [InlineData("P123456", true)]
        [InlineData("987654321", true)]
        [InlineData("AB12CD", true)]

        // Casos Inválidos
        [InlineData("12345", false)]
        [InlineData("ABC12345678", false)]
        [InlineData("PASAPORTE123", false)]
        [InlineData("AA-123456", false)]
        [InlineData("AA 123456", false)]
        [InlineData("", false)]
        [InlineData("   ", false)]
        [InlineData(null, false)]
        public void ValidarPasaporte_DeberiaValidarFormatoDualDominicanoYEstranjeroOACI(string? pasaporte, bool resultadoEsperado)
        {
            // Act
            bool esValido = ValidadorDocumentoRD.ValidarPasaporte(pasaporte);

            // Assert
            esValido.Should().Be(resultadoEsperado);
        }
    }
}
