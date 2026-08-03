import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { NominaItem, PreviewNominaResponse } from '../types/nomina';
import { PayrollStagingTable } from '../components/payroll/PayrollStagingTable';
import { PayrollHistoryDetail } from '../components/payroll/PayrollHistoryDetail';
import { PDFPaystubModal } from '../components/payroll/PDFPaystubModal';
import { FormSelect } from '../components/common/FormSelect';
import { SearchInput } from '../components/common/SearchInput';
import { PageHeader } from '../components/common/PageHeader';
import { PayrollUploadBox } from '../components/payroll/PayrollUploadBox';
import { PayrollHistorySummaryTable } from '../components/payroll/PayrollHistorySummaryTable';
import { PayrollHistorySearchResultsTable } from '../components/payroll/PayrollHistorySearchResultsTable';
import { Calculator, History, Calendar, Filter, RefreshCw } from 'lucide-react';

interface PayrollManagementPageProps {
  previewNominaData: PreviewNominaResponse | null;
  isPayrollStagingMode: boolean;
  loading: boolean;
  isSaving: boolean;
  onFileUpload: (file: File) => Promise<void>;
  onUpdatePayrollItem: (index: number, field: keyof NominaItem, value: any) => void;
  onConfirmSavePayroll: (quincena?: string, mes?: number) => Promise<void>;
  onNavigateToDistribution?: () => void;
  onCancelStaging: () => void;
  onBack: () => void;
  defaultTab?: 'processing' | 'history';
}

export const PayrollManagementPage: React.FC<PayrollManagementPageProps> = ({
  previewNominaData,
  isPayrollStagingMode,
  loading,
  isSaving,
  onFileUpload,
  onUpdatePayrollItem,
  onConfirmSavePayroll,
  onNavigateToDistribution,
  onCancelStaging,
  onBack,
  defaultTab = 'processing',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'processing' | 'history'>(defaultTab);

  useEffect(() => {
    setActiveSubTab(defaultTab);
  }, [defaultTab]);

  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [historySearchTerm, setHistorySearchTerm] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState<string>('TODOS');
  const [selectedQuincena, setSelectedQuincena] = useState<string>('TODAS');

  const [periodosOptions, setPeriodosOptions] = useState<{ anios: any[]; meses: any[]; quincenas: any[] }>({
    anios: [],
    meses: [],
    quincenas: [],
  });

  const [selectedPeriod, setSelectedPeriod] = useState<any | null>(null);
  const [selectedPdfItem, setSelectedPdfItem] = useState<NominaItem | null>(null);

  useEffect(() => {
    axios.get('http://localhost:5289/api/config/periodos-disponibles')
      .then((res) => setPeriodosOptions(res.data))
      .catch(() => {});
  }, []);

  const fetchHistoryRecords = async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get('http://localhost:5289/api/nomina/historico', {
        params: {
          anio: selectedYear,
          mes: selectedMonth === 'TODOS' ? null : selectedMonth,
          quincena: selectedQuincena === 'TODAS' ? null : selectedQuincena,
        },
      });
      setHistoryRecords(res.data);
    } catch (err) {
      console.error('Error al consultar el histórico:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeSubTab === 'history') {
      fetchHistoryRecords();
    }
  }, [activeSubTab, selectedYear, selectedMonth, selectedQuincena]);

  const isSearching = Boolean(historySearchTerm && historySearchTerm.trim() !== '');

  const matchingDetalles = useMemo(() => {
    if (!isSearching) return [];
    const term = historySearchTerm.toLowerCase().trim();

    const results: any[] = [];
    historyRecords.forEach((periodo: any) => {
      periodo.detalles?.forEach((det: any) => {
        const matches =
          det.codigoEmpleado?.toLowerCase().includes(term) ||
          det.nombreEmpleadoSnapshot?.toLowerCase().includes(term) ||
          det.emailDestinatario?.toLowerCase().includes(term) ||
          det.cedulaSnapshot?.toLowerCase().includes(term) ||
          periodo.concepto?.toLowerCase().includes(term) ||
          periodo.quincena?.toLowerCase().includes(term);

        if (matches) {
          results.push({
            ...det,
            periodoId: periodo.id,
            conceptoPeriodo: periodo.concepto,
            quincenaPeriodo: periodo.quincena,
            mesPeriodo: periodo.mes,
            fechaProcesado: periodo.fechaProcesado,
          });
        }
      });
    });
    return results;
  }, [historyRecords, historySearchTerm, isSearching]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Gestión de Nómina Quincenal"
        onBack={onBack}
        actions={
          <div className="flex items-center bg-slate-100 p-1 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => {
                setActiveSubTab('processing');
                setSelectedPeriod(null);
              }}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'processing'
                  ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Calculator className="w-4 h-4 text-emerald-500" />
              Carga y Procesamiento
            </button>
            <button
              onClick={() => setActiveSubTab('history')}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeSubTab === 'history'
                  ? 'bg-white text-slate-900 shadow-md shadow-slate-200/50'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <History className="w-4 h-4 text-indigo-500" />
              Histórico de Nóminas
            </button>
          </div>
        }
      />

      {activeSubTab === 'processing' && (
        <div className="space-y-6">
          {!isPayrollStagingMode || !previewNominaData ? (
            <PayrollUploadBox onFileUpload={onFileUpload} loading={loading} />
          ) : (
            <PayrollStagingTable
              previewData={previewNominaData}
              onUpdateItem={onUpdatePayrollItem}
              onConfirmSave={onConfirmSavePayroll}
              onNavigateToDistribution={onNavigateToDistribution}
              onCancel={onCancelStaging}
              isSaving={isSaving}
            />
          )}
        </div>
      )}

      {activeSubTab === 'history' && (
        <div className="space-y-6">
          {selectedPeriod ? (
            <PayrollHistoryDetail
              period={selectedPeriod}
              onBack={() => setSelectedPeriod(null)}
              onSelectPdfItem={(item) => setSelectedPdfItem(item)}
            />
          ) : (
            <>
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
                <SearchInput
                  value={historySearchTerm}
                  onChange={setHistorySearchTerm}
                  placeholder="Buscar por código (ej: 01), nombre o correo a través de todas las quincenas..."
                />

                <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                  <FormSelect
                    options={periodosOptions.anios}
                    value={selectedYear}
                    onChange={setSelectedYear}
                    icon={<Calendar className="w-3.5 h-3.5 text-slate-400" />}
                  />

                  <FormSelect
                    options={periodosOptions.meses}
                    value={selectedMonth}
                    onChange={setSelectedMonth}
                    icon={<Filter className="w-3.5 h-3.5 text-slate-400" />}
                  />

                  <FormSelect
                    options={periodosOptions.quincenas}
                    value={selectedQuincena}
                    onChange={setSelectedQuincena}
                  />

                  <button
                    onClick={fetchHistoryRecords}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${loadingHistory ? 'animate-spin' : ''}`} />
                    Consultar
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
                {isSearching ? (
                  <PayrollHistorySearchResultsTable
                    detalles={matchingDetalles}
                    searchTerm={historySearchTerm}
                    onSelectPdfItem={setSelectedPdfItem}
                  />
                ) : (
                  <PayrollHistorySummaryTable
                    records={historyRecords}
                    onSelectPeriod={setSelectedPeriod}
                  />
                )}
              </div>
            </>
          )}

          <PDFPaystubModal
            isOpen={selectedPdfItem !== null}
            onClose={() => setSelectedPdfItem(null)}
            item={selectedPdfItem}
            conceptoPeriodo={selectedPeriod?.concepto}
          />
        </div>
      )}
    </div>
  );
};