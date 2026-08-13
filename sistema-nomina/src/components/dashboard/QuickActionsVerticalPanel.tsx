import React from 'react';
import { UserPlus, FileUp, History, Mail, ChevronRight } from 'lucide-react';

interface QuickActionsVerticalPanelProps {
  onNavigateToCreate: () => void;
  onNavigateToPayroll: () => void;
  onNavigateToHistory: () => void;
  onNavigateToDistribution: () => void;
}

export const QuickActionsVerticalPanel: React.FC<QuickActionsVerticalPanelProps> = ({
  onNavigateToCreate,
  onNavigateToPayroll,
  onNavigateToHistory,
  onNavigateToDistribution,
}) => {
  const quickActionsList = [
    {
      title: 'Registrar Nuevo Empleado',
      category: 'Maestro de Personal',
      icon: UserPlus,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      actionLabel: 'Registrar',
      onClick: onNavigateToCreate,
    },
    {
      title: 'Cargar Archivo Excel de Nómina',
      category: 'Procesamiento',
      icon: FileUp,
      iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      actionLabel: 'Cargar Excel',
      onClick: onNavigateToPayroll,
    },
    {
      title: 'Consultar Histórico de Quincenas',
      category: 'Histórico',
      icon: History,
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
      actionLabel: 'Ver Histórico',
      onClick: onNavigateToHistory,
    },
    {
      title: 'Despachar Volantes PDF por Correo',
      category: 'Distribución',
      icon: Mail,
      iconBg: 'bg-slate-100 text-slate-700 border-slate-200',
      actionLabel: 'Enviar Volantes',
      onClick: onNavigateToDistribution,
    },
  ];

  return (
    <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-xs space-y-4">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
          Acciones Frecuentes
        </h2>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Flujo Directo
        </span>
      </div>

      <div className="space-y-2">
        {quickActionsList.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={item.onClick}
              className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 border border-slate-100 hover:border-slate-200/80 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className={`p-2.5 rounded-xl border ${item.iconBg} group-hover:scale-105 transition-transform shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate group-hover:text-emerald-700 transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">
                    {item.category}
                  </p>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  item.onClick();
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-slate-100 text-slate-700 hover:bg-emerald-600 hover:text-white transition-colors cursor-pointer shrink-0"
              >
                <span>{item.actionLabel}</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
