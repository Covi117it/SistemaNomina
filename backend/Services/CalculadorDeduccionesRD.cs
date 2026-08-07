using System;

namespace backend.Services
{
    public static class CalculadorDeduccionesRD
    {
        // Porcentajes de retención del empleado (TSS RD)
        public const decimal PorcentajeSFS = 0.0304m; // 3.04%
        public const decimal PorcentajeAFP = 0.0287m; // 2.87%

        // Tramos Anuales ISR DGII (Escala de Personas Físicas RD)
        public const decimal Tramo1Exento = 416220.00m;
        public const decimal Tramo2Limite = 624329.00m;
        public const decimal Tramo3Limite = 867123.00m;

        public const decimal ExcedenteTramo2Fijo = 31216.00m;
        public const decimal ExcedenteTramo3Fijo = 79776.00m;

        public static (decimal sfs, decimal afp, decimal isr) Calcular(decimal sueldoBase, decimal totalDevengado)
        {
            if (sueldoBase <= 0 && totalDevengado <= 0) 
                return (0m, 0m, 0m);

            decimal montoBaseTss = sueldoBase > 0 ? sueldoBase : totalDevengado;

            // 1. Seguro Familiar de Salud (SFS: 3.04%)
            decimal sfs = CalcularSFS(montoBaseTss);

            // 2. Fondo de Pensiones (AFP: 2.87%)
            decimal afp = CalcularAFP(montoBaseTss);

            // 3. Base Imponible para ISR = Total Devengado menos retenciones TSS (SFS + AFP)
            decimal devengadoEfectivo = totalDevengado > 0 ? totalDevengado : sueldoBase;
            decimal sueldoNetoImponibleQuincenal = Math.Max(0m, devengadoEfectivo - (sfs + afp));

            // 4. Impuesto Sobre la Renta (ISR) Quincenal
            decimal isrQuincenal = CalcularISRQuincenal(sueldoNetoImponibleQuincenal);

            return (sfs, afp, isrQuincenal);
        }

        public static decimal CalcularSFS(decimal monto)
        {
            if (monto <= 0) return 0m;
            return Math.Round(monto * PorcentajeSFS, 2);
        }

        public static decimal CalcularAFP(decimal monto)
        {
            if (monto <= 0) return 0m;
            return Math.Round(monto * PorcentajeAFP, 2);
        }
        public static decimal CalcularISRQuincenal(decimal sueldoNetoImponibleQuincenal)
        {
            if (sueldoNetoImponibleQuincenal <= 0) return 0m;

            // Proyección anualizada en base a 24 quincenas
            decimal ingresoAnualImponible = sueldoNetoImponibleQuincenal * 24m;
            decimal isrAnual = 0m;

            if (ingresoAnualImponible > Tramo3Limite)
            {
                isrAnual = ExcedenteTramo3Fijo + ((ingresoAnualImponible - Tramo3Limite) * 0.25m);
            }
            else if (ingresoAnualImponible > Tramo2Limite)
            {
                isrAnual = ExcedenteTramo2Fijo + ((ingresoAnualImponible - Tramo2Limite) * 0.20m);
            }
            else if (ingresoAnualImponible > Tramo1Exento)
            {
                isrAnual = (ingresoAnualImponible - Tramo1Exento) * 0.15m;
            }

            return Math.Round(Math.Max(0m, isrAnual / 24m), 2);
        }
    }
}