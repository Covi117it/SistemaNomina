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
        [InlineData("PASAPORTE123", true)]
        [InlineData("ABC12345", true)]
        [InlineData("123", false)] // Muy corto
        [InlineData("", false)]
        public void ValidarPasaporte_DeberiaValidarFormatoYLongitud(string? pasaporte, bool resultadoEsperado)
        {
            // Act
            bool esValido = ValidadorDocumentoRD.ValidarPasaporte(pasaporte);

            // Assert
            esValido.Should().Be(resultadoEsperado);
        }
    }
}
