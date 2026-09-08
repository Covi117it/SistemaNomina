import React from 'react';
import { Building2, UserPlus, Users, Calculator, History, Mail, Landmark, ChevronRight } from 'lucide-react';

export type ActiveTab = 
  | 'create-employee'
  | 'employee-directory'
  | 'payroll-processing'
  | 'payroll-history'
  | 'distribution-pdf'
  | 'bank-transfers';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuSections = [
    {
      title: '👥 Maestro de Empleados',
      items: [
        { id: 'create-employee' as ActiveTab, label: '➕ Registrar Nuevo Empleado', icon: UserPlus },
        { id: 'employee-directory' as ActiveTab, label: '✏️ Directorio y Edición', icon: Users },
      ],
    },
    {
      title: '💰 Nómina Quincenal e Histórico',
      items: [
        { id: 'payroll-processing' as ActiveTab, label: '📥 Carga y Procesamiento', icon: Calculator },
        { id: 'payroll-history' as ActiveTab, label: '📜 Histórico de Nóminas', icon: History },
      ],
    },
    {
      title: '📜 Volantes y Correos',
      items: [
        { id: 'distribution-pdf' as ActiveTab, label: '✉️ Distribución de PDF (Fase 4)', icon: Mail },
      ],
    },
    {
      title: '🏦 Transferencias Bancarias',
      items: [
        { id: 'bank-transfers' as ActiveTab, label: '💵 Archivo TXT/CSV (Fase 5)', icon: Landmark },
      ],
    },
  ];

  return (
    <aside className="w-72 bg-slate-900 text-slate-300 min-h-screen p-4 flex flex-col border-r border-slate-800 select-none flex-shrink-0">
      <div className="flex items-center gap-3 px-3 py-4 mb-6 border-b border-slate-800">
        <div className="p-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-base font-black text-white tracking-tight leading-none">
            ENFOCO
          </h1>
          <p className="text-[11px] font-semibold text-emerald-400 tracking-wider uppercase mt-1">
            Sistema de Nómina
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            <p className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-2">
              {section.title}
            </p>
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 font-extrabold'
                        : 'hover:bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="pt-4 border-t border-slate-800/80 px-3 text-[10px] text-slate-500 font-medium">
        ENFOCO Payroll Engine v2.0 • SQLite .NET 10
      </div>
    </aside>
  );
};