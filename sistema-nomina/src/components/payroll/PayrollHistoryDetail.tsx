import React, { useState } from 'react';
import { ArrowLeft, Search, CheckCircle2, FileText, Mail, Loader2 } from 'lucide-react';
import { NominaItem } from '../../types/nomina';
import { usePaystubEmailDispatcher } from '../../hooks/usePaystubEmailDispatcher';

interface PayrollHistoryDetailProps {
  period: any;
  onBack: () => void;
  onSelectPdfItem: (item: NominaItem) => void;
}

export const PayrollHistoryDetail: React.FC<PayrollHistoryDetailProps> = ({
  period,
  onBack,
  onSelectPdfItem,
}) => {
  const [detailSearchTerm, setDetailSearchTerm] = useState<string>('');
  const { sendingId, sentIds, sendSingleEmail } = usePaystubEmailDispatcher();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
      style: 'currency',
      currency: 'DOP',
      minimumFractionDigits: 2,
    }).format(amount || 0);
  };

  const handleSendSingleEmail = async (det: any) => {
    const itemToDispatch: NominaItem = {
      codigoEmpleado: det.codigoEmpleado,
      nombreEmpleado: det.nombreEmpleadoSnapshot,
      sueldoBase: det.sueldoPeriodo || 0,
      quincena: period.quincena || '1Q',
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
      totalDevengado: det.totalDevengado || 0,
      totalDeducciones: det.totalDeducciones || 0,
      netoAPagar: det.netoPagado || 0,
      emailDestinatario: det.emailDestinatario,
      empleadoExiste: true,
    };

    await sendSingleEmail(det.id, itemToDispatch, period.concepto);
  };

  const filteredDetalles = period.detalles?.filter((det: any) => {
    if (!detailSearchTerm) return true;
    const term = detailSearchTerm.toLowerCase();
    return (
      det.codigoEmpleado?.toLowerCase().includes(term) ||
      det.nombreEmpleadoSnapshot?.toLowerCase().includes(term) ||
      det.emailDestinatario?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            Volver al Histórico
          </button>
          <div>
            <h2 className="text-xl font-extrabold text-slate-900 mt-1">
              {period.concepto}
            </h2>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Fecha Procesado: <span className="font-bold text-slate-800">{new Date(period.fechaProcesado).toLocaleString('es-DO')}</span>
        </div>
      </div>

      {/* Resumen de Montos */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Devengado</span>
          <h4 className="text-xl font-black text-slate-900 mt-1">
            {formatCurrency(period.montoTotalDevengado)}
          </h4>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Deducciones</span>
          <h4 className="text-xl font-black text-slate-900 mt-1">
            {formatCurrency(period.montoTotalDeducciones)}
          </h4>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-sm bg-emerald-50/20">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Total Neto Pagado</span>
          <h4 className="text-xl font-black text-emerald-700 mt-1">
            {formatCurrency(period.montoTotalNeto)}
          </h4>
        </div>
      </div>

      {/* Tabla de Registros */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrar por código, nombre o correo..."
              value={detailSearchTerm}
              onChange={(e) => setDetailSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap">
            {filteredDetalles?.length || 0} Empleados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 uppercase text-slate-400 font-bold border-b">
              <tr>
                <th className="p-3">Cruce BD</th>
                <th className="p-3">Código</th>
                <th className="p-3">Empleado</th>
                <th className="p-3">Correo Destinatario</th>
                <th className="p-3 text-right">Sueldo Base</th>
                <th className="p-3 text-right">Total Devengado</th>
                <th className="p-3 text-right">Total Deducciones</th>
                <th className="p-3 text-right">Neto a Pagar</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredDetalles?.map((det: any) => {
                const isSending = sendingId === det.id;
                const isSent = sentIds.has(det.id);

                return (
                  <tr key={det.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-full border border-emerald-200 flex items-center gap-1 w-fit">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Registrado
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600">{det.codigoEmpleado}</td>
                    <td className="p-3 font-bold text-slate-900">{det.nombreEmpleadoSnapshot}</td>
                    <td className="p-3 text-slate-500 font-mono">{det.emailDestinatario || 'N/A'}</td>
                    <td className="p-3 text-right font-mono">{formatCurrency(det.sueldoPeriodo)}</td>
                    <td className="p-3 text-right font-mono font-bold text-slate-800">{formatCurrency(det.totalDevengado)}</td>
                    <td className="p-3 text-right font-mono text-slate-600">{formatCurrency(det.totalDeducciones)}</td>
                    <td className="p-3 text-right font-mono font-bold text-emerald-700">{formatCurrency(det.netoPagado)}</td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() =>
                            onSelectPdfItem({
                              codigoEmpleado: det.codigoEmpleado,
                              nombreEmpleado: det.nombreEmpleadoSnapshot,
                              sueldoBase: det.sueldoPeriodo,
                              quincena: period.quincena,
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
                              totalDevengado: det.totalDevengado,
                              totalDeducciones: det.totalDeducciones,
                              netoAPagar: det.netoPagado,
                              emailDestinatario: det.emailDestinatario,
                              empleadoExiste: true,
                            })
                          }
                          className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer border border-emerald-200"
                          title="Ver volante PDF"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          PDF
                        </button>

                        <button
                          onClick={() => handleSendSingleEmail(det)}
                          disabled={isSending || !det.emailDestinatario}
                          className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all flex items-center gap-1 cursor-pointer border shadow-xs disabled:opacity-50 ${
                            isSent
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-emerald-500 hover:bg-emerald-600 text-white border-emerald-600'
                          }`}
                          title="Reenviar comprobante por correo a este empleado"
                        >
                          {isSending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto" />
                          ) : isSent ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                              Enviado
                            </>
                          ) : (
                            <>
                              <Mail className="w-3.5 h-3.5" />
                              Enviar
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};