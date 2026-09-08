using System;
using backend.DTOs;

namespace backend.Common
{
    public static class NominaCalculoExtensions
    {
        public static void NormalizarCalculos(this NominaItemDto item)
        {
            if (item == null) return;

            decimal adicionales = item.Incentivo + item.Reembolso + item.HorasExtras;

            if (item.SueldoBase <= 0 && item.TotalDevengado > 0)
            {
                item.SueldoBase = Math.Max(0m, item.TotalDevengado - adicionales);
            }
            else if (item.TotalDevengado <= 0 && item.SueldoBase > 0)
            {
                item.TotalDevengado = item.SueldoBase + adicionales;
            }

            item.NetoAPagar = item.TotalDevengado - item.TotalDeducciones;
        }
    }
}
