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

                        // Continuar escaneando hasta detectar las subcolumnas de la Fila 2
                        if (colMap.ContainsKey("PERIODO") || colMap.ContainsKey("SFS") || colMap.ContainsKey("INCENTIVO"))
                        {
                            mapaCreado = true;
                        }
                        continue;
                    }

                    string? codigo = ExcelHelper.ObtenerValorString(reader, colMap, "CODIGO EMPLEADO", "CODIGO", "CODIGO_EMPLEADO");
                    if (string.IsNullOrWhiteSpace(codigo)) continue;

                    var item = new NominaItemDto
                    {
                        CodigoEmpleado = codigo.Trim(),
                        SueldoBase = ExcelHelper.ObtenerValorDecimal(reader, colMap, "PERIODO", "SUELDO", "SALARIO"),
                        Quincena = ExcelHelper.ObtenerValorString(reader, colMap, "QUINCENA", "QUINCENA A") ?? "1Q",

                        // Devengados
                        Incentivo = ExcelHelper.ObtenerValorDecimal(reader, colMap, "INCENTIVO"),
                        Reembolso = ExcelHelper.ObtenerValorDecimal(reader, colMap, "REEMBOLSO"),
                        HorasExtras = ExcelHelper.ObtenerValorDecimal(reader, colMap, "HORAS EXTRAS", "HORASEXTRAS", "HORAS_EXTRAS"),
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

                    if (item.NetoAPagar == 0 && (item.TotalDevengado > 0 || item.TotalDeducciones > 0))
                    {
                        item.NetoAPagar = item.TotalDevengado - item.TotalDeducciones;
                    }
                    listaNomina.Add(item);
                }
            }
            return listaNomina;
        }
    }
}