import React from 'react';
import { 
  ArrowLeft, 
  Calendar as CalendarIcon, 
  Clock, 
  Calculator, 
  Mail, 
  Edit, 
  Trash2
} from 'lucide-react';
import { ActionsDropdown } from '../components/common/ActionsDropdown';
import { CreateEventModal } from '../components/events/CreateEventModal';
import { CalendarEventItem } from '../components/events/types';
import { useCalendarEvents } from '../hooks/useCalendarEvents';

interface MonthAgendaPageProps {
  onBack: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToDirectory?: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToPayroll?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToDistribution?: () => void;
}

export const MonthAgendaPage: React.FC<MonthAgendaPageProps> = ({
  onBack,
  onNavigateToDashboard,
  onNavigateToDirectory,
  onNavigateToCreate,
  onNavigateToPayroll,
  onNavigateToHistory,
  onNavigateToDistribution,
}) => {
  const {
    events,
    monthName,
    isModalOpen,
    setIsModalOpen,
    editingEvent,
    setEditingEvent,
    handleSaveEvent,
    handleDeleteEvent,
  } = useCalendarEvents();

  // Ordenar todos los eventos del mes cronológicamente por día y por hora
  const sortedMonthEvents = [...events].sort((a, b) => {
    if (a.dayNumber !== b.dayNumber) {
      return a.dayNumber - b.dayNumber;
    }
    const timeA = a.startTime || '00:00';
    const timeB = b.startTime || '00:00';
    return timeA.localeCompare(timeB);
  });

  // Agrupar eventos por día
  const groupedEventsByDay = sortedMonthEvents.reduce((acc, evt) => {
    const dayKey = evt.dayNumber;
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(evt);
    return acc;
  }, {} as Record<number, CalendarEventItem[]>);

  return (
    <div className="space-y-6 select-none max-w-[1400px] mx-auto pb-12">
      {/* Top Bar: Acciones y Botón Volver */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onNavigateToCreate && (
            <ActionsDropdown
              currentView="create-event"
              onNavigateToDashboard={onNavigateToDashboard}
              onNavigateToDirectory={onNavigateToDirectory}
              onNavigateToCreate={onNavigateToCreate}
              onNavigateToPayroll={onNavigateToPayroll}
              onNavigateToHistory={onNavigateToHistory}
              onNavigateToDistribution={onNavigateToDistribution}
            />
          )}
          <button
            onClick={onBack}
            className="px-3.5 py-2 bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Volver al Dashboard</span>
          </button>
        </div>
      </div>

      {/* Contenedor Principal de la Agenda Mensual */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 md:p-8 shadow-xs space-y-6">
        
        {/* Cabecera */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shadow-2xs">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Agenda de Eventos del Mes - {monthName} 2026
              </h2>
              <p className="text-xs font-semibold text-slate-400 mt-0.5">
                Visualización general de todos los compromisos y tareas agendadas para este mes
              </p>
            </div>
          </div>
        </div>

        {/* LISTA DE EVENTOS DEL MES ACTUAL */}
        <div className="space-y-6">
          {Object.keys(groupedEventsByDay).length === 0 ? (
            <div className="min-h-[350px] flex flex-col items-center justify-center text-center p-8 space-y-3 rounded-2xl bg-slate-50/50 border border-slate-200/60">
              <CalendarIcon className="w-10 h-10 text-slate-300" />
              <span className="text-sm font-black text-slate-700">
                No hay eventos registrados para este mes
              </span>
            </div>
          ) : (
            Object.keys(groupedEventsByDay)
              .map(Number)
              .sort((a, b) => a - b)
              .map((dayNum) => {
                const dayEvts = groupedEventsByDay[dayNum];
                return (
                  <div key={`day-group-${dayNum}`} className="space-y-3">
                    {/* Subcabecera de Día */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-xs flex items-center justify-center shadow-xs">
                        {dayNum}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                          Día {dayNum} de {monthName}
                        </h4>
                        <p className="text-[11px] font-semibold text-slate-400">
                          {dayEvts.length} {dayEvts.length === 1 ? 'compromiso programado' : 'compromisos programados'}
                        </p>
                      </div>
                      <div className="flex-1 h-px bg-slate-100 ml-2" />
                    </div>

                    {/* Tarjetas de Eventos del Día */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {dayEvts.map((evt) => {
                        const isAuto1 = evt.eventType === 'payroll-pending';
                        const isAuto2 = evt.eventType === 'pdf-dispatch';
                        const isCompleted = evt.eventType === 'payroll-completed';

                        return (
                          <div
                            key={evt.id}
                            className={`border rounded-2xl p-5 shadow-2xs space-y-3 transition-all hover:shadow-md ${
                              isCompleted
                                ? 'bg-emerald-50/40 border-emerald-200/80'
                                : isAuto1
                                  ? 'bg-amber-50/30 border-amber-200/80'
                                  : isAuto2
                                    ? 'bg-sky-50/30 border-sky-200/80'
                                    : 'bg-white border-slate-200/80'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-600">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                <span>{evt.startTime || '08:00'} AM</span>
                              </div>

                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                    : isAuto1
                                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                      : isAuto2
                                        ? 'bg-sky-100 text-sky-800 border border-sky-200'
                                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                                }`}
                              >
                                {evt.priority || 'ALTA'}
                              </span>
                            </div>

                            <div className="space-y-1">
                              <h5 className="text-sm font-black text-slate-900 leading-snug">
                                {evt.title}
                              </h5>
                              {evt.subtitle && (
                                <p className="text-xs font-bold text-slate-500">
                                  {evt.subtitle}
                                </p>
                              )}
                              {evt.description && (
                                <p className="text-xs font-medium text-slate-500 line-clamp-2 pt-1">
                                  {evt.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                              {isAuto1 && onNavigateToPayroll && (
                                <button
                                  onClick={onNavigateToPayroll}
                                  className="py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                  <Calculator className="w-3.5 h-3.5" />
                                  <span>Procesar Nómina</span>
                                </button>
                              )}

                              {isAuto2 && onNavigateToDistribution && (
                                <button
                                  onClick={onNavigateToDistribution}
                                  className="py-1.5 px-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                                >
                                  <Mail className="w-3.5 h-3.5" />
                                  <span>Despachar Volantes</span>
                                </button>
                              )}

                              {!isAuto1 && !isAuto2 && !isCompleted && (
                                <div className="flex items-center gap-1.5 ml-auto">
                                  <button
                                    onClick={() => {
                                      setEditingEvent(evt);
                                      setIsModalOpen(true);
                                    }}
                                    className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-emerald-700 border border-slate-200/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                                    title="Editar"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                    <span>Editar</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteEvent(evt)}
                                    className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                                    title="Eliminar"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Eliminar</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>

      <CreateEventModal
        isOpen={isModalOpen}
        editingEvent={editingEvent}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEvent}
      />
    </div>
  );
};
