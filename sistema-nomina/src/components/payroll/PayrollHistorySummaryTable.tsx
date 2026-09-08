import React, { useState } from 'react';
import { Eye } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { Pagination } from '../common/Pagination';

interface PayrollHistorySummaryTableProps {
  records: any[];
  onSelectPeriod: (period: any) => void;
}

export const PayrollHistorySummaryTable: React.FC<PayrollHistorySummaryTableProps> = ({
  records,
  onSelectPeriod,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  if (records.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm font-bold text-slate-700">No hay nóminas quincenales guardadas aún</p>
      </div>
    );
  }

  const totalItems = records.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const paginatedRecords = records.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="bg-slate-50 uppercase text-slate-400 font-bold border-b">
          <tr>
            <th className="p-3">ID / Quincena</th>
            <th className="p-3">Concepto</th>
            <th className="p-3">Fecha Procesado</th>
            <th className="p-3 text-right">Total Devengado</th>
            <th className="p-3 text-right">Total Deducciones</th>
            <th className="p-3 text-right">Neto Pagado</th>
            <th className="p-3 text-center">Estado</th>
            <th className="p-3 text-center">Acción</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {paginatedRecords.map((periodo: any) => (
            <tr
              key={periodo.id}
              onDoubleClick={() => onSelectPeriod(periodo)}
              className="hover:bg-slate-50 cursor-pointer transition-colors"
            >
              <td className="p-3 font-mono font-bold text-emerald-600">#{periodo.id} - {periodo.quincena}</td>
              <td className="p-3 font-bold text-slate-900">{periodo.concepto}</td>
              <td className="p-3 font-mono text-slate-500">{new Date(periodo.fechaProcesado).toLocaleDateString('es-DO')}</td>
              <td className="p-3 text-right font-mono">{formatCurrency(periodo.montoTotalDevengado)}</td>
              <td className="p-3 text-right font-mono">{formatCurrency(periodo.montoTotalDeducciones)}</td>
              <td className="p-3 text-right font-mono font-bold text-emerald-700">{formatCurrency(periodo.montoTotalNeto)}</td>
              <td className="p-3 text-center">
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full">
                  {periodo.estado}
                </span>
              </td>
              <td className="p-3 text-center">
                <button
                  onClick={() => onSelectPeriod(periodo)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-700 text-xs font-bold rounded-lg transition-all flex items-center gap-1 mx-auto cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Ver
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
        itemLabel="nóminas"
      />
    </div>
  );
};