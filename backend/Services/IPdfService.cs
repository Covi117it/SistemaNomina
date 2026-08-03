using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using backend.DTOs;
using backend.Models;

namespace backend.Services
{
    public interface IPdfService
    {
        byte[] GenerarVolantePdf(NominaItemDto item, string conceptoPeriodo);
        byte[] GenerarVolantePdf(NominaDetalle detalle, string conceptoPeriodo);
    }
}