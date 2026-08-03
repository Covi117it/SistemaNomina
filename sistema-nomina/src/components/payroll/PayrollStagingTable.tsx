import React, { useState } from 'react';
import { PreviewNominaResponse, NominaItem } from '../../types/nomina';
import { AlertTriangle, DollarSign, ArrowUpRight, ArrowDownRight, ShieldCheck, UserX } from 'lucide-react';
import { PDFPaystubModal } from './PDFPaystubModal';
import { StatCard } from '../common/StatCard';
import { StagingToolbar } from './StagingToolbar';
import { StagingTableRows } from './StagingTableRows';
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
  onNavigateToDistribution,
  onCancel,
  isSaving,
}) => {
  const [selectedPdfItem, setSelectedPdfItem] = useState<NominaItem | null>(null);

  const hoy = new Date();
  const [quincena, setQuincena] = useState<string>(hoy.getDate() <= 15 ? '1Q' : '2Q');
  const [mes, setMes] = useState<string>((hoy.getMonth() + 1).toString());

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xl p-6 mb-8 transition-all animate-in fade-in">
      <StagingToolbar
        totalRegistros={previewData.totalRegistros}
        quincena={quincena}
        mes={mes}
        setQuincena={setQuincena}
        setMes={setMes}
        onCancel={onCancel}
        onConfirmSave={onConfirmSave}
        onNavigateToDistribution={onNavigateToDistribution}
        isSaving={isSaving}
        canSave={previewData.items.length > 0}
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

      <StagingTableRows
        items={previewData.items}
        onUpdateItem={onUpdateItem}
        onSelectPdfItem={setSelectedPdfItem}
      />

      <PDFPaystubModal
        isOpen={!!selectedPdfItem}
        item={selectedPdfItem}
        onClose={() => setSelectedPdfItem(null)}
      />
    </div>
  );
};