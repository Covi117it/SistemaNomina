using System;
using System.Text.RegularExpressions;

namespace backend.Services
{
    public static class FormateadorFormatoRD
    {
        public static string FormatearCedula(string? raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return string.Empty;
            var digits = Regex.Replace(raw, @"\D", "");
            if (digits.Length == 11)
            {
                return $"{digits.Substring(0, 3)}-{digits.Substring(3, 7)}-{digits.Substring(10, 1)}";
            }
            return raw.Trim();
        }

        public static string FormatearFechaVista(DateTime? fecha)
        {
            if (!fecha.HasValue) return string.Empty;
            return fecha.Value.ToString("dd/MM/yyyy");
        }
    }
}