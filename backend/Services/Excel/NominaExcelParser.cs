using System.Collections.Generic;
using System.IO;
using System.Text;
using ExcelDataReader;
using backend.DTOs;

namespace backend.Services.Excel
{
    public static class NominaExcelParser
    {
        public static List<NominaItemDto> Parse(Stream stream)
        {
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
            var listaNomina = new List<NominaItemDto>();

            using (var reader = ExcelReaderFactory.CreateReader(stream))
            {
                var colMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
                bool mapaCreado = false;

                // Escanear encabezados compuestos (Fila 1 y Fila 2)
                while (reader.Read())
                {
                    if (!mapaCreado)
                    {
                        for (int i = 0; i < reader.FieldCount; i++)
                        {
                            var header = reader.GetValue(i)?.ToString()?.Trim();
                            if (!string.IsNullOrEmpty(header))
                            {
                                string key = ExcelHelper.NormalizarNombreColumna(header);
                                if (!colMap.ContainsKey(key))
                                {
                                    colMap[key] = i;
                                }
                            }
                        }

                        // Continuar escaneando hasta detectar subcolumnas o encabezados estándar
                        if (colMap.ContainsKey("PERIODO") || colMap.ContainsKey("SUELDO") || colMap.ContainsKey("SUELDO BASE") ||
                            colMap.ContainsKey("SALARIO") || colMap.ContainsKey("SALARIO BASE") || colMap.ContainsKey("DEVENGADO") ||
                            colMap.ContainsKey("TOTAL DEVENGADO") || colMap.ContainsKey("SFS") || colMap.ContainsKey("AFP") ||
                            colMap.ContainsKey("ISR") || colMap.ContainsKey("INCENTIVO") || colMap.ContainsKey("CODIGO") ||
                            colMap.ContainsKey("CODIGO EMPLEADO") || colMap.ContainsKey("NETO") || colMap.ContainsKey("NETO A PAGAR"))
                        {
                            mapaCreado = true;
                        }
                        continue;
                    }

                    string? codigo = ExcelHelper.ObtenerValorString(reader, colMap, "CODIGO EMPLEADO", "CODIGO", "CODIGO_EMPLEADO");
                    if (string.IsNullOrWhiteSpace(codigo)) continue;

                    decimal sueldoBaseParsed = ExcelHelper.ObtenerValorDecimal(reader, colMap,
                        "SUELDO BASE", "SUELDO_BASE", "SALARIO BASE", "SALARIO_BASE",
                        "SUELDO QUINCENAL", "SALARIO QUINCENAL", "SUELDO BRUTO", "SALARIO BRUTO",
                        "SUELDO PERIODO", "SALARIO PERIODO", "MONTO PERIODO", "PERIODO",
                        "SUELDO", "SALARIO", "DEVENGADO BASE", "MONTO BASE", "BASE");

                    decimal totalDevengadoParsed = ExcelHelper.ObtenerValorDecimal(reader, colMap,
                        "TOTAL DEVENGADO", "TOTAL_DEVENGADO", "DEVENGADO", "DEVENGADOS",
                        "TOTAL DEVENGADOS", "MONTO DEVENGADO", "DEVENGADO TOTAL");

                    decimal incentivo = ExcelHelper.ObtenerValorDecimal(reader, colMap, "INCENTIVO");
                    decimal reembolso = ExcelHelper.ObtenerValorDecimal(reader, colMap, "REEMBOLSO");
                    decimal horasExtras = ExcelHelper.ObtenerValorDecimal(reader, colMap, "HORAS EXTRAS", "HORASEXTRAS", "HORAS_EXTRAS");

                    // Fallback bidireccional entre Sueldo Base y Total Devengado
                    if (sueldoBaseParsed <= 0 && totalDevengadoParsed > 0)
                    {
                        sueldoBaseParsed = Math.Max(0m, totalDevengadoParsed - (incentivo + reembolso + horasExtras));
                    }
                    else if (totalDevengadoParsed <= 0 && sueldoBaseParsed > 0)
                    {
                        totalDevengadoParsed = sueldoBaseParsed + incentivo + reembolso + horasExtras;
                    }

                    var item = new NominaItemDto
                    {
                        CodigoEmpleado = codigo.Trim(),
                        SueldoBase = sueldoBaseParsed,
                        TotalDevengado = totalDevengadoParsed,
                        Quincena = ExcelHelper.ObtenerValorString(reader, colMap, "QUINCENA", "QUINCENA A") ?? "1Q",

                        // Devengados
                        Incentivo = incentivo,
                        Reembolso = reembolso,
                        HorasExtras = horasExtras,
                        Prestamo = ExcelHelper.ObtenerValorDecimal(reader, colMap, "PRESTAMO", "ADELANTO"),
                        CuotaCumpleanos = ExcelHelper.ObtenerValorDecimal(reader, colMap, "CUOTA CUMPLEAÑOS", "CUOTA CUMPLEANOS", "CUMPLEAÑOS", "CUMPLEANOS"),

                        // Deducciones
                        SeguroVehiculo = ExcelHelper.ObtenerValorDecimal(reader, colMap, "SEGURO VEHICULO", "SEGURO_VEHICULO"),
                        SeguroMedico = ExcelHelper.ObtenerValorDecimal(reader, colMap, "SEGURO MEDICO", "SEGURO_MEDICO"),
                        Sfs = ExcelHelper.ObtenerValorDecimal(reader, colMap, "SFS"),
                        Afp = ExcelHelper.ObtenerValorDecimal(reader, colMap, "AFP"),
                        Isr = ExcelHelper.ObtenerValorDecimal(reader, colMap, "ISR"),

                        NetoAPagar = ExcelHelper.ObtenerValorDecimal(reader, colMap, "NETO A PAGAR", "NETO_A_PAGAR", "NETO")
                    };

                    listaNomina.Add(item);
                }
            }
            return listaNomina;
        }
    }
}