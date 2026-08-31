import React, { useState } from 'react';
import { NominaItem } from '../../types/nomina';
import { formatCurrency } from '../../utils/formatters';
import { usePaystubEmailDispatcher } from '../../hooks/usePaystubEmailDispatcher';
import { PdfPaystubButton } from './PdfPaystubButton';
import { SendPaystubButton } from './SendPaystubButton';
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
  const { sendingId, sentIds, sendSingleEmail } = usePaystubEmailDispatcher();

  const getSueldoYDevengado = (det: any) => {
    let sueldo = det.sueldoPeriodo || 0;
    let devengado = det.totalDevengado || 0;
    const extras = (det.incentivo || 0) + (det.reembolso || 0) + (det.horasExtras || 0);

    if (sueldo <= 0 && devengado > 0) {
      sueldo = Math.max(0, devengado - extras);
    } else if (devengado <= 0 && sueldo > 0) {
      devengado = sueldo + extras;
    }
    return { sueldo, devengado };
  };

  const mapDetalleToNominaItem = (det: any): NominaItem => {
    const { sueldo, devengado } = getSueldoYDevengado(det);
    return {
      codigoEmpleado: det.codigoEmpleado,
      nombreEmpleado: det.nombreEmpleadoSnapshot,
      sueldoBase: sueldo,
      quincena: det.quincenaPeriodo || '1Q',
      incentivo: det.incentivo || 0,
      reembolso: det.reembolso || 0,
      horasExtras: det.horasExtras || 0,
      prestamo: det.prestamo || 0,
      cuotaCumpleanos: det.cuotaCumpleanos || 0,
      seguroVehiculo: det.seguroVehiculo || 0,
      seguroMedico: det.seguroMedico || 0,
      sfs: det.sfs || 0,
      afp: det.afp || 0,
      isr: det.isr || 0,
      totalDevengado: devengado,
      totalDeducciones: det.totalDeducciones || 0,
      netoAPagar: det.netoPagado || 0,
      emailDestinatario: det.emailDestinatario,
      empleadoExiste: true,
    };
  };

  const handleSendSingleEmail = async (det: any) => {
    const itemToDispatch = mapDetalleToNominaItem(det);
    await sendSingleEmail(det.id, itemToDispatch, det.conceptoPeriodo || `Nómina ${det.quincenaPeriodo || ''}`);
  };

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
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDetalles.map((det: any, idx: number) => {
                const { sueldo, devengado } = getSueldoYDevengado(det);

                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3 font-bold text-slate-800">
                      #{det.periodoId} - {det.quincenaPeriodo} ({new Date(det.fechaProcesado).toLocaleDateString('es-DO')})
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600">{det.codigoEmpleado}</td>
                    <td className="p-3 font-bold text-slate-900">{det.nombreEmpleadoSnapshot}</td>
                    <td className="p-3 text-slate-500 font-mono">{det.emailDestinatario || '-'}</td>
                    <td className="p-3 text-right font-mono">{formatCurrency(sueldo)}</td>
                    <td className="p-3 text-right font-mono">{formatCurrency(devengado)}</td>
                    <td className="p-3 text-right font-mono text-slate-500">{formatCurrency(det.totalDeducciones)}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">{formatCurrency(det.netoPagado)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <PdfPaystubButton
                          onClick={() => onSelectPdfItem(mapDetalleToNominaItem(det))}
                        />
                        <SendPaystubButton
                          onSend={() => handleSendSingleEmail(det)}
                          isSending={sendingId === det.id}
                          isSent={sentIds.has(det.id)}
                          hasEmail={Boolean(det.emailDestinatario)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
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