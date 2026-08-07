using Microsoft.AspNetCore.DataProtection;

namespace backend.Services
{
    public class CryptoService : ICryptoService
    {
        private readonly IDataProtector _protector;

        public CryptoService(IDataProtectionProvider provider)
        {
            _protector = provider.CreateProtector("backend.Services.CryptoService.v1");
        }

        public string Encrypt(string plainText)
        {
            if (string.IsNullOrEmpty(plainText)) return plainText;
            return _protector.Protect(plainText);
        }

        public string Decrypt(string cipherText)
        {
            if (string.IsNullOrEmpty(cipherText)) return cipherText;
            try
            {
                return _protector.Unprotect(cipherText);
            }
            catch
            {
                return cipherText; 
            }
        }
    }
}