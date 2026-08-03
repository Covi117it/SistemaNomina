import React from 'react';
import { Empleado } from '../../types/empleado';
import { FileSpreadsheet, Edit2, Trash2 } from 'lucide-react';
import { StatusSelect } from '../common/StatusSelect';
interface EmployeeTableProps {
  employees: Empleado[];
  updatingCodigo: string | null;
  onDoubleClickRow: (emp: Empleado) => void;
  onEstatusChange: (emp: Empleado, nuevoEstatus: string) => void;
  onEditClick: (emp: Empleado) => void;
  onDeleteClick: (codigo: string) => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  updatingCodigo,
  onDoubleClickRow,
  onEstatusChange,
  onEditClick,
  onDeleteClick,
}) => {

  // Formateador de fecha limpia DD/MM/YYYY
  const formatDisplayDate = (isoDate?: string | null) => {
    if (!isoDate || !isoDate.trim()) return '-';
    const clean = isoDate.split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return isoDate;
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
      {/* Encabezado de la Tabla */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
          Directorio Oficial de Empleados ({employees.length})
        </h3>
      </div>

      {/* Contenido de la Tabla */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-slate-700">
          <thead className="bg-slate-50 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
            <tr>
              <th className="py-3.5 px-4">Código</th>
              <th className="py-3.5 px-4">Nombres</th>
              <th className="py-3.5 px-3 text-center">Tipo Doc</th>
              <th className="py-3.5 px-4">Cédula</th>
              <th className="py-3.5 px-4">Estatus</th>
              <th className="py-3.5 px-4">Puesto</th>
              <th className="py-3.5 px-4">F. Ingreso</th>
              <th className="py-3.5 px-4">F. Nacimiento</th>
              <th className="py-3.5 px-4">Email</th>
              <th className="py-3.5 px-4 text-center">Acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center py-14 text-slate-400 font-medium">
                  No hay empleados registrados en la base de datos.
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const isUpdatingThis = updatingCodigo === emp.codigo;

                return (
                  <tr
                    key={emp.codigo}
                    onDoubleClick={() => onDoubleClickRow(emp)}
                    title="Haz doble clic para editar los datos de este empleado"
                    className="hover:bg-emerald-50/50 transition-colors cursor-pointer select-none group"
                  >
                    {/* Código */}
                    <td className="py-3.5 px-4 font-mono text-emerald-600 font-bold text-xs">
                      {emp.codigo}
                    </td>

                    {/* Nombres */}
                    <td className="py-3.5 px-4 text-slate-900 font-bold text-sm">
                      {emp.nombres}
                    </td>

                    {/* Tipo Documento */}
                    <td className="py-3.5 px-3 text-center font-mono text-slate-500 text-xs">
                      {emp.tipoDocumento || '1'}
                    </td>

                    {/* Cédula */}
                    <td className="py-3.5 px-4 font-mono text-slate-600 text-xs font-semibold">
                      {emp.cedula || '-'}
                    </td>

                    {/* Estatus */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
  <StatusSelect
    value={emp.eStatus || 'ACTIVO'}
    onChange={(nuevoEstatus) => onEstatusChange(emp, nuevoEstatus)}
    disabled={isUpdatingThis}
  />
</td>
                    </td>

                    {/* Puesto */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {emp.puesto || '-'}
                    </td>

                    {/* Fecha de Ingreso */}
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-xs">
                      {formatDisplayDate(emp.fechaIngreso)}
                    </td>

                    {/* Fecha de Nacimiento (AGREGADA) */}
                    <td className="py-3.5 px-4 font-mono text-slate-500 text-xs">
                      {formatDisplayDate(emp.fechaNacimiento)}
                    </td>

                    {/* Email */}
                    <td className="py-3.5 px-4 text-slate-600 text-xs">
                      {emp.email || '-'}
                    </td>

                    {/* Acciones */}
                    <td className="py-3.5 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEditClick(emp)}
                          title="Editar empleado"
                          className="p-1.5 hover:bg-emerald-100 text-slate-400 hover:text-emerald-700 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteClick(emp.codigo)}
                          title="Eliminar este empleado"
                          className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};