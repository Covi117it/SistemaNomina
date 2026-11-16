using System;
using System.IO;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using backend.Models;

namespace backend.Services.Pdf
{
    public class VolantePagoDocument : IDocument
    {
        private readonly NominaDetalle _detalle;
        private readonly string _conceptoPeriodo;

        // Paleta de colores corporativa
        private const string PrimaryGreen = "#184E28";
        private const string AccentGreen = "#1E6B34";
        private const string LightCardBg = "#F4F7F4";
        private const string LightBorder = "#D1DDD2";
        private const string TextDark = "#1F2937";

        // Íconos SVG vectoriales compatibles con Linux / CachyOS (sin dependencias de fuentes emoji)
        private const string UserSvg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#184E28' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'/><circle cx='12' cy='7' r='4'/></svg>";
        private const string CalcSvg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><rect x='4' y='2' width='16' height='20' rx='2'/><line x1='8' y1='6' x2='16' y2='6'/><line x1='16' y1='14' x2='16' y2='18'/><circle cx='8' cy='10' r='1' fill='white'/><circle cx='12' cy='10' r='1' fill='white'/><circle cx='16' cy='10' r='1' fill='white'/><circle cx='8' cy='14' r='1' fill='white'/><circle cx='12' cy='14' r='1' fill='white'/><circle cx='8' cy='18' r='1' fill='white'/><circle cx='12' cy='18' r='1' fill='white'/></svg>";
        private const string CheckSvg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='#1E6B34' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><polyline points='20 6 9 17 4 12'/></svg>";

        public VolantePagoDocument(NominaDetalle detalle, string conceptoPeriodo)
        {
            PdfService.EnsureFontsRegistered();
            _detalle = detalle;
            _conceptoPeriodo = conceptoPeriodo;
        }

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;
        public DocumentSettings GetSettings() => DocumentSettings.Default;

        [Obsolete]
        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A5.Landscape());
                page.Margin(16);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(9f).FontFamily("Roboto").FontColor(TextDark));

                page.Content().Column(col =>
                {
                    // Encabezado con logo y título
                    ComposeHeader(col);

                    col.Item().PaddingTop(10);

                    // Tarjeta con datos del empleado y período
                    ComposeEmployeeCard(col);

                    col.Item().PaddingTop(12);

                    // Tablas de devengados y deducciones
                    ComposeMainTables(col);

                    col.Item().PaddingTop(10);

                    // Pie de página y sello
                    ComposeFooterWithSeal(col);
                });
            });
        }

        private void ComposeHeader(ColumnDescriptor col)
        {
            col.Item().Row(row =>
            {
                string logoPath = PdfHelpers.GetLogoPath();
                if (!string.IsNullOrEmpty(logoPath) && File.Exists(logoPath))
                {
                    row.ConstantItem(120)
                       .MaxHeight(36)
                       .AlignLeft()
                       .AlignMiddle()
                       .Image(logoPath)
                       .FitArea();
                }
                else
                {
                    row.ConstantItem(120).AlignMiddle().Text(t =>
                    {
                        t.Span("En").Bold().FontSize(18).FontColor(AccentGreen);
                        t.Span("foco").Bold().FontSize(18).FontColor(TextDark);
                    });
                }

                row.RelativeItem().AlignMiddle().Row(titleRow =>
                {
                    titleRow.RelativeItem().PaddingRight(8).AlignMiddle().LineHorizontal(1).LineColor(LightBorder);
                    titleRow.AutoItem().Text("COMPROBANTE DE PAGO DE NÓMINA").Bold().FontSize(11).FontColor(PrimaryGreen);
                    titleRow.RelativeItem().PaddingLeft(8).AlignMiddle().LineHorizontal(1).LineColor(LightBorder);
                });
            });
        }

        private void ComposeEmployeeCard(ColumnDescriptor col)
        {
            col.Item()
               .Background(LightCardBg)
               .Border(1)
               .BorderColor(LightBorder)
               .CornerRadius(6)
               .PaddingVertical(8)
               .PaddingHorizontal(14)
               .Row(row =>
               {
                   row.ConstantItem(32).AlignCenter().AlignMiddle().Container()
                      .Width(28).Height(28)
                      .Background("#E1EAE2")
                      .CornerRadius(14)
                      .AlignCenter().AlignMiddle()
                      .Padding(5)
                      .Svg(UserSvg);
                   row.RelativeItem().PaddingLeft(10).Column(c =>
                   {
                       c.Item().Text(t =>
                       {
                           t.Span("NOMBRE EMPLEADO: ").Bold().FontSize(8.5f).FontColor(TextDark);
                           t.Span($"{_detalle.CodigoEmpleado} - {_detalle.NombreEmpleadoSnapshot.ToUpper()}").Bold().FontSize(8.5f).FontColor(TextDark);
                       });
                       c.Item().PaddingTop(2).Text(t =>
                       {
                           t.Span("PERIODO DE PAGO: ").Bold().FontSize(8.5f).FontColor(TextDark);
                           t.Span(_conceptoPeriodo.ToUpper()).Bold().FontSize(8.5f).FontColor(TextDark);
                       });
                   });
               });
        }

        [Obsolete]
        private void ComposeMainTables(ColumnDescriptor col)
        {
            decimal sueldoMostrar = _detalle.SueldoPeriodo;
            decimal devengadoMostrar = _detalle.TotalDevengado;

            if (sueldoMostrar <= 0 && devengadoMostrar > 0)
            {
                sueldoMostrar = Math.Max(0m, devengadoMostrar - (_detalle.HorasExtras + _detalle.Incentivo + _detalle.Reembolso));
            }
            else if (devengadoMostrar <= 0 && sueldoMostrar > 0)
            {
                devengadoMostrar = sueldoMostrar + _detalle.HorasExtras + _detalle.Incentivo + _detalle.Reembolso;
            }

            col.Item().Row(mainRow =>
            {
                // Columna Izquierda: DEVENGADOS
                mainRow.RelativeItem(5).Column(devCol =>
                {
                    devCol.Item().Row(r =>
                    {
                        r.ConstantItem(18).Container()
                         .Width(16).Height(16)
                         .Background(AccentGreen)
                         .CornerRadius(8)
                         .AlignCenter().AlignMiddle()
                         .Text("$").Bold().FontSize(8.5f).FontColor(Colors.White);

                        r.RelativeItem().PaddingLeft(6).AlignMiddle()
                         .Text("DEVENGADO POR:").Bold().FontSize(9f).FontColor(PrimaryGreen);
                    });

                    devCol.Item().PaddingTop(6);

                    devCol.Item().Row(r => { r.RelativeItem().Text("SUELDO QUINCENAL").FontSize(8.5f); r.ConstantItem(90).AlignRight().Text(PdfHelpers.FormatearMonto(sueldoMostrar)).FontSize(9.5f).FontColor(TextDark); });
                    devCol.Item().PaddingTop(3).Row(r => { r.RelativeItem().Text("EXTRAS").FontSize(8.5f); r.ConstantItem(90).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.HorasExtras)).FontSize(9.5f).FontColor(TextDark); });
                    devCol.Item().PaddingTop(3).Row(r => { r.RelativeItem().Text("COMISIONES").FontSize(8.5f); r.ConstantItem(90).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.Incentivo)).FontSize(9.5f).FontColor(TextDark); });
                    devCol.Item().PaddingTop(3).Row(r => { r.RelativeItem().Text("OTROS").FontSize(8.5f); r.ConstantItem(90).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.Reembolso)).FontSize(9.5f).FontColor(TextDark); });

                    devCol.Item().PaddingTop(12).Row(r =>
                    {
                        r.RelativeItem().AlignMiddle().Text("TOTAL DEVENGADO").Bold().FontSize(9.5f).FontColor(PrimaryGreen);
                        r.ConstantItem(100)
                         .Background(AccentGreen)
                         .CornerRadius(5)
                         .PaddingVertical(4)
                         .PaddingHorizontal(8)
                         .AlignRight()
                         .Text(PdfHelpers.FormatearMonto(devengadoMostrar))
                         .Bold()
                         .FontSize(11.5f)
                         .FontColor(Colors.White);
                    });

                    devCol.Item().PaddingTop(10).Text("Recibí a satisfacción y acepto en todas sus partes este pago.").FontSize(7f).Italic().FontColor(Colors.Grey.Darken1);
                });

                // Divisor Vertical Central
                mainRow.ConstantItem(24).AlignCenter().LineVertical(1).LineColor("#E5E7EB");

                // Columna Derecha: DEDUCCIONES
                mainRow.RelativeItem(5).Column(dedCol =>
                {
                    dedCol.Item().Row(r =>
                    {
                        r.ConstantItem(18).Container()
                         .Width(16).Height(16)
                         .Background(AccentGreen)
                         .CornerRadius(8)
                         .AlignCenter().AlignMiddle()
                         .Padding(3)
                         .Svg(CalcSvg);

                        r.RelativeItem().PaddingLeft(6).AlignMiddle()
                         .Text("DEDUCCIONES:").Bold().FontSize(9f).FontColor(PrimaryGreen);
                    });

                    dedCol.Item().PaddingTop(6);

                    dedCol.Item().Row(r => { r.RelativeItem().Text("SFS").FontSize(8.5f); r.ConstantItem(90).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.Sfs)).FontSize(9.5f).FontColor(TextDark); });
                    dedCol.Item().PaddingTop(3).Row(r => { r.RelativeItem().Text("AFP").FontSize(8.5f); r.ConstantItem(90).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.Afp)).FontSize(9.5f).FontColor(TextDark); });
                    dedCol.Item().PaddingTop(3).Row(r => { r.RelativeItem().Text("ISR").FontSize(8.5f); r.ConstantItem(90).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.Isr)).FontSize(9.5f).FontColor(TextDark); });
                    dedCol.Item().PaddingTop(3).Row(r => { r.RelativeItem().Text("SEGURO MÉDICO").FontSize(8.5f); r.ConstantItem(90).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.SeguroMedico)).FontSize(9.5f).FontColor(TextDark); });
                    dedCol.Item().PaddingTop(3).Row(r => { r.RelativeItem().Text("CTA X COBRAR").FontSize(8.5f); r.ConstantItem(90).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.Prestamo + _detalle.SeguroVehiculo)).FontSize(9.5f).FontColor(TextDark); });
                    dedCol.Item().PaddingTop(3).Row(r => { r.RelativeItem().Text("Otros: Cumpleaños").FontSize(8.5f); r.ConstantItem(90).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.CuotaCumpleanos)).FontSize(9.5f).FontColor(TextDark); });

                    dedCol.Item().PaddingTop(8).Row(r =>
                    {
                        r.RelativeItem().AlignMiddle().Text("TOTAL DEDUCCIONES").Bold().FontSize(9.5f).FontColor(TextDark);
                        r.ConstantItem(100)
                         .Background(LightCardBg)
                         .Border(1)
                         .BorderColor(LightBorder)
                         .CornerRadius(5)
                         .PaddingVertical(4)
                         .PaddingHorizontal(8)
                         .AlignRight()
                         .Text(PdfHelpers.FormatearMonto(_detalle.TotalDeducciones))
                         .Bold()
                         .FontSize(10.5f)
                         .FontColor(TextDark);
                    });

                    dedCol.Item().PaddingTop(6).Row(r =>
                    {
                        r.RelativeItem().AlignMiddle().Text("NETO PAGADO").Bold().FontSize(10f).FontColor(PrimaryGreen);
                        r.ConstantItem(100)
                         .Background(AccentGreen)
                         .CornerRadius(5)
                         .PaddingVertical(4)
                         .PaddingHorizontal(8)
                         .AlignRight()
                         .Text(PdfHelpers.FormatearMonto(_detalle.NetoPagado))
                         .Bold()
                         .FontSize(12f)
                         .FontColor(Colors.White);
                    });
                });
            });
        }

        private void ComposeFooterWithSeal(ColumnDescriptor col)
        {
            col.Item().PaddingTop(6).Row(r =>
            {
                r.RelativeItem().AlignMiddle().LineHorizontal(1).LineColor(LightBorder);
                r.ConstantItem(26).Container()
                 .Width(20).Height(20)
                 .Background(Colors.White)
                 .Border(1.2f)
                 .BorderColor(AccentGreen)
                 .CornerRadius(10)
                 .AlignCenter().AlignMiddle()
                 .Padding(3)
                 .Svg(CheckSvg);
                r.RelativeItem().AlignMiddle().LineHorizontal(1).LineColor(LightBorder);
            });

            col.Item().PaddingTop(3).AlignCenter().Column(c =>
            {
                c.Item().AlignCenter().Text("Pago de nómina correspondiente a").FontSize(8f).FontColor(Colors.Grey.Darken2);
                c.Item().AlignCenter().Text(_conceptoPeriodo.ToLower()).Bold().FontSize(8.5f).FontColor(AccentGreen);
            });
        }
    }
}