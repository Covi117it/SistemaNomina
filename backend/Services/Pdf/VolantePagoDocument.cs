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

        public VolantePagoDocument(NominaDetalle detalle, string conceptoPeriodo)
        {
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
                page.Margin(15);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(9).FontFamily("Arial"));

                page.Content().Border(1).BorderColor(Colors.Black).Padding(12).Column(col =>
                {
                    ComposeHeader(col);
                    col.Item().PaddingVertical(5).LineHorizontal(1).LineColor(Colors.Black);
                    ComposeEmployeeInfo(col);
                    col.Item().PaddingVertical(5).LineHorizontal(1).LineColor(Colors.Black);
                    ComposeTables(col);
                    col.Item().PaddingVertical(5).LineHorizontal(1).LineColor(Colors.Black);
                    ComposeFooter(col);
                });
            });
        }

        private void ComposeHeader(ColumnDescriptor col)
        {
            col.Item().Row(headerRow =>
            {
                string logoPath = PdfHelpers.GetLogoPath();
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
        }

        private void ComposeEmployeeInfo(ColumnDescriptor col)
        {
            col.Item().AlignCenter().Column(infoCol =>
            {
                infoCol.Item().AlignCenter().Text(t =>
                {
                    t.Span("NOMBRE EMPLEADO: ").Bold();
                    t.Span($"{_detalle.CodigoEmpleado} - {_detalle.NombreEmpleadoSnapshot.ToUpper()}").Bold();
                });
                infoCol.Item().AlignCenter().Text(t =>
                {
                    t.Span("PERIODO DE PAGO: ").Bold();
                    t.Span(_conceptoPeriodo.ToUpper()).Bold();
                });
            });
        }

        [Obsolete]
        private void ComposeTables(ColumnDescriptor col)
        {
            col.Item().Grid(grid =>
            {
                grid.Columns(12);

                // Columna Izquierda: DEVENGADOS
                grid.Item(6).PaddingRight(12).Column(devCol =>
                {
                    devCol.Item().Text("DEVENGADO POR :").Bold().Underline();
                    devCol.Item().PaddingTop(4);

                    devCol.Item().Row(r => { r.RelativeItem().Text("SUELDO QUINCENAL"); r.ConstantItem(80).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.SueldoPeriodo)); });
                    devCol.Item().Row(r => { r.RelativeItem().Text("EXTRAS"); r.ConstantItem(80).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.HorasExtras)); });
                    devCol.Item().Row(r => { r.RelativeItem().Text("COMISIONES"); r.ConstantItem(80).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.Incentivo)); });
                    devCol.Item().Row(r => { r.RelativeItem().Text("OTROS"); r.ConstantItem(80).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.Reembolso)); });

                    devCol.Item().PaddingTop(10).Row(r =>
                    {
                        r.RelativeItem().Text("TOTAL DEVENGADO").Bold();
                        r.ConstantItem(110)
                         .Background("#A8D08D")
                         .Border(1)
                         .BorderColor(Colors.Black)
                         .PaddingHorizontal(4)
                         .AlignRight()
                         .Text(PdfHelpers.FormatearMonto(_detalle.TotalDevengado))
                         .Bold();
                    });

                    devCol.Item().PaddingTop(14).Text("Recibí a satisfacción y acepto en todas sus partes este pago.").FontSize(7.5f).Italic();
                });

                // Columna Derecha: DEDUCCIONES
                grid.Item(6).PaddingLeft(12).Column(dedCol =>
                {
                    dedCol.Item().Text("DEDUCCIONES :").Bold().Underline();
                    dedCol.Item().PaddingTop(4);

                    dedCol.Item().Row(r => { r.RelativeItem().Text("SFS"); r.ConstantItem(80).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.Sfs)); });
                    dedCol.Item().Row(r => { r.RelativeItem().Text("AFP"); r.ConstantItem(80).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.Afp)); });
                    dedCol.Item().Row(r => { r.RelativeItem().Text("ISR"); r.ConstantItem(80).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.Isr)); });
                    dedCol.Item().Row(r => { r.RelativeItem().Text("SEGURO MÉDICO"); r.ConstantItem(80).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.SeguroMedico)); });
                    dedCol.Item().Row(r => { r.RelativeItem().Text("CTA X COBRAR"); r.ConstantItem(80).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.Prestamo + _detalle.SeguroVehiculo)); });
                    dedCol.Item().Row(r => { r.RelativeItem().Text("Otros: Cumpleaños"); r.ConstantItem(80).AlignRight().Text(PdfHelpers.FormatearMonto(_detalle.CuotaCumpleanos)); });

                    dedCol.Item().PaddingTop(6).Row(r =>
                    {
                        r.RelativeItem().Text("TOTAL DEDUCCIONES").Bold();
                        r.ConstantItem(100)
                         .Background("#FFC7CE")
                         .Border(1)
                         .BorderColor(Colors.Black)
                         .PaddingHorizontal(4)
                         .AlignRight()
                         .Text(PdfHelpers.FormatearMonto(_detalle.TotalDeducciones))
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
                         .Text(PdfHelpers.FormatearMonto(_detalle.NetoPagado))
                         .Bold();
                    });
                });
            });
        }

        private void ComposeFooter(ColumnDescriptor col)
        {
            col.Item().AlignCenter().Text($"Pago de nómina correspondiente a {_conceptoPeriodo.ToLower()}").Bold().FontSize(8.5f);
        }
    }
}