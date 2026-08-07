import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { NominaItem } from '../../types/nomina';
import { PayrollHistoryDetail } from './PayrollHistoryDetail';
import { PDFPaystubModal } from './PDFPaystubModal';
import { FormSelect } from '../common/FormSelect';
import { SearchInput } from '../common/SearchInput';
import { PayrollHistorySummaryTable } from './PayrollHistorySummaryTable';
import { PayrollHistorySearchResultsTable } from './PayrollHistorySearchResultsTable';
import { Calendar, Filter, Layers, RefreshCw } from 'lucide-react';
import { ENDPOINTS } from '../../config/api';

interface PayrollHistoryTabProps {
  isActive: boolean;
}

export const PayrollHistoryTab: React.FC<PayrollHistoryTabProps> = ({ isActive }) => {
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
    axios.get(`${ENDPOINTS.CONFIG}/periodos-disponibles`)
      .then((res) => setPeriodosOptions(res.data))
      .catch(() => {});
  }, []);

  const fetchHistoryRecords = async () => {
    setLoadingHistory(true);
    try {
      const res = await axios.get(`${ENDPOINTS.NOMINA}/historico`, {
        params: {
          anio: selectedYear,
          mes: selectedMonth === 'TODOS' ? null : selectedMonth,
          quincena: selectedQuincena === 'TODAS' ? null : selectedQuincena,
          search: historySearchTerm && historySearchTerm.trim() !== '' ? historySearchTerm : null,
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
    if (isActive) {
      fetchHistoryRecords();
    }
  }, [isActive, selectedYear, selectedMonth, selectedQuincena, historySearchTerm]);

  const isSearching = Boolean(historySearchTerm && historySearchTerm.trim() !== '');

  const matchingDetalles = useMemo(() => {
    if (!isSearching) return [];
    const term = historySearchTerm.toLowerCase().trim();
    const isShortCode = term.length <= 3 && !term.includes('-');

    const results: any[] = [];
    historyRecords.forEach((periodo: any) => {
      periodo.detalles?.forEach((det: any) => {
        const matchesCode = det.codigoEmpleado?.toLowerCase().includes(term);
        const matchesName = det.nombreEmpleadoSnapshot?.toLowerCase().includes(term);
        const matchesEmail = det.emailDestinatario?.toLowerCase().includes(term);
        const matchesCedula = !isShortCode && det.cedulaSnapshot?.toLowerCase().includes(term);

        if (matchesCode || matchesName || matchesEmail || matchesCedula) {
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
    <div className="space-y-6">
      {selectedPeriod ? (
        <PayrollHistoryDetail
          period={selectedPeriod}
          onBack={() => setSelectedPeriod(null)}
          onSelectPdfItem={(item) => setSelectedPdfItem(item)}
        />
      ) : (
        <>
          <div className="space-y-4">
            <div className="bg-white border border-slate-200/70 rounded-[22px] p-4 shadow-xs">
              <SearchInput
                value={historySearchTerm}
                onChange={setHistorySearchTerm}
                placeholder="Buscar por código (ej: 001), nombre o correo a través de todas las quincenas..."
              />
            </div>

            <div className="px-1 py-0.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2.5">
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
                  icon={<Layers className="w-3.5 h-3.5 text-slate-400" />}
                />
              </div>

              <button
                onClick={fetchHistoryRecords}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-98 shrink-0"
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
  );
};
