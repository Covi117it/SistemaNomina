using System;
using System.IO;

namespace backend.Services.Pdf
{
    public static class PdfHelpers
    {
        public static string FormatearMonto(decimal monto)
        {
            if (monto == 0) return "-";
            return monto.ToString("N2");
        }

        public static string GetLogoPath()
        {
            var baseDir = AppDomain.CurrentDomain.BaseDirectory;
            var currentDir = Directory.GetCurrentDirectory();

            var possiblePaths = new[]
            {
                Path.Combine(currentDir, "wwwroot", "logo.png"),
                Path.Combine(currentDir, "wwwroot", "logo.jpg"),
                Path.Combine(baseDir, "wwwroot", "logo.png"),
                Path.Combine(currentDir, "assets", "logo.png")
            };

            foreach (var path in possiblePaths)
            {
                var fullPath = Path.GetFullPath(path);
                if (File.Exists(fullPath)) return fullPath;
            }
            return string.Empty;
        }
    }
}