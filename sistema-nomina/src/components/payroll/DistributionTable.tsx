import React from 'react';
import { NominaItem } from '../../types/nomina';
import { formatCurrency } from '../../utils/formatters';
import { Mail, Clock, FileText } from 'lucide-react';

interface DistributionTableProps {
  items?: NominaItem[];
  onUpdateEmail: (index: number, newEmail: string) => void;
  onSelectPdfItem: (item: NominaItem) => void;
}

export const DistributionTable: React.FC<DistributionTableProps> = ({
  items = [],
  onUpdateEmail,
  onSelectPdfItem,
}) => {
  const safeItems = items || [];

  if (safeItems.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-10 text-center space-y-3">
        <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <Mail className="w-7 h-7" />
        </div>
        <h4 className="text-sm font-extrabold text-slate-800">No hay comprobantes seleccionados</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Cargue un archivo Excel de nómina en la pantalla de procesamiento para generar la lista de comprobantes a enviar por correo.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
          <Mail className="w-4 h-4 text-emerald-600" />
          Lista de Destinatarios y Comprobantes PDF ({safeItems.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-slate-700">
          <thead className="bg-slate-50 text-slate-400 uppercase text-[11px] font-bold tracking-wider border-b border-slate-100">
            <tr>
              <th className="py-3 px-4">Código</th>
              <th className="py-3 px-4">Empleado</th>
              <th className="py-3 px-4">Puesto</th>
              <th className="py-3 px-4">Correo Destinatario</th>
              <th className="py-3 px-4 text-right">Neto Pagado</th>
              <th className="py-3 px-4 text-center">Estatus Envío</th>
              <th className="py-3 px-4 text-center">Inspeccionar PDF</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {safeItems.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                <td className="py-3 px-4 font-mono font-bold text-emerald-600">{item.codigoEmpleado}</td>
                <td className="py-3 px-4 font-bold text-slate-900">{item.nombreEmpleado || '-'}</td>
                <td className="py-3 px-4 text-slate-500 font-medium">{item.puestoEmpleado || '-'}</td>
                <td className="py-2 px-4">
                  <input
                    type="email"
                    value={item.emailDestinatario || ''}
                    onChange={(e) => onUpdateEmail(idx, e.target.value)}
                    placeholder="correo@empresa.com"
                    className="w-56 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-slate-800 text-xs font-medium focus:bg-white focus:border-emerald-500 focus:outline-none"
                  />
                </td>
                <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                  {formatCurrency(item.netoAPagar)}
                </td>
                <td className="py-3 px-4 text-center">
                  <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full border border-slate-200 inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Pendiente
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <button
                    onClick={() => onSelectPdfItem(item)}
                    className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-xl transition-all flex items-center gap-1.5 mx-auto cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    Ver PDF
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};