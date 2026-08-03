using System;
using System.IO;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public class PdfService : IPdfService
    {
        static PdfService()
        {
            QuestPDF.Settings.License = LicenseType.Community;
        }

        [Obsolete]
        public byte[] GenerarVolantePdf(NominaItemDto item, string conceptoPeriodo)
        {
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
            return Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A5.Landscape()); 
                    page.Margin(15);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(9).FontFamily("Arial"));

                    page.Content().Border(1).BorderColor(Colors.Black).Padding(12).Column(col =>
                    {
                        // 1. Encabezado con Logo a la Izquierda y Títulos Centrados
                        col.Item().Row(headerRow =>
                        {
                            string logoPath = GetLogoPath();
                            if (!string.IsNullOrEmpty(logoPath) && File.Exists(logoPath))
                            {
                                headerRow.ConstantItem(100)
                                         .MaxHeight(35)
                                         .AlignLeft()
                                         .AlignMiddle()
                                         .Image(logoPath)
                                         .FitArea();
                            }
                            else
                            {
                                headerRow.ConstantItem(100);
                            }

                            headerRow.RelativeItem().AlignCenter().Column(headerCol =>
                            {
                                headerCol.Item().AlignCenter().Text("ENFOCO").Bold().FontSize(14);
                                headerCol.Item().AlignCenter().Text("COMPROBANTE DE PAGO DE NÓMINA").Bold().FontSize(10).FontColor(Colors.Grey.Darken2);
                            });

                            headerRow.ConstantItem(100);
                        });

                        col.Item().PaddingVertical(5).LineHorizontal(1).LineColor(Colors.Black);

                        // 2. Información del Empleado y Período (Valores centrados en la columna derecha)
                        col.Item().AlignCenter().Column(infoCol =>
{
    infoCol.Item().AlignCenter().Text(t =>
    {
        t.Span("NOMBRE EMPLEADO: ").Bold();
        t.Span($"{detalle.CodigoEmpleado} - {detalle.NombreEmpleadoSnapshot.ToUpper()}").Bold();
    });
    infoCol.Item().AlignCenter().Text(t =>
    {
        t.Span("PERIODO DE PAGO: ").Bold();
        t.Span(conceptoPeriodo.ToUpper()).Bold();
    });
});

                        col.Item().PaddingVertical(5).LineHorizontal(1).LineColor(Colors.Black);

                        // 3. Tablas de Devengados vs Deducciones
                        col.Item().Grid(grid =>
                        {
                            grid.Columns(12);

                            // Columna Izquierda: DEVENGADOS
                            grid.Item(6).PaddingRight(12).Column(devCol =>
                            {
                                devCol.Item().Text("DEVENGADO POR :").Bold().Underline();
                                devCol.Item().PaddingTop(4);

                                devCol.Item().Row(r => { r.RelativeItem().Text("SUELDO QUINCENAL"); r.ConstantItem(80).AlignRight().Text(FormatearMonto(detalle.SueldoPeriodo)); });
                                devCol.Item().Row(r => { r.RelativeItem().Text("EXTRAS"); r.ConstantItem(80).AlignRight().Text(FormatearMonto(detalle.HorasExtras)); });
                                devCol.Item().Row(r => { r.RelativeItem().Text("COMISIONES"); r.ConstantItem(80).AlignRight().Text(FormatearMonto(detalle.Incentivo)); });
                                devCol.Item().Row(r => { r.RelativeItem().Text("OTROS"); r.ConstantItem(80).AlignRight().Text(FormatearMonto(detalle.Reembolso)); });
                                
                                devCol.Item().PaddingTop(10).Row(r =>
                                {
                                    r.RelativeItem().Text("TOTAL DEVENGADO").Bold();
                                    r.ConstantItem(110)
                                     .Background("#A8D08D")
                                     .Border(1)
                                     .BorderColor(Colors.Black)
                                     .PaddingHorizontal(4)
                                     .AlignRight()
                                     .Text(FormatearMonto(detalle.TotalDevengado))
                                     .Bold();
                                });

                                devCol.Item().PaddingTop(14).Text("Recibí a satisfacción y acepto en todas sus partes este pago.").FontSize(7.5f).Italic();
                            });

                            // Columna Derecha: DEDUCCIONES
                            grid.Item(6).PaddingLeft(12).Column(dedCol =>
                            {
                                dedCol.Item().Text("DEDUCCIONES :").Bold().Underline();
                                dedCol.Item().PaddingTop(4);

                                dedCol.Item().Row(r => { r.RelativeItem().Text("SFS"); r.ConstantItem(80).AlignRight().Text(FormatearMonto(detalle.Sfs)); });
                                dedCol.Item().Row(r => { r.RelativeItem().Text("AFP"); r.ConstantItem(80).AlignRight().Text(FormatearMonto(detalle.Afp)); });
                                dedCol.Item().Row(r => { r.RelativeItem().Text("ISR"); r.ConstantItem(80).AlignRight().Text(FormatearMonto(detalle.Isr)); });
                                dedCol.Item().Row(r => { r.RelativeItem().Text("SEGURO MÉDICO"); r.ConstantItem(80).AlignRight().Text(FormatearMonto(detalle.SeguroMedico)); });
                                dedCol.Item().Row(r => { r.RelativeItem().Text("CTA X COBRAR"); r.ConstantItem(80).AlignRight().Text(FormatearMonto(detalle.Prestamo + detalle.SeguroVehiculo)); });
                                dedCol.Item().Row(r => { r.RelativeItem().Text("Otros: Cumpleaños"); r.ConstantItem(80).AlignRight().Text(FormatearMonto(detalle.CuotaCumpleanos)); });

                                dedCol.Item().PaddingTop(6).Row(r =>
                                {
                                    r.RelativeItem().Text("TOTAL DEDUCCIONES").Bold();
                                    r.ConstantItem(100)
                                     .Background("#FFC7CE")
                                     .Border(1)
                                     .BorderColor(Colors.Black)
                                     .PaddingHorizontal(4)
                                     .AlignRight()
                                     .Text(FormatearMonto(detalle.TotalDeducciones))
                                     .FontColor("#9C0006")
                                     .Bold();
                                });

                                dedCol.Item().PaddingTop(3).Row(r =>
                                {
                                    r.RelativeItem().Text("NETO PAGADO").Bold();
                                    r.ConstantItem(100)
                                     .Background("#A8D08D")
                                     .Border(1)
                                     .BorderColor(Colors.Black)
                                     .PaddingHorizontal(4)
                                     .AlignRight()
                                     .Text(FormatearMonto(detalle.NetoPagado))
                                     .Bold();
                                });
                            });
                        });

                        col.Item().PaddingVertical(5).LineHorizontal(1).LineColor(Colors.Black);
                        col.Item().AlignCenter().Text($"Pago de nómina correspondiente a {conceptoPeriodo.ToLower()}").Bold().FontSize(8.5f);
                    });
                });
            }).GeneratePdf();
        }

        private static string FormatearMonto(decimal monto)
        {
            if (monto == 0) return "-";
            return monto.ToString("N2");
        }

        private static string GetLogoPath()
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