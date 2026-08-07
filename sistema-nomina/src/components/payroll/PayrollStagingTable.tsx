import React, { useState, useEffect } from 'react';
import { PreviewNominaResponse, NominaItem } from '../../types/nomina';
import { AlertTriangle, DollarSign, ArrowUpRight, ArrowDownRight, ShieldCheck, UserX } from 'lucide-react';
import { PDFPaystubModal } from './PDFPaystubModal';
import { StatCard } from '../common/StatCard';
import { StagingToolbar } from './StagingToolbar';
import { StagingTableRows } from './StagingTableRows';
import { Pagination } from '../common/Pagination';
import { formatCurrency } from '../../utils/formatters';

interface PayrollStagingTableProps {
  previewData: PreviewNominaResponse;
  onUpdateItem: (index: number, field: keyof NominaItem, value: any) => void;
  onConfirmSave: (quincena: string, mes: number) => void;
  onNavigateToDistribution?: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

export const PayrollStagingTable: React.FC<PayrollStagingTableProps> = ({
  previewData,
  onUpdateItem,
  onConfirmSave,
  onCancel,
  isSaving,
}) => {
  const [selectedPdfItem, setSelectedPdfItem] = useState<NominaItem | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const hoy = new Date();
  const [quincena, setQuincena] = useState<string>(
    previewData?.quincenaSugerida || (previewData?.items?.[0]?.quincena) || (hoy.getDate() <= 15 ? '1Q' : '2Q')
  );
  const [mes, setMes] = useState<string>(
    previewData?.mesSugerido ? previewData.mesSugerido.toString() : (hoy.getMonth() + 1).toString()
  );

  // SINCRONIZACIÓN AUTOMÁTICA CON LA METADATA SUGERIDA DESDE EL BACKEND
  useEffect(() => {
    if (previewData) {
      if (previewData.quincenaSugerida) {
        setQuincena(previewData.quincenaSugerida);
      } else if (previewData.items && previewData.items.length > 0) {
        setQuincena(previewData.items[0].quincena);
      }

      if (previewData.mesSugerido) {
        setMes(previewData.mesSugerido.toString());
      }
    }
  }, [previewData]);

  // Reset de página cuando cambia la cantidad de items
  useEffect(() => {
    setCurrentPage(1);
  }, [previewData?.items?.length]);

  const isUnregistered = (item: NominaItem) =>
    !item.empleadoExiste ||
    item.eStatusEmpleado === 'NO_EXISTE' ||
    (item.nombreEmpleado && item.nombreEmpleado.includes('NO REGISTRADO'));

  const sortedItems = React.useMemo(() => {
    const list = [...(previewData?.items || [])];
    return list.sort((a, b) => {
      const aUnreg = isUnregistered(a) ? 0 : 1;
      const bUnreg = isUnregistered(b) ? 0 : 1;
      return aUnreg - bUnreg;
    });
  }, [previewData?.items]);

  const totalItems = sortedItems.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedItems = sortedItems.slice(startIndex, startIndex + pageSize);

  const handleUpdatePaginatedItem = (paginatedIdx: number, field: keyof NominaItem, value: any) => {
    const targetItem = paginatedItems[paginatedIdx];
    if (!targetItem) return;
    const originalIndex = (previewData?.items || []).findIndex((it) => it === targetItem);
    if (originalIndex !== -1) {
      onUpdateItem(originalIndex, field, value);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl p-6 mb-8 transition-all animate-in fade-in space-y-4">
      <StagingToolbar
        totalRegistros={previewData.totalRegistros}
        quincena={quincena}
        mes={mes}
        onCancel={onCancel}
        onConfirmSave={onConfirmSave}
        isSaving={isSaving}
        canSave={(previewData?.items || []).length > 0}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Total Devengado"
          value={formatCurrency(previewData.resumenTotales.totalDevengado)}
          icon={<ArrowUpRight className="w-5 h-5" />}
          variant="slate"
        />
        <StatCard
          label="Total Deducciones"
          value={formatCurrency(previewData.resumenTotales.totalDeducciones)}
          icon={<ArrowDownRight className="w-5 h-5" />}
          variant="slate"
        />
        <StatCard
          label="Total Neto a Pagar"
          value={formatCurrency(previewData.resumenTotales.totalNeto)}
          icon={<DollarSign className="w-5 h-5" />}
          variant="emerald"
        />
        <StatCard
          label="Códigos no Registrados"
          value={previewData.codigosNoEncontrados}
          icon={previewData.codigosNoEncontrados > 0 ? <UserX className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
          variant={previewData.codigosNoEncontrados > 0 ? 'rose' : 'slate'}
        />
      </div>

      {previewData.codigosNoEncontrados > 0 && (
        <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs font-semibold flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span>
            Atención: Existen <strong>{previewData.codigosNoEncontrados} códigos</strong> en el Excel que no están creados en la Base de Datos.
          </span>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 overflow-hidden">
        <StagingTableRows
          items={paginatedItems}
          onUpdateItem={handleUpdatePaginatedItem}
          onSelectPdfItem={setSelectedPdfItem}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={setPageSize}
          itemLabel="registros"
        />
      </div>

      <PDFPaystubModal
        isOpen={!!selectedPdfItem}
        item={selectedPdfItem}
        onClose={() => setSelectedPdfItem(null)}
      />
    </div>
  );
};