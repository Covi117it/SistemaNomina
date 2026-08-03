import React, { useState, useEffect } from 'react';
import { NominaItem } from '../types/nomina';
import { PDFPaystubModal } from '../components/payroll/PDFPaystubModal';
import { PageHeader } from '../components/common/PageHeader';
import { StatCard } from '../components/common/StatCard';
import { DistributionTable } from '../components/payroll/DistributionTable';
import { SmtpConfigModal } from '../components/payroll/SmtpConfigModal';
import { formatCurrency } from '../utils/formatters';
import { Mail, Send, FileText, CheckCircle2, Settings, Loader2 } from 'lucide-react';
import axios from 'axios';

interface DistributionPdfPageProps {
  items?: NominaItem[];
  conceptoPeriodo?: string;
  onBack: () => void;
  onSuccessDispatch?: () => void;
}

export const DistributionPdfPage: React.FC<DistributionPdfPageProps> = ({
  items = [],
  conceptoPeriodo = 'Primera Quincena de Enero 2026',
  onBack,
}) => {
  const [selectedPdfItem, setSelectedPdfItem] = useState<NominaItem | null>(null);
  const [sending, setSending] = useState(false);
  const [loadingHistoric, setLoadingHistoric] = useState(false);
  const [showSmtpModal, setShowSmtpModal] = useState(false);
  const [dispatchResult, setDispatchResult] = useState<{ exitosos: number; fallidos: number } | null>(null);
  const [localItems, setLocalItems] = useState<NominaItem[]>(items || []);
  const [periodoNombre, setPeriodoNombre] = useState<string>(conceptoPeriodo);

   useEffect(() => {
    let isMounted = true;
    if (items && items.length > 0) {
      setLocalItems(items);
      setLoadingHistoric(false);
    } else {
      setLoadingHistoric(true);
      axios.get('http://localhost:5289/api/nomina/historico')
        .then((res) => {
          if (!isMounted) return;
          if (res.data && res.data.length > 0) {
            const ultimoPeriodo = res.data[0];
            setPeriodoNombre(ultimoPeriodo.concepto || conceptoPeriodo);
            if (ultimoPeriodo.detalles) {
              const mappedItems = ultimoPeriodo.detalles.map((det: any) => ({
                codigoEmpleado: det.codigoEmpleado,
                nombreEmpleado: det.nombreEmpleadoSnapshot,
                sueldoBase: det.sueldoPeriodo,
                quincena: ultimoPeriodo.quincena,
                totalDevengado: det.totalDevengado,
                totalDeducciones: det.totalDeducciones,
                netoAPagar: det.netoPagado,
                emailDestinatario: det.emailDestinatario,
                empleadoExiste: true,
              }));
              setLocalItems(mappedItems);
            }
          }
        })
        .catch((err) => {
          console.error('Error cargando volantes históricos:', err);
        })
        .finally(() => {
          if (isMounted) setLoadingHistoric(false);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [items?.length]); 

  const handleUpdateEmail = (index: number, newEmail: string) => {
    const updated = [...localItems];
    updated[index] = { ...updated[index], emailDestinatario: newEmail };
    setLocalItems(updated);
  };

  const handleSendEmails = async () => {
    if (!localItems || localItems.length === 0) return;
    setSending(true);
    setDispatchResult(null);

    try {
      const smtpRes = await axios.get('http://localhost:5289/api/config/smtp');
      const payload = {
        items: localItems,
        conceptoPeriodo: periodoNombre,
        smtpConfig: smtpRes.data,
      };

      const res = await axios.post('http://localhost:5289/api/nomina/enviar-volantes-correo', payload);
      setDispatchResult({
        exitosos: res.data.exitosos || localItems.length,
        fallidos: res.data.fallidos || 0,
      });
    } catch (err) {
      alert('Error al conectar con el servidor SMTP de correo.');
    } finally {
      setSending(false);
    }
  };

  const safeItems = localItems || [];
  const validEmailsCount = safeItems.filter((i) => i.emailDestinatario && i.emailDestinatario.includes('@')).length;
  const totalMonto = safeItems.reduce((acc, i) => acc + (i.netoAPagar || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title={`Panel de Distribución e Inspección de PDF - ${periodoNombre}`}
        onBack={onBack}
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
              disabled={sending || safeItems.length === 0}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Despachando Correos...' : 'Enviar Volantes por Correo'}
            </button>
          </>
        }
      />

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
              value={safeItems.length}
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

          <DistributionTable
            items={safeItems}
            onUpdateEmail={handleUpdateEmail}
            onSelectPdfItem={setSelectedPdfItem}
          />
        </>
      )}

      <PDFPaystubModal
        isOpen={!!selectedPdfItem}
        item={selectedPdfItem}
        onClose={() => setSelectedPdfItem(null)}
      />

      <SmtpConfigModal
        isOpen={showSmtpModal}
        onClose={() => setShowSmtpModal(false)}
      />
    </div>
  );
};