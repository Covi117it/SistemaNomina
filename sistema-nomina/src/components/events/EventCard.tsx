import React from 'react';
import { 
  Calculator, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Pencil,
  Trash2
} from 'lucide-react';
import { CalendarEventItem } from './types';

interface EventCardProps {
  event: CalendarEventItem;
  onClick?: (event: CalendarEventItem) => void;
  onActionClick?: (event: CalendarEventItem) => void;
  onEdit?: (event: CalendarEventItem) => void;
  onDelete?: (event: CalendarEventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  onClick,
  onActionClick,
  onEdit,
  onDelete,
}) => {
  // Determinar si es un evento automático del sistema (los eventos de nómina son inmutables)
  const isAutomaticEvent = 
    event.eventType === 'payroll-pending' ||
    event.eventType === 'pdf-dispatch' ||
    event.eventType === 'payroll-completed' ||
    event.id.startsWith('auto-') ||
    event.id.startsWith('hist-');

  const isUserEvent = !isAutomaticEvent;

  const getCardStyle = () => {
    switch (event.eventType) {
      case 'payroll-pending':
        return 'bg-emerald-50/90 border-emerald-200/80 text-emerald-950 hover:border-emerald-400';
      case 'pdf-dispatch':
        return 'bg-sky-50/90 border-sky-200/80 text-sky-950 hover:border-sky-400';
      case 'payroll-completed':
        return 'bg-slate-100/90 border-slate-200/80 text-slate-900 hover:border-slate-300';
      case 'general-reminder':
        return 'bg-amber-50/90 border-amber-200/80 text-amber-950 hover:border-amber-400';
      default:
        return 'bg-white border-slate-200/80 text-slate-900 hover:border-emerald-300';
    }
  };

  const getBadgeStyle = () => {
    switch (event.eventType) {
      case 'payroll-pending':
        return 'bg-emerald-100/80 text-emerald-800 border-emerald-200';
      case 'pdf-dispatch':
        return 'bg-sky-100/80 text-sky-800 border-sky-200';
      case 'payroll-completed':
        return 'bg-slate-200/80 text-slate-800 border-slate-300';
      case 'general-reminder':
        return 'bg-amber-100/80 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const renderIcon = () => {
    switch (event.eventType) {
      case 'payroll-pending':
        return <Calculator className="w-4 h-4 text-emerald-600" />;
      case 'pdf-dispatch':
        return <Mail className="w-4 h-4 text-sky-600" />;
      case 'payroll-completed':
        return <CheckCircle2 className="w-4 h-4 text-slate-700" />;
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <div
      onClick={() => onClick?.(event)}
      className={`p-4 rounded-2xl border shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3 group relative ${getCardStyle()}`}
    >
      {/* Top Header: Icon & Direct Action Buttons for User Events */}
      <div className="flex items-center justify-between">
        <div className={`p-2 rounded-xl border bg-white shadow-2xs ${getBadgeStyle()}`}>
          {renderIcon()}
        </div>

        {/* Botones Directos de Editar y Borrar para Eventos del Usuario */}
        {isUserEvent && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(event);
              }}
              className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-500 hover:text-emerald-700 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
              title="Editar Evento"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(event);
              }}
              className="p-1.5 rounded-xl bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
              title="Eliminar Evento"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Main Info */}
      <div className="space-y-1">
        <h4 className="text-xs font-black tracking-tight group-hover:text-emerald-700 transition-colors line-clamp-1">
          {event.title}
        </h4>

        {event.description && (
          <p className="text-[11px] font-semibold text-slate-500 line-clamp-2 pt-0.5">
            {event.description}
          </p>
        )}

        <div className="pt-1 flex items-center gap-1.5 text-[10px] font-bold text-slate-400">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>{event.startTime}</span>
        </div>
      </div>

      {/* Action Button (solamente si existe actionText y NO es 'Ver') */}
      {event.actionText && event.actionText !== 'Ver' && (
        <div className="pt-2 border-t border-black/5 flex items-center justify-end">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onActionClick?.(event);
            }}
            className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[10px] font-extrabold transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            {event.actionText}
          </button>
        </div>
      )}
    </div>
  );
};
