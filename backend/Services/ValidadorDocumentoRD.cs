using System.Text.RegularExpressions;

namespace backend.Services
{
    public static class ValidadorDocumentoRD
    {
        public static bool ValidarCedula(string? cedula)
        {
            if (string.IsNullOrWhiteSpace(cedula)) return false;
            var digits = Regex.Replace(cedula, @"\D", "");
            if (digits.Length != 11) return false;

            int[] multiplicadores = { 1, 2, 1, 2, 1, 2, 1, 2, 1, 2 };
            int sumaTotal = 0;

            for (int i = 0; i < 10; i++)
            {
                int digito = digits[i] - '0';
                int prod = digito * multiplicadores[i];
                if (prod >= 10)
                {
                    prod = (prod / 10) + (prod % 10);
                }
                sumaTotal += prod;
            }

            int digitoVerificadorCalculado = (10 - (sumaTotal % 10)) % 10;
            int digitoVerificadorReal = digits[10] - '0';

            return digitoVerificadorCalculado == digitoVerificadorReal;
        }

        public static bool ValidarPasaporte(string? pasaporte)
        {
            if (string.IsNullOrWhiteSpace(pasaporte)) return false;
            var clean = pasaporte.Trim().ToUpperInvariant();
            bool esDominicano = Regex.IsMatch(clean, @"^[A-Z]{2}\d{7}$");
            if (esDominicano) return true;
            bool esOaciInternacional = Regex.IsMatch(clean, @"^[A-Z0-9]{6,9}$");
            return esOaciInternacional;
        }
    }
}