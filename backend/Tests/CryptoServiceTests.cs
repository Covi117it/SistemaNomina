using backend.Services;
using FluentAssertions;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.Extensions.DependencyInjection;
using Xunit;

namespace backend.Tests
{
    public class CryptoServiceTests
    {
        private readonly ICryptoService _cryptoService;

        public CryptoServiceTests()
        {
            var serviceCollection = new ServiceCollection();
            serviceCollection.AddDataProtection();
            var serviceProvider = serviceCollection.BuildServiceProvider();
            var dataProtectionProvider = serviceProvider.GetRequiredService<IDataProtectionProvider>();

            _cryptoService = new CryptoService(dataProtectionProvider);
        }

        [Fact]
        public void EncryptAndDecrypt_DeberiaRecuperarTextoOriginal()
        {
            // Arrange
            string claveOriginal = "MiPasswordSmtpSeguro123!";

            // Act
            string claveCifrada = _cryptoService.Encrypt(claveOriginal);
            string claveDescifrada = _cryptoService.Decrypt(claveCifrada);

            // Assert
            claveCifrada.Should().NotBeNullOrEmpty();
            claveCifrada.Should().NotBe(claveOriginal);
            claveDescifrada.Should().Be(claveOriginal);
        }

        [Fact]
        public void Encrypt_DeberiaManejarTextosVaciosONulos()
        {
            _cryptoService.Encrypt("").Should().Be("");
            _cryptoService.Encrypt(null!).Should().BeNull();
        }
    }
}