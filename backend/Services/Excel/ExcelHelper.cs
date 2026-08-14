using System;
using System.Collections.Generic;
using System.Globalization;
using ExcelDataReader;

namespace backend.Services.Excel
{
    public static class ExcelHelper
    {
        // Normaliza nombres de columnas (quita tildes, guiones, espacios extra y convierte a mayúsculas)
        public static string NormalizarNombreColumna(string header)
        {
            if (string.IsNullOrWhiteSpace(header)) return string.Empty;
            string normalized = header.Normalize(System.Text.NormalizationForm.FormD);
            var sb = new System.Text.StringBuilder();
            foreach (char c in normalized)
            {
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                {
                    sb.Append(c);
                }
            }
            return sb.ToString().Replace("_", " ").Replace("-", " ").Trim().ToUpperInvariant();
        }

        // Obtiene un valor string seguro buscando por posibles nombres de columna
        public static string? ObtenerValorString(IExcelDataReader reader, Dictionary<string, int> colMap, params string[] nombresPosibles)
        {
            foreach (var nombre in nombresPosibles)
            {
                string key = NormalizarNombreColumna(nombre);
                if (colMap.TryGetValue(key, out int colIndex) && colIndex < reader.FieldCount)
                {
                    var val = reader.GetValue(colIndex);
                    if (val != null)
                    {
                        string strVal = val.ToString()?.Trim() ?? string.Empty;
                        return string.IsNullOrWhiteSpace(strVal) ? null : strVal;
                    }
                }
            }
            return null;
        }

        // Obtiene un valor fecha seguro (soporta DateTime de Excel, OADate numérico y strings de fecha)
        public static DateTime? ObtenerValorFecha(IExcelDataReader reader, Dictionary<string, int> colMap, params string[] nombresPosibles)
        {
            foreach (var nombre in nombresPosibles)
            {
                string key = NormalizarNombreColumna(nombre);
                if (colMap.TryGetValue(key, out int colIndex) && colIndex < reader.FieldCount)
                {
                    var val = reader.GetValue(colIndex);
                    if (val == null) continue;

                    if (val is DateTime dt) return dt;

                    if (val is double dVal)
                    {
                        try
                        {
                            return DateTime.FromOADate(dVal);
                        }
                        catch
                        {
                        }
                    }

                    string strVal = val.ToString()?.Trim() ?? string.Empty;
                    if (DateTime.TryParse(strVal, out DateTime parsedDate))
                    {
                        return parsedDate;
                    }
                }
            }
            return null;
        }

        // Obtiene un valor decimal seguro limpiando guiones '-', símbolos de moneda y formatos numéricos
        public static decimal ObtenerValorDecimal(IExcelDataReader reader, Dictionary<string, int> colMap, params string[] nombresPosibles)
        {
            foreach (var nombre in nombresPosibles)
            {
                string key = NormalizarNombreColumna(nombre);
                if (colMap.TryGetValue(key, out int colIndex) && colIndex < reader.FieldCount)
                {
                    var val = reader.GetValue(colIndex);
                    if (val == null) continue;

                    if (val is double dVal) return Convert.ToDecimal(dVal);
                    if (val is decimal decVal) return decVal;
                    if (val is int intVal) return Convert.ToDecimal(intVal);

                    string strVal = val.ToString()?.Trim() ?? string.Empty;
                    if (strVal == "-" || strVal == "" || strVal == "0") return 0m;

                    strVal = strVal.Replace("RD$", "").Replace("$", "").Replace(" ", "").Trim();

                    if (decimal.TryParse(strVal, NumberStyles.Any, CultureInfo.InvariantCulture, out decimal parsed))
                    {
                        return parsed;
                    }

                    if (decimal.TryParse(strVal, out decimal parsedLocal))
                    {
                        return parsedLocal;
                    }
                }
            }
            return 0m;
        }
    }
}