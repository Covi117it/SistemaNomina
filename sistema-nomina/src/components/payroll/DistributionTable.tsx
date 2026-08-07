import React from 'react';
import Swal from 'sweetalert2';
import { NominaItem } from '../../types/nomina';
import { formatCurrency } from '../../utils/formatters';
import { FormSelect } from '../common/FormSelect';
import { Mail, Clock } from 'lucide-react';

export interface ExtendedNominaItem extends NominaItem {
  excluido?: boolean;
}

const ENVIO_OPTIONS = [
  { label: 'ENVIAR', value: 'ENVIAR' },
  { label: 'NO ENVIAR', value: 'NO ENVIAR' },
];

interface DistributionTableProps {
  items?: ExtendedNominaItem[];
  onUpdateEmail: (codigoEmpleado: string, newEmail: string) => void;
  onToggleExclude: (codigoEmpleado: string, exclude: boolean) => void;
}

export const DistributionTable: React.FC<DistributionTableProps> = ({
  items = [],
  onUpdateEmail,
  onToggleExclude,
}) => {
  const safeItems = items || [];

  if (safeItems.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-10 text-center space-y-3">
        <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
          <Mail className="w-7 h-7" />
        </div>
        <h4 className="text-sm font-extrabold text-slate-800">No hay comprobantes seleccionados</h4>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2">
          <Mail className="w-4 h-4 text-emerald-600" />
          Lista de Destinatarios ({safeItems.length})
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
              <th className="py-3 px-4 text-center">Acción de Envío</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {safeItems.map((item, idx) => {
              const esInexistente =
                !item.empleadoExiste ||
                item.eStatusEmpleado === 'NO_EXISTE' ||
                item.nombreEmpleado?.includes('NO REGISTRADO');
              const isExcluded = !!item.excluido || esInexistente;

              return (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    isExcluded ? 'bg-slate-50/60 opacity-60' : 'hover:bg-slate-50/80'
                  }`}
                >
                  <td className="py-3 px-4 font-mono font-bold text-emerald-600">
                    {item.codigoEmpleado}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">
                    {item.nombreEmpleado || '-'}
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-medium">
                    {item.puestoEmpleado || '-'}
                  </td>
                  <td className="py-2 px-4">
                    <input
                      type="email"
                      disabled={isExcluded}
                      value={item.emailDestinatario || ''}
                      onChange={(e) => onUpdateEmail(item.codigoEmpleado, e.target.value)}
                      placeholder="correo@empresa.com"
                      className={`w-56 border rounded-xl px-2.5 py-1 text-xs font-medium focus:outline-none transition-all ${
                        isExcluded
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500'
                      }`}
                    />
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-700">
                    {formatCurrency(item.netoAPagar)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {isExcluded ? (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-[10px] font-bold rounded-full border border-amber-200 inline-flex items-center gap-1">
                        Excluido
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-full border border-slate-200 inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Pendiente
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-center">
                    <div className="w-32 mx-auto">
                      <FormSelect
                        options={ENVIO_OPTIONS}
                        value={isExcluded ? 'NO ENVIAR' : 'ENVIAR'}
                        onChange={(val) => {
                          if (val === 'ENVIAR' && esInexistente) {
                            Swal.fire({
                              title: '¡No se puede enviar a este empleado!',
                              html: `
                                <div class="text-left text-xs text-slate-600 space-y-3 pt-2">
                                  <p class="font-bold text-slate-800 text-sm">
                                    El empleado con código <span class="text-rose-600 font-extrabold font-mono">${item.codigoEmpleado}</span> no está registrado en la Base de Datos.
                                  </p>
                                  <p class="text-slate-500 font-medium leading-relaxed">
                                    Debe registrar a este empleado en el catálogo antes de poder habilitar el envío de su volante de pago por correo.
                                  </p>
                                </div>
                              `,
                              icon: 'error',
                              confirmButtonText: 'Entendido',
                              confirmButtonColor: '#10b981',
                              customClass: {
                                popup: 'rounded-2xl shadow-2xl border border-slate-200 font-sans p-6',
                                title: 'text-lg font-extrabold text-slate-900',
                              },
                            });
                            return;
                          }
                          onToggleExclude(item.codigoEmpleado, val === 'NO ENVIAR');
                        }}
                        className="w-full"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};