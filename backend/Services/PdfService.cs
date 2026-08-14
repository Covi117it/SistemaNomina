using System;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using backend.DTOs;
using backend.Models;
using backend.Services.Pdf;

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
            decimal sueldoBase = item.SueldoBase;
            decimal totalDevengado = item.TotalDevengado;

            if (sueldoBase <= 0 && totalDevengado > 0)
            {
                sueldoBase = Math.Max(0m, totalDevengado - (item.Incentivo + item.Reembolso + item.HorasExtras));
            }
            else if (totalDevengado <= 0 && sueldoBase > 0)
            {
                totalDevengado = sueldoBase + item.Incentivo + item.Reembolso + item.HorasExtras;
            }

            var detalle = new NominaDetalle
            {
                CodigoEmpleado = item.CodigoEmpleado,
                NombreEmpleadoSnapshot = item.NombreEmpleado ?? "EMPLEADO",
                SueldoPeriodo = sueldoBase,
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
                TotalDevengado = totalDevengado,
                TotalDeducciones = item.TotalDeducciones,
                NetoPagado = item.NetoAPagar
            };

            return GenerarVolantePdf(detalle, conceptoPeriodo);
        }

        [Obsolete]
        public byte[] GenerarVolantePdf(NominaDetalle detalle, string conceptoPeriodo)
        {
            var document = new VolantePagoDocument(detalle, conceptoPeriodo);
            return document.GeneratePdf();
        }
    }
}