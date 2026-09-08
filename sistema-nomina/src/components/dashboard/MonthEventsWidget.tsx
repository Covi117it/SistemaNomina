import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar as CalendarIcon, 
  Calculator, 
  Mail, 
  CheckCircle2, 
  Clock,
  ArrowRight,
  Plus
} from 'lucide-react';

export interface PayrollEvent {
  id?: string;
  day: number;
  time: string;
  startTime?: string;
  title: string;
  subtitle?: string;
  description?: string;
  badge?: string;
  eventType: 'payroll-pending' | 'pdf-dispatch' | 'payroll-completed' | 'general-reminder' | string;
  priority?: string;
  dateStr?: string;
}

interface MonthEventsWidgetProps {
  events: PayrollEvent[];
  onNavigateToPayroll: () => void;
  onNavigateToDistribution: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToCreateEvent?: (dateStr?: string) => void;
  onNavigateToMonthAgenda?: () => void;
}

export const MonthEventsWidget: React.FC<MonthEventsWidgetProps> = ({
  events = [],
  onNavigateToPayroll,
  onNavigateToDistribution,
  onNavigateToHistory,
  onNavigateToCreateEvent,
  onNavigateToMonthAgenda,
}) => {
  const [isEventsExpanded, setIsEventsExpanded] = useState(true);

  // Ordenar cronológicamente: primero los más próximos por día y luego por hora
  const sortedEvents = [...events].sort((a, b) => {
    if (a.day !== b.day) {
      return a.day - b.day;
    }
    const timeA = a.startTime || a.time || '00:00';
    const timeB = b.startTime || b.time || '00:00';
    return timeA.localeCompare(timeB);
  });

  const renderIcon = (type: string) => {
    switch (type) {
      case 'payroll-pending':
        return <Calculator className="w-4 h-4 text-emerald-600" />;
      case 'pdf-dispatch':
        return <Mail className="w-4 h-4 text-sky-600" />;
      case 'payroll-completed':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      default:
        return <Clock className="w-4 h-4 text-slate-500" />;
    }
  };

  const renderBadgeStyle = (evt: PayrollEvent) => {
    if (evt.eventType === 'payroll-completed') {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
    if (evt.eventType === 'payroll-pending') {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    if (evt.eventType === 'pdf-dispatch') {
      return 'bg-sky-100 text-sky-800 border-sky-200';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  const handleCardClick = (evt: PayrollEvent) => {
    switch (evt.eventType) {
      case 'payroll-pending':
        onNavigateToPayroll();
        break;
      case 'pdf-dispatch':
        onNavigateToDistribution();
        break;
      case 'payroll-completed':
        if (onNavigateToHistory) onNavigateToHistory();
        else onNavigateToPayroll();
        break;
      default:
        if (onNavigateToCreateEvent) {
          onNavigateToCreateEvent(evt.dateStr || undefined);
        }
        break;
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-xs space-y-4 transition-all duration-300 select-none">
      {/* Cabecera del Desplegable */}
      <div 
        onClick={() => setIsEventsExpanded(!isEventsExpanded)}
        className="flex items-center justify-between cursor-pointer select-none"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
            <CalendarIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              Eventos y Recordatorios del Mes
            </h3>
            <p className="text-xs font-semibold text-slate-400">
              {events.length} {events.length === 1 ? 'compromiso ordenado' : 'compromisos ordenados'} cronológicamente
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (onNavigateToMonthAgenda) {
                onNavigateToMonthAgenda();
              } else if (onNavigateToCreateEvent) {
                onNavigateToCreateEvent();
              }
            }}
            className="py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-full text-xs font-black transition-colors flex items-center gap-1.5 border border-emerald-200/60 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Abrir Agenda</span>
          </button>

          <button 
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            {isEventsExpanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Contenido Desplegable */}
      {isEventsExpanded && (
        <div className="pt-2 border-t border-slate-100 animate-in fade-in duration-200">
          {sortedEvents.length === 0 ? (
            <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 my-2 space-y-1">
              <p className="text-xs font-bold text-slate-500">
                No hay eventos ni recordatorios registrados para este mes.
              </p>
              <p className="text-[11px] text-slate-400 font-medium">
                Puedes hacer doble clic en cualquier día del calendario o presionar "Abrir Agenda" para consultar compromisos.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {sortedEvents.map((evt, idx) => (
                <div
                  key={evt.id || `event-${idx}`}
                  onClick={() => handleCardClick(evt)}
                  className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 hover:bg-white hover:border-emerald-500/40 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between space-y-3"
                >
                  {/* Fila Superior: Día, Hora e Insignia */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                        {evt.day}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                        {renderIcon(evt.eventType)}
                        <span>{evt.time}</span>
                      </div>
                    </div>

                    {evt.badge && (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border tracking-wider ${renderBadgeStyle(evt)}`}>
                        {evt.badge}
                      </span>
                    )}
                  </div>

                  {/* Fila Central: Título y Descripción */}
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {evt.title}
                    </h4>
                    {evt.description && (
                      <p className="text-[11px] font-medium text-slate-500 line-clamp-2 mt-0.5">
                        {evt.description}
                      </p>
                    )}
                  </div>

                  {/* Fila Inferior: Botón de Acción Si Aplica */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400 font-bold">
                      {evt.eventType === 'payroll-pending' ? 'Acción requerida' : 'Compromiso agendado'}
                    </span>
                    <div className="flex items-center gap-1 text-emerald-600 font-extrabold group-hover:translate-x-0.5 transition-transform">
                      <span>{evt.eventType === 'payroll-pending' ? 'Procesar' : evt.eventType === 'pdf-dispatch' ? 'Despachar' : 'Ver detalle'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
