import React, { useState, useEffect } from 'react';
import { Menu, X, Lightbulb, ChevronRight } from 'lucide-react';
import { NAVIGATION_SECTIONS } from '../../constants/navigationOptions';

export type ActiveView = 
  | 'main-directory' 
  | 'create-employee' 
  | 'edit-employee' 
  | 'payroll-processing' 
  | 'payroll-history' 
  | 'distribution-pdf';

interface ActionsDropdownProps {
  currentView?: ActiveView;
  onNavigateToCreate?: () => void;
  onNavigateToPayroll?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToDistribution?: () => void;
  onNavigateToDirectory?: () => void;
}

export const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  currentView,
  onNavigateToCreate,
  onNavigateToPayroll,
  onNavigateToHistory,
  onNavigateToDistribution,
  onNavigateToDirectory,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const callbacksMap: Record<string, (() => void) | undefined> = {
    directory: onNavigateToDirectory,
    create: onNavigateToCreate,
    payroll: onNavigateToPayroll,
    history: onNavigateToHistory,
    distribution: onNavigateToDistribution,
  };

  const isVisibleMap: Record<string, boolean> = {
    directory: currentView !== 'main-directory' && Boolean(onNavigateToDirectory),
    create: currentView !== 'create-employee' && currentView !== 'edit-employee' && Boolean(onNavigateToCreate),
    payroll: currentView !== 'payroll-processing' && Boolean(onNavigateToPayroll),
    history: currentView !== 'payroll-history' && Boolean(onNavigateToHistory),
    distribution: currentView !== 'distribution-pdf' && Boolean(onNavigateToDistribution),
  };

  const handleAction = (callback?: () => void) => {
    setIsOpen(false);
    if (callback) callback();
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2.5 bg-white hover:bg-emerald-50/80 text-slate-700 hover:text-emerald-700 rounded-xl shadow-sm border border-slate-200/80 hover:border-emerald-300 transition-all flex items-center justify-center cursor-pointer active:scale-95 group"
        title="Abrir Menú de Navegación"
        aria-label="Abrir Menú de Navegación"
      >
        <Menu className="w-5 h-5 text-emerald-600 group-hover:text-emerald-700 transition-colors" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex select-none">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setIsOpen(false)}
          />

          <div className="relative w-80 max-w-[85vw] bg-white text-slate-800 min-h-screen p-5 flex flex-col border-r border-slate-200/80 shadow-2xl z-50 animate-in slide-in-from-left duration-300">
            <div className="flex items-center justify-between pb-5 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-50 text-emerald-600 border border-emerald-200/80 rounded-xl shadow-xs">
                  <Lightbulb className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-slate-900 tracking-tight leading-none">
                    ENFOCO
                  </h2>
                  <p className="text-[11px] font-bold text-emerald-600 tracking-wider uppercase mt-1">
                    Sistema de Nómina
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Cerrar Menú"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto pr-1">
              {NAVIGATION_SECTIONS.map((section) => {
                const visibleItems = section.items.filter((item) => isVisibleMap[item.id]);
                if (visibleItems.length === 0) return null;

                return (
                  <div key={section.title}>
                    <p className="px-3 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                      {section.title}
                    </p>
                    <div className="space-y-1">
                      {visibleItems.map((item) => {
                        const Icon = item.icon;
                        const cb = callbacksMap[item.id];
                        return (
                          <button
                            key={item.id}
                            onClick={() => handleAction(cb)}
                            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 ${item.hoverBg} ${item.hoverText} transition-all cursor-pointer group`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 ${item.iconBg} ${item.iconColor} ${item.hoverIconBg} ${item.hoverIconColor} rounded-xl transition-colors`}>
                                <Icon className="w-4 h-4" />
                              </div>
                              <span>{item.label}</span>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-transform group-hover:translate-x-0.5" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      )}
    </>
  );
};