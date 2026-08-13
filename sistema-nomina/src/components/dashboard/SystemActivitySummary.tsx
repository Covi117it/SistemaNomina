import React from 'react';
import { UserPlus, FileUp, History, Mail, Database, Zap, CheckCircle2 } from 'lucide-react';

interface SystemActivitySummaryProps {
  onNavigateToCreate: () => void;
  onNavigateToPayroll: () => void;
  onNavigateToHistory: () => void;
  onNavigateToDistribution: () => void;
}

export const SystemActivitySummary: React.FC<SystemActivitySummaryProps> = ({
  onNavigateToCreate,
  onNavigateToPayroll,
  onNavigateToHistory,
  onNavigateToDistribution,
}) => {
  const quickActions = [
    {
      label: 'Registrar Empleado',
      description: 'Dar de alta un nuevo trabajador con código automático',
      icon: UserPlus,
      color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200/80',
      onClick: onNavigateToCreate,
    },
    {
      label: 'Cargar Archivo Excel',
      description: 'Importar nómina quincenal para cálculo automático',
      icon: FileUp,
      color: 'bg-slate-50 text-slate-800 hover:bg-slate-100 border-slate-200/80',
      onClick: onNavigateToPayroll,
    },
    {
      label: 'Enviar Volantes PDF',
      description: 'Despachar recibos de pago por correo electrónico',
      icon: Mail,
      color: 'bg-slate-50 text-slate-800 hover:bg-slate-100 border-slate-200/80',
      onClick: onNavigateToDistribution,
    },
    {
      label: 'Consultar Histórico',
      description: 'Revisar pagos anteriores y reportes archivados',
      icon: History,
      color: 'bg-slate-50 text-slate-800 hover:bg-slate-100 border-slate-200/80',
      onClick: onNavigateToHistory,
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Quick Actions Panel */}
      <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
              Accesos Rápidos Directos
            </h2>
          </div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Flujo Frecuente
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={action.onClick}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex items-start gap-3.5 group cursor-pointer ${action.color}`}
              >
                <div className="p-2.5 rounded-xl bg-white shadow-2xs group-hover:scale-105 transition-transform shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold tracking-tight">
                    {action.label}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5 leading-snug">
                    {action.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* System Health Card */}
      <div className="bg-slate-900 text-slate-300 border border-slate-800 rounded-[28px] p-6 shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-extrabold text-white tracking-tight">
              Estado de Servicios
            </h2>
          </div>

          <div className="space-y-3 pt-2 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 border border-slate-800">
              <span className="font-semibold text-slate-300">Base de Datos</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Conectado
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 border border-slate-800">
              <span className="font-semibold text-slate-300">API Web / Backend</span>
              <span className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> .NET 10 Listo
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/70 border border-slate-800">
              <span className="font-semibold text-slate-300">Motor de Correos (SMTP)</span>
              <span className="text-slate-400 font-bold text-[11px]">
                Configurable
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 text-[10px] text-slate-500 font-mono border-t border-slate-800">
          ENFOCO Payroll Engine • Build 2026.08
        </div>
      </div>
    </div>
  );
};
