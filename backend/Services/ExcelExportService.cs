using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using backend.Models;
using ClosedXML.Excel;

namespace backend.Services
{
    public class ExcelExportService : IExcelExportService
    {
        public byte[] GenerarExcelEmpleados(List<Empleado> empleados)
        {
            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Directorio Empleados");

            worksheet.ShowGridLines = true;
            worksheet.Style.Font.FontName = "Segoe UI";
            worksheet.Style.Font.FontSize = 10;

            // --- FILA 1: TÍTULO EJECUTIVO ---
            var titleRange = worksheet.Range("A1:H1");
            titleRange.Merge().Value = "SISTEMA DE NÓMINA - DIRECTORIO GENERAL DE EMPLEADOS";
            titleRange.Style.Font.Bold = true;
            titleRange.Style.Font.FontSize = 13;
            titleRange.Style.Font.FontColor = XLColor.White;
            titleRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#0F5132");
            titleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            titleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            worksheet.Row(1).Height = 30;

            // --- FILA 2: SUBTÍTULO ---
            var subtitleRange = worksheet.Range("A2:H2");
            subtitleRange.Merge().Value = $"FECHA DE GENERACIÓN: {DateTime.Now:dd/MM/yyyy HH:mm}  |  TOTAL REGISTROS: {empleados?.Count ?? 0}";
            subtitleRange.Style.Font.Italic = true;
            subtitleRange.Style.Font.FontSize = 9.5;
            subtitleRange.Style.Font.FontColor = XLColor.FromHtml("#374151");
            subtitleRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#F3F4F6");
            subtitleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            subtitleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            worksheet.Row(2).Height = 20;

            // --- FILA 4: ENCABEZADOS DE COLUMNA ---
            worksheet.Row(4).Height = 24;
            string[] headers = new string[]
            {
                "CÓDIGO", "NOMBRES Y APELLIDOS", "TIPO DOC.", "CÉDULA / PASAPORTE",
                "CORREO ELECTRÓNICO", "PUESTO / CARGO", "ESTATUS", "FECHA DE INGRESO"
            };

            for (int col = 0; col < headers.Length; col++)
            {
                var cell = worksheet.Cell(4, col + 1);
                cell.Value = headers[col];
                cell.Style.Font.Bold = true;
                cell.Style.Font.FontSize = 9.5;
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Fill.BackgroundColor = XLColor.FromHtml("#0F172A");
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                cell.Style.Border.OutsideBorderColor = XLColor.FromHtml("#334155");
            }

            // --- FILAS DE DATOS (Fila 5 en adelante) ---
            int row = 5;
            var listaEmpleados = empleados ?? new List<Empleado>();
            foreach (var emp in listaEmpleados)
            {
                worksheet.Row(row).Height = 20;

                string rowBgColor = (row % 2 == 0) ? "#FFFFFF" : "#F8FAFC";
                var rowRange = worksheet.Range(row, 1, row, 8);
                rowRange.Style.Fill.BackgroundColor = XLColor.FromHtml(rowBgColor);

                string tipoDoc = emp.TipoDocumento == "2" ? "Pasaporte" : "Cédula";
                string fechaIngreso = emp.FechaIngreso.HasValue ? emp.FechaIngreso.Value.ToString("dd/MM/yyyy") : "-";

                worksheet.Cell(row, 1).SetValue(emp.Codigo).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                worksheet.Cell(row, 2).SetValue(emp.Nombres);
                worksheet.Cell(row, 3).SetValue(tipoDoc).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                worksheet.Cell(row, 4).SetValue(emp.Cedula).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                worksheet.Cell(row, 5).SetValue(emp.Email);
                worksheet.Cell(row, 6).SetValue(emp.Puesto ?? "Sin Asignar");

                var cellEstatus = worksheet.Cell(row, 7);
                string estatusVal = (emp.EStatus ?? "ACTIVO").ToUpper();
                cellEstatus.SetValue(estatusVal);
                cellEstatus.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cellEstatus.Style.Font.Bold = true;

                if (estatusVal == "ACTIVO")
                {
                    cellEstatus.Style.Fill.BackgroundColor = XLColor.FromHtml("#D1FAE5");
                    cellEstatus.Style.Font.FontColor = XLColor.FromHtml("#065F46");
                }
                else
                {
                    cellEstatus.Style.Fill.BackgroundColor = XLColor.FromHtml("#FEE2E2");
                    cellEstatus.Style.Font.FontColor = XLColor.FromHtml("#991B1B");
                }

                worksheet.Cell(row, 8).SetValue(fechaIngreso).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                rowRange.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
                rowRange.Style.Border.InsideBorderColor = XLColor.FromHtml("#E2E8F0");
                rowRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                rowRange.Style.Border.OutsideBorderColor = XLColor.FromHtml("#CBD5E1");

                row++;
            }

            worksheet.Columns().AdjustToContents();
            foreach (var column in worksheet.Columns())
            {
                column.Width = Math.Max(column.Width + 4.5, 14);
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        public byte[] GenerarExcelNomina(NominaPeriodo periodo)
        {
            if (periodo == null) return Array.Empty<byte>();

            using var workbook = new XLWorkbook();
            var worksheet = workbook.Worksheets.Add("Nómina Quincenal");

            worksheet.ShowGridLines = true;
            worksheet.Style.Font.FontName = "Segoe UI";
            worksheet.Style.Font.FontSize = 10;

            // --- FILA 1: TÍTULO EJECUTIVO PRINCIPAL ---
            var titleRange = worksheet.Range("A1:N1");
            titleRange.Merge().Value = "SISTEMA DE NÓMINA - REPORTE DE PAGO QUINCENAL";
            titleRange.Style.Font.Bold = true;
            titleRange.Style.Font.FontSize = 14;
            titleRange.Style.Font.FontColor = XLColor.White;
            titleRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#064E3B");
            titleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            titleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            worksheet.Row(1).Height = 32;

            // --- FILA 2: SUBTÍTULO DEL PERÍODO Y CONCEPTO ---
            var subtitleRange = worksheet.Range("A2:N2");
            subtitleRange.Merge().Value = $"CONCEPTO: {(periodo.Concepto ?? "").ToUpper()}  |  QUINCENA: {periodo.Quincena}  |  MES: {periodo.Mes}  |  FECHA PROCESADO: {periodo.FechaProcesado:dd/MM/yyyy HH:mm}";
            subtitleRange.Style.Font.Italic = true;
            subtitleRange.Style.Font.FontSize = 9.5;
            subtitleRange.Style.Font.FontColor = XLColor.FromHtml("#374151");
            subtitleRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#F3F4F6");
            subtitleRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            subtitleRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            worksheet.Row(2).Height = 22;

            // --- FILA 4: ENCABEZADOS DE GRUPOS TEMÁTICOS ---
            worksheet.Row(4).Height = 26;

            var rangeInfo = worksheet.Range("A4:C4");
            rangeInfo.Merge().Value = "DATOS DEL EMPLEADO";
            SetGroupHeaderStyle(rangeInfo, "#EEF2FF", "#1E1B4B");

            var rangeDevengado = worksheet.Range("D4:H4");
            rangeDevengado.Merge().Value = "DEVENGADO (INGRESOS)";
            SetGroupHeaderStyle(rangeDevengado, "#D1FAE5", "#065F46");

            var rangeRetenciones = worksheet.Range("I4:M4");
            rangeRetenciones.Merge().Value = "RETENCIONES (DEDUCCIONES)";
            SetGroupHeaderStyle(rangeRetenciones, "#FEE2E2", "#991B1B");

            var rangeNeto = worksheet.Range("N4");
            rangeNeto.Value = "PAGO FINAL";
            SetGroupHeaderStyle(rangeNeto, "#10B981", "#FFFFFF");

            // --- FILA 5: ENCABEZADOS DE COLUMNA ESPECÍFICOS ---
            worksheet.Row(5).Height = 25;
            string[] headers = new string[]
            {
                "CÓDIGO", "SUELDO BASE", "QUINCENA",
                "Incentivo", "Reembolso", "Horas Extras", "Préstamo", "Cuota Cumpleaños",
                "Seguro Vehículo", "Seguro Médico", "SFS (TSS)", "AFP (Pensiones)", "ISR (Renta)",
                "NETO A PAGAR"
            };

            for (int col = 0; col < headers.Length; col++)
            {
                var cell = worksheet.Cell(5, col + 1);
                cell.Value = headers[col];
                cell.Style.Font.Bold = true;
                cell.Style.Font.FontSize = 9.5;
                cell.Style.Font.FontColor = XLColor.White;
                cell.Style.Fill.BackgroundColor = col == 13 ? XLColor.FromHtml("#047857") : XLColor.FromHtml("#1E293B");
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
                cell.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                cell.Style.Border.OutsideBorderColor = XLColor.FromHtml("#475569");
            }

            // --- FILAS DE DATOS ---
            int startRow = 6;
            int currentRow = startRow;
            var detalles = periodo.Detalles ?? new List<NominaDetalle>();

            foreach (var det in detalles)
            {
                worksheet.Row(currentRow).Height = 20;

                string rowBgColor = (currentRow % 2 == 0) ? "#FFFFFF" : "#F9FAFB";
                var rowRange = worksheet.Range(currentRow, 1, currentRow, 14);
                rowRange.Style.Fill.BackgroundColor = XLColor.FromHtml(rowBgColor);

                var cellCodigo = worksheet.Cell(currentRow, 1);
                cellCodigo.SetValue(det.CodigoEmpleado);
                cellCodigo.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cellCodigo.Style.Font.Bold = true;

                SetCurrencyCell(worksheet.Cell(currentRow, 2), det.SueldoPeriodo);
                worksheet.Cell(currentRow, 3).SetValue(periodo.Quincena).Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;

                SetCurrencyCell(worksheet.Cell(currentRow, 4), det.Incentivo);
                SetCurrencyCell(worksheet.Cell(currentRow, 5), det.Reembolso);
                SetCurrencyCell(worksheet.Cell(currentRow, 6), det.HorasExtras);
                SetCurrencyCell(worksheet.Cell(currentRow, 7), det.Prestamo);
                SetCurrencyCell(worksheet.Cell(currentRow, 8), det.CuotaCumpleanos);

                SetCurrencyCell(worksheet.Cell(currentRow, 9), det.SeguroVehiculo);
                SetCurrencyCell(worksheet.Cell(currentRow, 10), det.SeguroMedico);
                SetCurrencyCell(worksheet.Cell(currentRow, 11), det.Sfs);
                SetCurrencyCell(worksheet.Cell(currentRow, 12), det.Afp);
                SetCurrencyCell(worksheet.Cell(currentRow, 13), det.Isr);

                var cellNeto = worksheet.Cell(currentRow, 14);
                SetCurrencyCell(cellNeto, det.NetoPagado);
                cellNeto.Style.Font.Bold = true;
                cellNeto.Style.Fill.BackgroundColor = XLColor.FromHtml("#ECFDF5");
                cellNeto.Style.Font.FontColor = XLColor.FromHtml("#065F46");

                rowRange.Style.Border.InsideBorder = XLBorderStyleValues.Thin;
                rowRange.Style.Border.InsideBorderColor = XLColor.FromHtml("#E5E7EB");
                rowRange.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
                rowRange.Style.Border.OutsideBorderColor = XLColor.FromHtml("#D1D5DB");

                currentRow++;
            }

            // --- FILA DE TOTALES GENERALES ---
            worksheet.Row(currentRow).Height = 24;
            var totalLabelRange = worksheet.Range(currentRow, 1, currentRow, 3);
            totalLabelRange.Merge().Value = "TOTALES GENERALES:";
            totalLabelRange.Style.Font.Bold = true;
            totalLabelRange.Style.Font.FontSize = 10;
            totalLabelRange.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
            totalLabelRange.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;

            decimal totalSueldo = detalles.Sum(d => d.SueldoPeriodo);
            decimal totalIncentivo = detalles.Sum(d => d.Incentivo);
            decimal totalReembolso = detalles.Sum(d => d.Reembolso);
            decimal totalHorasExtras = detalles.Sum(d => d.HorasExtras);
            decimal totalPrestamo = detalles.Sum(d => d.Prestamo);
            decimal totalCumple = detalles.Sum(d => d.CuotaCumpleanos);

            decimal totalVehiculo = detalles.Sum(d => d.SeguroVehiculo);
            decimal totalMedico = detalles.Sum(d => d.SeguroMedico);
            decimal totalSfs = detalles.Sum(d => d.Sfs);
            decimal totalAfp = detalles.Sum(d => d.Afp);
            decimal totalIsr = detalles.Sum(d => d.Isr);
            decimal totalNetoGeneral = detalles.Sum(d => d.NetoPagado);

            SetTotalCell(worksheet.Cell(currentRow, 2), totalSueldo);
            SetTotalCell(worksheet.Cell(currentRow, 4), totalIncentivo);
            SetTotalCell(worksheet.Cell(currentRow, 5), totalReembolso);
            SetTotalCell(worksheet.Cell(currentRow, 6), totalHorasExtras);
            SetTotalCell(worksheet.Cell(currentRow, 7), totalPrestamo);
            SetTotalCell(worksheet.Cell(currentRow, 8), totalCumple);

            SetTotalCell(worksheet.Cell(currentRow, 9), totalVehiculo);
            SetTotalCell(worksheet.Cell(currentRow, 10), totalMedico);
            SetTotalCell(worksheet.Cell(currentRow, 11), totalSfs);
            SetTotalCell(worksheet.Cell(currentRow, 12), totalAfp);
            SetTotalCell(worksheet.Cell(currentRow, 13), totalIsr);

            var cellTotalNeto = worksheet.Cell(currentRow, 14);
            SetTotalCell(cellTotalNeto, totalNetoGeneral);
            cellTotalNeto.Style.Fill.BackgroundColor = XLColor.FromHtml("#10B981");
            cellTotalNeto.Style.Font.FontColor = XLColor.White;

            var totalRowRange = worksheet.Range(currentRow, 1, currentRow, 14);
            totalRowRange.Style.Font.Bold = true;
            totalRowRange.Style.Border.TopBorder = XLBorderStyleValues.Thin;
            totalRowRange.Style.Border.TopBorderColor = XLColor.FromHtml("#9CA3AF");
            totalRowRange.Style.Border.BottomBorder = XLBorderStyleValues.Double;
            totalRowRange.Style.Border.BottomBorderColor = XLColor.FromHtml("#111827");

            worksheet.Columns().AdjustToContents();
            foreach (var column in worksheet.Columns())
            {
                column.Width = Math.Max(column.Width + 4.5, 14);
            }

            using var stream = new MemoryStream();
            workbook.SaveAs(stream);
            return stream.ToArray();
        }

        private static void SetGroupHeaderStyle(IXLRange range, string bgColor, string textColor)
        {
            range.Style.Font.Bold = true;
            range.Style.Font.FontSize = 10;
            range.Style.Font.FontColor = XLColor.FromHtml(textColor);
            range.Style.Fill.BackgroundColor = XLColor.FromHtml(bgColor);
            range.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            range.Style.Alignment.Vertical = XLAlignmentVerticalValues.Center;
            range.Style.Border.OutsideBorder = XLBorderStyleValues.Thin;
            range.Style.Border.OutsideBorderColor = XLColor.FromHtml("#D1D5DB");
        }

        private static void SetCurrencyCell(IXLCell cell, decimal value)
        {
            if (value == 0)
            {
                cell.SetValue("-");
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
                cell.Style.Font.FontColor = XLColor.FromHtml("#9CA3AF");
            }
            else
            {
                cell.SetValue(value);
                cell.Style.NumberFormat.Format = "$#,##0.00";
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
            }
        }

        private static void SetTotalCell(IXLCell cell, decimal value)
        {
            if (value == 0)
            {
                cell.SetValue("-");
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Center;
            }
            else
            {
                cell.SetValue(value);
                cell.Style.NumberFormat.Format = "$#,##0.00";
                cell.Style.Alignment.Horizontal = XLAlignmentHorizontalValues.Right;
            }
        }
    }
}
