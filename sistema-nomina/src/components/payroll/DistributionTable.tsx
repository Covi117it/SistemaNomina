import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { NominaItem } from '../../types/nomina';
import { formatCurrency } from '../../utils/formatters';
import { FormSelect } from '../common/FormSelect';
import { Mail } from 'lucide-react';
import { PdfPaystubButton } from './PdfPaystubButton';
import { Pagination } from '../common/Pagination';

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
  onSelectPdfItem?: (item: NominaItem) => void;
}

export const DistributionTable: React.FC<DistributionTableProps> = ({
  items = [],
  onUpdateEmail,
  onToggleExclude,
  onSelectPdfItem,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
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

  const totalItems = safeItems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const paginatedItems = safeItems.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

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
              <th className="py-3 px-3">Código</th>
              <th className="py-3 px-3">Empleado</th>
              <th className="py-3 px-3">Correo Destinatario</th>
              <th className="py-3 px-3 text-right">Sueldo Base</th>
              <th className="py-3 px-3 text-right">Total Devengado</th>
              <th className="py-3 px-3 text-right">Total Deducciones</th>
              <th className="py-3 px-3 text-right">Neto a Pagar</th>
              <th className="py-3 px-3 text-center">Acción de Envío</th>
              <th className="py-3 px-3 text-center">Volante</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedItems.map((item, idx) => {
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
                  <td className="py-3 px-3 font-mono font-bold text-emerald-600">
                    {item.codigoEmpleado}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{item.nombreEmpleado || '-'}</div>
                    <div className="text-[10px] text-slate-400 font-medium">{item.puestoEmpleado || '-'}</div>
                  </td>
                  <td className="py-2 px-3">
                    <input
                      type="email"
                      disabled={isExcluded}
                      value={item.emailDestinatario || ''}
                      onChange={(e) => onUpdateEmail(item.codigoEmpleado, e.target.value)}
                      placeholder="correo@empresa.com"
                      className={`w-48 border rounded-xl px-2.5 py-1 text-xs font-medium focus:outline-none transition-all ${
                        isExcluded
                          ? 'bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed'
                          : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500'
                      }`}
                    />
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-slate-600 font-medium">
                    {formatCurrency(item.sueldoBase || 0)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                    {formatCurrency(item.totalDevengado || 0)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-rose-600">
                    {formatCurrency(item.totalDeducciones || 0)}
                  </td>
                  <td className="py-3 px-3 text-right font-mono font-black text-emerald-600">
                    {formatCurrency(item.netoAPagar || 0)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <div className="w-28 mx-auto">
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
                                    Debe registrarlo primero en el Maestro de Personal antes de poder enviarle su comprobante por correo.
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
                      />
                    </div>
                  </td>
                  <td className="py-2 px-3 text-center">
                    <PdfPaystubButton onClick={() => onSelectPdfItem?.(item)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
        itemLabel="destinatarios"
      />
    </div>
  );
};