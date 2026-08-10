import React, { useState } from 'react';
import { FileText } from 'lucide-react';
import { NominaItem } from '../../types/nomina';
import { formatCurrency } from '../../utils/formatters';
import { Pagination } from '../common/Pagination';

interface PayrollHistorySearchResultsTableProps {
  detalles: any[];
  searchTerm: string;
  onSelectPdfItem: (item: NominaItem) => void;
}

export const PayrollHistorySearchResultsTable: React.FC<PayrollHistorySearchResultsTableProps> = ({
  detalles,
  searchTerm,
  onSelectPdfItem,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalItems = detalles.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedDetalles = detalles.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div>
      <div className="mb-4 pb-3 border-b border-slate-100 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-700">
          Resultados de búsqueda: <strong className="text-emerald-600">{detalles.length}</strong> comprobante(s) hallado(s) para "{searchTerm}"
        </span>
      </div>

      {detalles.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-sm font-bold text-slate-700">No se encontraron comprobantes para "{searchTerm}" en los períodos seleccionados</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase text-slate-400 font-bold border-b">
              <tr>
                <th className="p-3">Período / Quincena</th>
                <th className="p-3">Código</th>
                <th className="p-3">Empleado</th>
                <th className="p-3">Correo Destinatario</th>
                <th className="p-3 text-right">Sueldo Base</th>
                <th className="p-3 text-right">Devengado</th>
                <th className="p-3 text-right">Deducciones</th>
                <th className="p-3 text-right">Neto Pagado</th>
                <th className="p-3 text-center">PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDetalles.map((det: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-bold text-slate-800">
                    #{det.periodoId} - {det.quincenaPeriodo} ({new Date(det.fechaProcesado).toLocaleDateString('es-DO')})
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-600">{det.codigoEmpleado}</td>
                  <td className="p-3 font-bold text-slate-900">{det.nombreEmpleadoSnapshot}</td>
                  <td className="p-3 text-slate-500 font-mono">{det.emailDestinatario || '-'}</td>
                  <td className="p-3 text-right font-mono">{formatCurrency(det.sueldoPeriodo)}</td>
                  <td className="p-3 text-right font-mono">{formatCurrency(det.totalDevengado)}</td>
                  <td className="p-3 text-right font-mono text-slate-500">{formatCurrency(det.totalDeducciones)}</td>
                  <td className="p-3 text-right font-mono font-bold text-emerald-700">{formatCurrency(det.netoPagado)}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() =>
                        onSelectPdfItem({
                          codigoEmpleado: det.codigoEmpleado,
                          nombreEmpleado: det.nombreEmpleadoSnapshot,
                          sueldoBase: det.sueldoPeriodo,
                          quincena: det.quincenaPeriodo,
                          incentivo: det.incentivo,
                          reembolso: det.reembolso,
                          horasExtras: det.horasExtras,
                          prestamo: det.prestamo,
                          cuotaCumpleanos: det.cuotaCumpleanos,
                          seguroVehiculo: det.seguroVehiculo,
                          seguroMedico: det.seguroMedico,
                          sfs: det.sfs,
                          afp: det.afp,
                          isr: det.isr,
                          totalDevengado: det.totalDevengado,
                          totalDeducciones: det.totalDeducciones,
                          netoAPagar: det.netoPagado,
                          emailDestinatario: det.emailDestinatario,
                          empleadoExiste: true,
                        })
                      }
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer border border-emerald-200"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

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
            itemLabel="comprobantes"
          />
        </div>
      )}
    </div>
  );
};