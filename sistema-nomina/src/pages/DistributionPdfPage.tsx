import React, { useState } from 'react';
import { NominaItem } from '../types/nomina';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { DistributionTable } from '../components/payroll/DistributionTable';
import { SmtpConfigModal } from '../components/payroll/SmtpConfigModal';
import { PDFPaystubModal } from '../components/payroll/PDFPaystubModal';
import { SearchInput } from '../components/common/SearchInput';
import { FormSelect } from '../components/common/FormSelect';
import { PillFilterGroup } from '../components/common/PillFilterGroup';
import { formatCurrency } from '../utils/formatters';
import { Mail, Send, FileText, CheckCircle2, Settings, Loader2, Calendar } from 'lucide-react';
import { ActionsDropdown } from '../components/common/ActionsDropdown';
import { useDistributionPdf } from '../hooks/useDistributionPdf';

interface DistributionPdfPageProps {
  items?: NominaItem[];
  conceptoPeriodo?: string;
  onBack: () => void;
  onSuccessDispatch?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToDirectory?: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToPayroll?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToDistribution?: () => void;
}

export const DistributionPdfPage: React.FC<DistributionPdfPageProps> = ({
  items = [],
  conceptoPeriodo = '',
  onBack,
  onNavigateToDashboard,
  onNavigateToDirectory,
  onNavigateToCreate,
  onNavigateToPayroll,
  onNavigateToHistory,
  onNavigateToDistribution,
}) => {
  const [selectedPdfItem, setSelectedPdfItem] = useState<NominaItem | null>(null);

  const {
    sending,
    loadingHistoric,
    showSmtpModal,
    setShowSmtpModal,
    dispatchResult,
    periodoNombre,
    searchTerm,
    setSearchTerm,
    distributionFilter,
    setDistributionFilter,
    periodosHistoricos,
    selectedPeriodoId,
    setSelectedPeriodoId,
    cargarDetallesPeriodo,
    safeItems,
    activeItems,
    excludedItemsCount,
    filteredItems,
    validEmailsCount,
    totalMonto,
    handleUpdateEmail,
    handleToggleExclude,
    handleSendEmails,
  } = useDistributionPdf(items, conceptoPeriodo);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title={`Panel de Distribución de Volantes`}
        onBack={onBack}
        leftActions={
          onNavigateToCreate && (
            <ActionsDropdown
              currentView="distribution-pdf"
              onNavigateToDashboard={onNavigateToDashboard}
              onNavigateToDirectory={onNavigateToDirectory}
              onNavigateToCreate={onNavigateToCreate}
              onNavigateToPayroll={onNavigateToPayroll}
              onNavigateToHistory={onNavigateToHistory}
              onNavigateToDistribution={onNavigateToDistribution}
            />
          )
        }
        actions={
          <>
            <button
              onClick={() => setShowSmtpModal(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Settings className="w-4 h-4 text-slate-500" />
              Configurar SMTP
            </button>

            <button
              onClick={handleSendEmails}
              disabled={sending || activeItems.length === 0}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Despachando Correos...' : `Enviar Volantes por Correo (${activeItems.length})`}
            </button>
          </>
        }
      />

      {periodosHistoricos.length > 0 && (!items || items.length === 0) && (
        <div className="bg-white border border-slate-200/80 rounded-2xl p-3.5 px-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-800 tracking-tight">Período de Nómina a Procesar</h4>
            </div>
          </div>

          <FormSelect
            options={periodosHistoricos.map((p) => ({
              label: `${p.concepto} (DOP$ ${p.montoTotalNeto?.toLocaleString('es-DO', { minimumFractionDigits: 2 })})`,
              value: p.id.toString(),
            }))}
            value={selectedPeriodoId ? selectedPeriodoId.toString() : ''}
            onChange={(val) => {
              const pId = parseInt(val, 10);
              setSelectedPeriodoId(pId);
              const pEncontrado = periodosHistoricos.find((p) => p.id === pId);
              if (pEncontrado) {
                cargarDetallesPeriodo(pEncontrado);
              }
            }}
            placeholder="Seleccionar período de nómina..."
            className="w-full md:w-auto min-w-[340px]"
          />
        </div>
      )}

      {dispatchResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between shadow-sm animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-extrabold text-emerald-900">¡Proceso de Envío Finalizado!</h4>
              <p className="text-xs text-emerald-700 font-medium">
                {dispatchResult.exitosos} volantes enviados exitosamente. {dispatchResult.fallidos} fallidos.
              </p>
            </div>
          </div>
        </div>
      )}

      {loadingHistoric ? (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm p-12 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Cargando volantes de nómina desde la base de datos...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Total Volantes a Enviar"
              value={activeItems.length}
              icon={<Mail className="w-5 h-5" />}
              variant="slate"
            />
            <StatCard
              label="Correos Válidos"
              value={validEmailsCount}
              icon={<CheckCircle2 className="w-5 h-5" />}
              variant="emerald"
            />
            <StatCard
              label="Monto Total a Notificar"
              value={formatCurrency(totalMonto)}
              icon={<FileText className="w-5 h-5" />}
              variant="slate"
            />
          </div>

          <div className="space-y-4">
            <div className="bg-white border border-slate-200/80 rounded-[22px] p-4 shadow-sm">
              <SearchInput
                value={searchTerm}
                onChange={setSearchTerm}
                placeholder="Buscar empleado por nombre, cédula, código, puesto..."
              />
            </div>
            <div className="px-1 py-0.5">
              <PillFilterGroup<'TODOS' | 'INCLUIDOS' | 'EXCLUIDOS'>
                title="Volantes"
                options={[
                  { key: 'TODOS', label: 'Todos', count: safeItems.length },
                  { key: 'INCLUIDOS', label: 'Incluidos', count: activeItems.length },
                  { key: 'EXCLUIDOS', label: 'Excluidos', count: excludedItemsCount },
                ]}
                value={distributionFilter}
                onChange={setDistributionFilter}
              />
            </div>
          </div>

          <DistributionTable
            items={filteredItems}
            onUpdateEmail={handleUpdateEmail}
            onToggleExclude={handleToggleExclude}
            onSelectPdfItem={(item) => setSelectedPdfItem(item)}
          />
        </>
      )}

      <PDFPaystubModal
        isOpen={!!selectedPdfItem}
        onClose={() => setSelectedPdfItem(null)}
        item={selectedPdfItem}
        conceptoPeriodo={periodoNombre || conceptoPeriodo}
      />

      <SmtpConfigModal
        isOpen={showSmtpModal}
        onClose={() => setShowSmtpModal(false)}
      />
    </div>
  );
};