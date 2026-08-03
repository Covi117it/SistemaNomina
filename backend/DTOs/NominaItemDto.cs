using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.DTOs
{
    public class NominaItemDto
    {
        public string CodigoEmpleado { get; set; } = string.Empty;
        public decimal SueldoBase { get; set; }
        public string Quincena { get; set; } = "1Q";
        public decimal Incentivo { get; set; }
        public decimal Reembolso { get; set; }
        public decimal HorasExtras { get; set; }
        public decimal Prestamo { get; set; }
        public decimal CuotaCumpleanos { get; set; }

        // Deducciones
        public decimal SeguroVehiculo { get; set; }
        public decimal SeguroMedico { get; set; }
        public decimal Sfs { get; set; }
        public decimal Afp { get; set; }
        public decimal Isr { get; set; }

        // Totales Calculados
       public decimal TotalDevengado => SueldoBase + Incentivo + Reembolso + HorasExtras;
        public decimal TotalDeducciones => Prestamo + CuotaCumpleanos + SeguroVehiculo + SeguroMedico + Sfs + Afp + Isr;
        public decimal NetoAPagar { get; set; }

        // Cruce con la Base de Datos SQLite
        public string? NombreEmpleado { get; set; }
        public string? PuestoEmpleado { get; set; }
        public string? EStatusEmpleado { get; set; }
        public string? EmailDestinatario { get; set; } // <-- PROPIEDAD AGREGADA PARA VER/EDITAR EMAIL
        public bool EmpleadoExiste { get; set; } = false;
    }
}