using System.IO;
using ClosedXML.Excel;
using Xunit;

namespace backend.Tests
{
    public class GenerarExcelPruebaTests
    {
        [Fact]
        public void GenerarExcelDePrueba()
        {
            string outputPath = Path.Combine("/home/daniele/Proyectos/SistemaNomina", "Nomina_Prueba_Agosto_2026.xlsx");

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Nómina Quincenal");

                // Encabezados
                worksheet.Cell(1, 1).Value = "CÓDIGO EMPLEADO";
                worksheet.Cell(1, 2).Value = "EMPLEADO";
                worksheet.Cell(1, 3).Value = "SUELDO BASE";
                worksheet.Cell(1, 4).Value = "INCENTIVO";
                worksheet.Cell(1, 5).Value = "HORAS EXTRAS";
                worksheet.Cell(1, 6).Value = "TOTAL DEVENGADO";
                worksheet.Cell(1, 7).Value = "SFS";
                worksheet.Cell(1, 8).Value = "AFP";
                worksheet.Cell(1, 9).Value = "ISR";
                worksheet.Cell(1, 10).Value = "NETO A PAGAR";

                // Estilo del encabezado
                var headerRange = worksheet.Range(1, 1, 1, 10);
                headerRange.Style.Font.Bold = true;
                headerRange.Style.Fill.BackgroundColor = XLColor.FromHtml("#10B981");
                headerRange.Style.Font.FontColor = XLColor.White;

                // Datos de prueba con los empleados del sistema
                var datos = new[]
                {
                    new { Codigo = "001", Nombre = "Jorge Martínez", Sueldo = 45000m, Incentivo = 2500m, Extras = 0m, SFS = 1368m, AFP = 1291.5m, ISR = 850m },
                    new { Codigo = "002", Nombre = "Yinet Jerez Noboa", Sueldo = 40000m, Incentivo = 1500m, Extras = 500m, SFS = 1216m, AFP = 1148m, ISR = 520m },
                    new { Codigo = "003", Nombre = "José Manuel De León", Sueldo = 35000m, Incentivo = 0m, Extras = 1200m, SFS = 1064m, AFP = 1004.5m, ISR = 300m },
                    new { Codigo = "004", Nombre = "Miguel Angel Carrión", Sueldo = 30000m, Incentivo = 1000m, Extras = 0m, SFS = 912m, AFP = 861m, ISR = 0m },
                    new { Codigo = "005", Nombre = "Delvin Martínez", Sueldo = 28000m, Incentivo = 0m, Extras = 0m, SFS = 851.2m, AFP = 803.6m, ISR = 0m },
                    new { Codigo = "006", Nombre = "Rosa Elba Martínez", Sueldo = 25000m, Incentivo = 800m, Extras = 0m, SFS = 760m, AFP = 717.5m, ISR = 0m },
                    new { Codigo = "007", Nombre = "Talia Villaman Guzman", Sueldo = 22000m, Incentivo = 0m, Extras = 400m, SFS = 668.8m, AFP = 631.4m, ISR = 0m },
                    new { Codigo = "008", Nombre = "Isaias Emil Gomez", Sueldo = 20000m, Incentivo = 500m, Extras = 0m, SFS = 608m, AFP = 574m, ISR = 0m },
                    new { Codigo = "009", Nombre = "Enmanuel Leandro Gomez", Sueldo = 20000m, Incentivo = 0m, Extras = 0m, SFS = 608m, AFP = 574m, ISR = 0m },
                    new { Codigo = "010", Nombre = "Maria Rondon (Alexandra)", Sueldo = 18000m, Incentivo = 0m, Extras = 0m, SFS = 547.2m, AFP = 516.6m, ISR = 0m },
                    new { Codigo = "011", Nombre = "José Manuel Peña Ventura", Sueldo = 20000m, Incentivo = 0m, Extras = 0m, SFS = 608m, AFP = 574m, ISR = 0m },
                    new { Codigo = "012", Nombre = "Daniel Emil Mejia Valerio", Sueldo = 20000m, Incentivo = 1000m, Extras = 0m, SFS = 608m, AFP = 574m, ISR = 0m },
                    new { Codigo = "013", Nombre = "Denzel Martínez", Sueldo = 20000m, Incentivo = 0m, Extras = 0m, SFS = 608m, AFP = 574m, ISR = 0m },
                    new { Codigo = "014", Nombre = "Heral Reyes Sanchez", Sueldo = 20000m, Incentivo = 0m, Extras = 0m, SFS = 608m, AFP = 574m, ISR = 0m }
                };

                int row = 2;
                foreach (var emp in datos)
                {
                    decimal totalDevengado = emp.Sueldo + emp.Incentivo + emp.Extras;
                    decimal totalDeducciones = emp.SFS + emp.AFP + emp.ISR;
                    decimal netoAPagar = totalDevengado - totalDeducciones;

                    worksheet.Cell(row, 1).Value = emp.Codigo;
                    worksheet.Cell(row, 2).Value = emp.Nombre;
                    worksheet.Cell(row, 3).Value = emp.Sueldo;
                    worksheet.Cell(row, 4).Value = emp.Incentivo;
                    worksheet.Cell(row, 5).Value = emp.Extras;
                    worksheet.Cell(row, 6).Value = totalDevengado;
                    worksheet.Cell(row, 7).Value = emp.SFS;
                    worksheet.Cell(row, 8).Value = emp.AFP;
                    worksheet.Cell(row, 9).Value = emp.ISR;
                    worksheet.Cell(row, 10).Value = netoAPagar;

                    // Formato de moneda RD$
                    for (int col = 3; col <= 10; col++)
                    {
                        worksheet.Cell(row, col).Style.NumberFormat.Format = "\"RD$\" #,##0.00";
                    }

                    row++;
                }

                worksheet.Columns().AdjustToContents();
                workbook.SaveAs(outputPath);
            }
        }

        [Fact]
        public void ProbarParseoExcelDePrueba()
        {
            string path = Path.Combine("/home/daniele/Proyectos/SistemaNomina", "Nomina_Prueba_Agosto_2026.xlsx");
            using var stream = File.OpenRead(path);
            var result = backend.Services.Excel.NominaExcelParser.Parse(stream);
            Assert.NotEmpty(result);
            Assert.Equal(14, result.Count);
        }
    }
}
