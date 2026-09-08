using System.Collections.Generic;
using backend.Models;

namespace backend.Services
{
    public interface IExcelExportService
    {
        byte[] GenerarExcelEmpleados(List<Empleado> empleados);
        byte[] GenerarExcelNomina(NominaPeriodo periodo);
    }
}
