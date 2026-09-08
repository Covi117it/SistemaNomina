using System.Text;
using ExcelDataReader;
using backend.Models;

namespace backend.Services.Excel
{
    public static class EmpleadoExcelParser
    {
        public static List<Empleado> Parse(Stream stream)
        {
            Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
            var empleados = new List<Empleado>();

            using (var reader = ExcelReaderFactory.CreateReader(stream))
            {
                if (!reader.Read()) return empleados;

                var colMap = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

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

                while (reader.Read())
                {
                    string? codigo = ExcelHelper.ObtenerValorString(reader, colMap, "CODIGO");
                    string? nombres = ExcelHelper.ObtenerValorString(reader, colMap, "NOMBRES");

                    if (string.IsNullOrWhiteSpace(codigo) && string.IsNullOrWhiteSpace(nombres))
                    {
                        continue;
                    }

                    var empleado = new Empleado
                    {
                        Codigo = codigo ?? string.Empty,
                        Nombres = nombres ?? string.Empty,
                        TipoDocumento = ExcelHelper.ObtenerValorString(reader, colMap, "TIPO_DOCUMENTO", "TIPO DOCUMENTO", "DOCUMENTO"),
                        Cedula = ExcelHelper.ObtenerValorString(reader, colMap, "CEDULA", "IDENTIFICACION"),
                        EStatus = ExcelHelper.ObtenerValorString(reader, colMap, "ESTATUS", "ESTADO") ?? "ACTIVO",
                        Puesto = ExcelHelper.ObtenerValorString(reader, colMap, "PUESTO", "CARGO"),
                        FechaIngreso = ExcelHelper.ObtenerValorFecha(reader, colMap, "FECHA_INGRESO", "FECHA INGRESO", "INGRESO"),
                        FechaNacimiento = ExcelHelper.ObtenerValorFecha(reader, colMap, "FECHA_NACIMIENTO", "FECHA NACIMIENTO", "FECHA_NACIMENTO", "FECHA NACIMENTO", "NACIMIENTO"),
                        Email = ExcelHelper.ObtenerValorString(reader, colMap, "EMAIL", "CORREO", "CORREO ELECTRONICO"),
                        FechaCreacion = DateTime.UtcNow,
                        FechaActualizacion = DateTime.UtcNow
                    };

                    empleados.Add(empleado);
                }
            }

            return empleados;
        }
    }
}