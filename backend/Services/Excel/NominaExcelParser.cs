using System;
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
                int filasEscaneadas = 0;

                while (reader.Read())
                {
                    filasEscaneadas++;

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

                        // Se considera detectado el mapa si contiene al menos identificadores clave
                        if (colMap.ContainsKey("PERIODO") || colMap.ContainsKey("SUELDO") || colMap.ContainsKey("SUELDO BASE") ||
                            colMap.ContainsKey("SALARIO") || colMap.ContainsKey("SALARIO BASE") || colMap.ContainsKey("DEVENGADO") ||
                            colMap.ContainsKey("TOTAL DEVENGADO") || colMap.ContainsKey("SFS") || colMap.ContainsKey("ARS") ||
                            colMap.ContainsKey("AFP") || colMap.ContainsKey("PENSION") || colMap.ContainsKey("ISR") ||
                            colMap.ContainsKey("TOTAL DEDUCCIONES") || colMap.ContainsKey("DEDUCCIONES") || colMap.ContainsKey("DESCUENTOS") ||
                            colMap.ContainsKey("INCENTIVO") || colMap.ContainsKey("CODIGO") || colMap.ContainsKey("CODIGO EMPLEADO") ||
                            colMap.ContainsKey("NETO") || colMap.ContainsKey("NETO A PAGAR"))
                        {
                            mapaCreado = true;
                        }

                        if (!mapaCreado && filasEscaneadas >= 10)
                        {
                            // Si tras 10 filas no detectó cabeceras compuestas, activa el mapa con lo que tenga
                            mapaCreado = true;
                        }
                        continue;
                    }

                    string? codigo = ExcelHelper.ObtenerValorString(reader, colMap, 
                        "CODIGO EMPLEADO", "CODIGO", "CODIGO_EMPLEADO", "COD", "COD.", "COD EMPLEADO", "NO. EMPLEADO", "NUMERO EMPLEADO", "ID EMPLEADO", "ID");
                    
                    if (string.IsNullOrWhiteSpace(codigo)) continue;

                    // Omitir filas de totales al pie de la tabla
                    string codigoNorm = codigo.Trim().ToUpperInvariant();
                    if (codigoNorm.StartsWith("TOTAL") || codigoNorm.StartsWith("SUMA") || codigoNorm.StartsWith("RESUMEN") || codigoNorm.StartsWith("SUBTOTAL"))
                    {
                        continue;
                    }

                    // 1. Devengados
                    decimal sueldoBaseParsed = ExcelHelper.ObtenerValorDecimal(reader, colMap,
                        "SUELDO BASE", "SUELDO_BASE", "SALARIO BASE", "SALARIO_BASE",
                        "SUELDO QUINCENAL", "SALARIO QUINCENAL", "SUELDO BRUTO", "SALARIO BRUTO",
                        "SUELDO PERIODO", "SALARIO PERIODO", "MONTO PERIODO", "PERIODO",
                        "SUELDO", "SALARIO", "DEVENGADO BASE", "MONTO BASE", "BASE");

                    decimal totalDevengadoParsed = ExcelHelper.ObtenerValorDecimal(reader, colMap,
                        "TOTAL DEVENGADO", "TOTAL_DEVENGADO", "DEVENGADO", "DEVENGADOS",
                        "TOTAL DEVENGADOS", "MONTO DEVENGADO", "DEVENGADO TOTAL", "TOTAL BRUTO", "BRUTO");

                    decimal incentivo = ExcelHelper.ObtenerValorDecimal(reader, colMap, "INCENTIVO", "INCENTIVOS", "BONO", "BONIFICACION");
                    decimal reembolso = ExcelHelper.ObtenerValorDecimal(reader, colMap, "REEMBOLSO", "REEMBOLSOS", "VIATICOS", "DIETAS");
                    decimal horasExtras = ExcelHelper.ObtenerValorDecimal(reader, colMap, "HORAS EXTRAS", "HORASEXTRAS", "HORAS_EXTRAS", "EXTRAS", "H. EXTRAS");

                    if (sueldoBaseParsed <= 0 && totalDevengadoParsed > 0)
                    {
                        sueldoBaseParsed = Math.Max(0m, totalDevengadoParsed - (incentivo + reembolso + horasExtras));
                    }
                    else if (totalDevengadoParsed <= 0 && sueldoBaseParsed > 0)
                    {
                        totalDevengadoParsed = sueldoBaseParsed + incentivo + reembolso + horasExtras;
                    }

                    // 2. Deducciones individuales
                    decimal sfs = ExcelHelper.ObtenerValorDecimal(reader, colMap, 
                        "SFS", "S.F.S.", "ARS", "A.R.S.", "SEGURO FAMILIAR DE SALUD", "SEGURO SALUD", "SALUD", "TSS SFS", "SFS EMPLEADO", "SEGURO DE SALUD");
                    
                    decimal afp = ExcelHelper.ObtenerValorDecimal(reader, colMap, 
                        "AFP", "A.F.P.", "PENSION", "PENSIONES", "FONDO DE PENSIONES", "FONDO DE PENSION", "TSS AFP", "AFP EMPLEADO");
                    
                    decimal isr = ExcelHelper.ObtenerValorDecimal(reader, colMap, 
                        "ISR", "I.S.R.", "IMPUESTO SOBRE LA RENTA", "RETENCION ISR", "RETENCION DE ISR", "IMPUESTO", "DGII", "RETENCION DGII", "IMPUESTO SOBRE RENTA");

                    decimal prestamo = ExcelHelper.ObtenerValorDecimal(reader, colMap, "PRESTAMO", "PRESTAMOS", "ADELANTO", "ADELANTOS", "ANTICIPO", "ANTICIPOS");
                    decimal cuotaCumpleanos = ExcelHelper.ObtenerValorDecimal(reader, colMap, "CUOTA CUMPLEAÑOS", "CUOTA CUMPLEANOS", "CUMPLEAÑOS", "CUMPLEANOS", "FONDO CUMPLEAÑOS", "FONDO CUMPLEANOS");
                    decimal seguroVehiculo = ExcelHelper.ObtenerValorDecimal(reader, colMap, "SEGURO VEHICULO", "SEGURO_VEHICULO", "SEGURO VEHICULAR", "VEHICULO");
                    decimal seguroMedico = ExcelHelper.ObtenerValorDecimal(reader, colMap, "SEGURO MEDICO", "SEGURO_MEDICO", "SEGURO COMPLEMENTARIO", "SEGURO MEDICO COMPLEMENTARIO", "PLAN COMPLEMENTARIO");

                    decimal totalDeduccionesParsed = ExcelHelper.ObtenerValorDecimal(reader, colMap,
                        "TOTAL DEDUCCIONES", "TOTAL DEDUCCION", "TOTAL_DEDUCCIONES", "DEDUCCIONES", "DEDUCCION",
                        "TOTAL DESCUENTOS", "TOTAL DESCUENTO", "DESCUENTOS", "DESCUENTO",
                        "TOTAL RETENCIONES", "RETENCIONES", "RETENCION", "TOTAL DEDUCCION GENERAL");

                    decimal sumaDeduccionesIndividuales = sfs + afp + isr + prestamo + cuotaCumpleanos + seguroVehiculo + seguroMedico;
                    decimal totalDeduccionesFinal = totalDeduccionesParsed > 0 ? totalDeduccionesParsed : sumaDeduccionesIndividuales;

                    // 3. Neto a Pagar
                    decimal netoParsed = ExcelHelper.ObtenerValorDecimal(reader, colMap, 
                        "NETO A PAGAR", "NETO_A_PAGAR", "NETO", "TOTAL NETO", "SUELDO NETO", "SALARIO NETO", "MONTO A PAGAR", "VALOR A PAGAR", "NETO PAGADO");

                    // Fallback para deducciones si solo tenemos devengado y neto
                    if (totalDeduccionesFinal <= 0 && totalDevengadoParsed > 0 && netoParsed > 0 && totalDevengadoParsed > netoParsed)
                    {
                        totalDeduccionesFinal = totalDevengadoParsed - netoParsed;
                    }

                    // Fallback para neto a pagar si no vino o vino en 0
                    if (netoParsed <= 0 && totalDevengadoParsed > 0)
                    {
                        netoParsed = Math.Max(0m, totalDevengadoParsed - totalDeduccionesFinal);
                    }

                    var item = new NominaItemDto
                    {
                        CodigoEmpleado = codigo.Trim(),
                        SueldoBase = sueldoBaseParsed,
                        TotalDevengado = totalDevengadoParsed,
                        Quincena = ExcelHelper.ObtenerValorString(reader, colMap, "QUINCENA", "QUINCENA A", "PERIODO QUINCENA") ?? "1Q",

                        // Devengados
                        Incentivo = incentivo,
                        Reembolso = reembolso,
                        HorasExtras = horasExtras,
                        Prestamo = prestamo,
                        CuotaCumpleanos = cuotaCumpleanos,

                        // Deducciones
                        SeguroVehiculo = seguroVehiculo,
                        SeguroMedico = seguroMedico,
                        Sfs = sfs,
                        Afp = afp,
                        Isr = isr,
                        TotalDeducciones = totalDeduccionesFinal,

                        NetoAPagar = netoParsed
                    };

                    listaNomina.Add(item);
                }
            }
            return listaNomina;
        }
    }
}