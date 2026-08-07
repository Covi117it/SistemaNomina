import React from 'react';
import { NominaItem } from '../../types/nomina';
import { AlertTriangle, ShieldCheck, FileText } from 'lucide-react';

interface StagingTableRowsProps {
  items: NominaItem[];
  onUpdateItem: (index: number, field: keyof NominaItem, value: any) => void;
  onSelectPdfItem: (item: NominaItem) => void;
}

export const StagingTableRows: React.FC<StagingTableRowsProps> = ({
  items,
  onUpdateItem,
  onSelectPdfItem,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs text-slate-700">
        <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider sticky top-0 border-b border-slate-200 z-10">
          <tr>
            <th className="py-3 px-3">Cruce BD</th>
            <th className="py-3 px-3">Código</th>
            <th className="py-3 px-3">Empleado (Desde BD)</th>
            <th className="py-3 px-3">Puesto</th>
            <th className="py-3 px-3">Correo Destinatario</th>
            <th className="py-3 px-3 text-right">Sueldo Base</th>
            <th className="py-3 px-3 text-right">Total Devengado</th>
            <th className="py-3 px-3 text-right">Total Deducciones</th>
            <th className="py-3 px-3 text-right">Neto a Pagar</th>
            <th className="py-3 px-3 text-center">Volante PDF</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
            {(items || []).map((item: NominaItem, idx: number) => {
            const esInexistente = !item.empleadoExiste || item.eStatusEmpleado === 'NO_EXISTE' || item.nombreEmpleado?.includes('NO REGISTRADO');
            return (
              <tr
                key={idx}
                className={`transition-colors ${
                  esInexistente ? 'bg-rose-50/40 hover:bg-rose-100/50' : 'hover:bg-slate-50/70'
                }`}
              >
                <td className="py-2.5 px-3">
                  {esInexistente ? (
                    <span className="px-2 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold rounded-full inline-flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-600" />
                      No Existe
                    </span>
                  ) : item.eStatusEmpleado === 'INACTIVO' ? (
                    <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-extrabold rounded-full inline-flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      Inactivo
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full inline-flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-600" />
                      Registrado
                    </span>
                  )}
                </td>

              <td className="py-2.5 px-3 font-mono font-bold text-emerald-600">
                {item.codigoEmpleado}
              </td>

              <td className="py-2.5 px-3 font-bold text-slate-900">
                {item.nombreEmpleado || '-'}
              </td>

              <td className="py-2.5 px-3 text-slate-500 font-medium">
                {item.puestoEmpleado || '-'}
              </td>

              <td className="py-1.5 px-2">
                <input
                  type="email"
                  placeholder="empleado@empresa.com"
                  value={item.emailDestinatario || ''}
                  onChange={(e) => onUpdateItem(idx, 'emailDestinatario' as any, e.target.value)}
                  className="w-48 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-800 text-xs font-medium focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                />
              </td>

              <td className="py-1.5 px-2 text-right">
                <input
                  type="number"
                  step="0.01"
                  value={item.sueldoBase}
                  onChange={(e) => onUpdateItem(idx, 'sueldoBase', parseFloat(e.target.value) || 0)}
                  className="w-28 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-800 font-mono text-xs font-semibold text-right focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                />
              </td>

              <td className="py-1.5 px-2 text-right">
                <input
                  type="number"
                  step="0.01"
                  value={item.totalDevengado}
                  onChange={(e) => onUpdateItem(idx, 'totalDevengado', parseFloat(e.target.value) || 0)}
                  className="w-28 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-900 font-mono text-xs font-bold text-right focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                />
              </td>

              <td className="py-1.5 px-2 text-right">
                <input
                  type="number"
                  step="0.01"
                  value={item.totalDeducciones}
                  onChange={(e) => onUpdateItem(idx, 'totalDeducciones', parseFloat(e.target.value) || 0)}
                  className="w-28 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-800 font-mono text-xs font-semibold text-right focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                />
              </td>

              <td className="py-1.5 px-2 text-right">
                <input
                  type="number"
                  step="0.01"
                  value={item.netoAPagar}
                  onChange={(e) => onUpdateItem(idx, 'netoAPagar', parseFloat(e.target.value) || 0)}
                  className="w-28 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl px-2.5 py-1 text-emerald-700 font-mono text-xs font-bold text-right focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
                />
              </td>

              <td className="py-2.5 px-3 text-center">
                <button
                  onClick={() => onSelectPdfItem(item)}
                  className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer mx-auto"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-600" />
                  Ver PDF
                </button>
              </td>
 </tr>
      );
        })}
      </tbody>
     </table>
   </div>
 );
 };