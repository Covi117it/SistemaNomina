using System;
using System.IO;
using QuestPDF.Drawing;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using backend.Common;
using backend.DTOs;
using backend.Models;
using backend.Services.Pdf;

namespace backend.Services
{
    public class PdfService : IPdfService
    {
        private static bool _fontsRegistered = false;
        private static readonly object _fontLock = new();

        static PdfService()
        {
            QuestPDF.Settings.License = LicenseType.Community;
            EnsureFontsRegistered();
        }

        public static void EnsureFontsRegistered()
        {
            if (_fontsRegistered) return;
            lock (_fontLock)
            {
                if (_fontsRegistered) return;
                try
                {
                    var baseDir = AppDomain.CurrentDomain.BaseDirectory;
                    var currentDir = Directory.GetCurrentDirectory();

                    var possibleDirs = new[]
                    {
                        Path.Combine(currentDir, "wwwroot", "fonts"),
                        Path.Combine(baseDir, "wwwroot", "fonts"),
                        "/usr/share/doc/pdfio/examples"
                    };

                    foreach (var dir in possibleDirs)
                    {
                        var regPath = Path.Combine(dir, "Roboto-Regular.ttf");
                        var boldPath = Path.Combine(dir, "Roboto-Bold.ttf");

                        if (File.Exists(regPath))
                        {
                            using (var s = File.OpenRead(regPath))
                            {
                                FontManager.RegisterFont(s);
                            }
                            if (File.Exists(boldPath))
                            {
                                using var sb = File.OpenRead(boldPath);
                                FontManager.RegisterFont(sb);
                            }
                            _fontsRegistered = true;
                            break;
                        }
                    }
                }
                catch
                {
                    // Fallback gracefully
                }
            }
        }

        [Obsolete]
        public byte[] GenerarVolantePdf(NominaItemDto item, string conceptoPeriodo)
        {
            item.NormalizarCalculos();

            var detalle = new NominaDetalle
            {
                CodigoEmpleado = item.CodigoEmpleado,
                NombreEmpleadoSnapshot = item.NombreEmpleado ?? "EMPLEADO",
                SueldoPeriodo = item.SueldoBase,
                Incentivo = item.Incentivo,
                Reembolso = item.Reembolso,
                HorasExtras = item.HorasExtras,
                Prestamo = item.Prestamo,
                CuotaCumpleanos = item.CuotaCumpleanos,
                SeguroVehiculo = item.SeguroVehiculo,
                SeguroMedico = item.SeguroMedico,
                Sfs = item.Sfs,
                Afp = item.Afp,
                Isr = item.Isr,
                TotalDevengado = item.TotalDevengado,
                TotalDeducciones = item.TotalDeducciones,
                NetoPagado = item.NetoAPagar
            };

            return GenerarVolantePdf(detalle, conceptoPeriodo);
        }

        [Obsolete]
        public byte[] GenerarVolantePdf(NominaDetalle detalle, string conceptoPeriodo)
        {
            var document = new VolantePagoDocument(detalle, conceptoPeriodo);
            return document.GeneratePdf();
        }
    }
}