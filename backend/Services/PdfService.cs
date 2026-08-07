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
            var detalle = new NominaDetalle
            {
                CodigoEmpleado = item.CodigoEmpleado,
                NombreEmpleadoSnapshot = item.NombreEmpleado ?? "EMPLEADO",
                SueldoPeriodo = item.SueldoBase,
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
                TotalDevengado = item.TotalDevengado,
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