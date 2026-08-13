import React from 'react';
import { CalendarEventItem } from './types';
import { EventCard } from './EventCard';

interface EventTimeGridProps {
  days: { fullDate: string; dayOfWeek: 'LU' | 'MA' | 'MI' | 'JU' | 'VI' | 'SÁ' | 'DO'; dateStr?: string }[];
  events: CalendarEventItem[];
  selectedDate?: string;
  onEventClick?: (event: CalendarEventItem) => void;
  onEventActionClick?: (event: CalendarEventItem) => void;
  onEventEdit?: (event: CalendarEventItem) => void;
  onEventDelete?: (event: CalendarEventItem) => void;
}

export const EventTimeGrid: React.FC<EventTimeGridProps> = ({
  days,
  events,
  selectedDate,
  onEventClick,
  onEventActionClick,
  onEventEdit,
  onEventDelete,
}) => {
  // Ranuras horarias de la tabla lateral
  const timeSlots = [
    '07:00', '07:30', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'
  ];

  // Obtener únicamente el día seleccionado
  const activeDay = days.find((d) => d.fullDate === selectedDate) || days[0];
  const activeDayNum = activeDay ? parseInt(activeDay.fullDate.split('-')[2] || '15', 10) : 15;

  const dayEvents = events.filter((e) => {
    if (e.dateStr && activeDay?.fullDate) {
      return e.dateStr === activeDay.fullDate;
    }
    return e.dayNumber === activeDayNum;
  });

  // Normalizar cadena de hora a formato "HH:mm"
  const normalizeTime = (timeStr?: string) => {
    if (!timeStr) return '08:00';
    const trimmed = timeStr.trim();
    if (trimmed.length === 5 && trimmed.includes(':')) return trimmed;
    if (trimmed.length === 4 && trimmed.includes(':')) return `0${trimmed}`;
    return trimmed.substring(0, 5);
  };

  // Obtener eventos correspondientes a cada ranura horaria
  const getSlotEvents = (slotTime: string) => {
    return dayEvents.filter((e) => {
      const startNorm = normalizeTime(e.startTime);
      return startNorm === slotTime;
    });
  };

  // Eventos que no coinciden exactamente con ningún slot estándar
  const matchedEventIds = new Set(
    timeSlots.flatMap((slot) => getSlotEvents(slot).map((e) => e.id))
  );
  const unallocatedEvents = dayEvents.filter((e) => !matchedEventIds.has(e.id));

  // Filtrar los slots a mostrar: mostrar todos los slots entre las 07:00 y las 11:00, y slots posteriores si tienen eventos
  const displaySlots = timeSlots.filter((slot) => {
    const slotHour = parseInt(slot.split(':')[0], 10);
    const hasEvents = getSlotEvents(slot).length > 0;
    return slotHour <= 11 || hasEvents;
  });

  return (
    <div className="relative overflow-x-auto select-none pt-2">
      {dayEvents.length === 0 ? (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center p-8 space-y-2 rounded-2xl bg-slate-50/50 border border-slate-200/60">
          <span className="text-xs font-bold text-slate-500">
            No hay eventos programados para este día ({activeDay?.dateStr || activeDay?.dayOfWeek})
          </span>
          <span className="text-[11px] text-slate-400 font-medium">
            Haz clic en el botón "+ Crear Evento" para añadir un compromiso en la agenda.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-[80px_1fr] gap-4 min-w-[700px]">
          {/* Columna Lateral de Horas (07:00 - 11:00+) */}
          <div className="space-y-4 pt-2 text-right pr-3 border-r border-slate-200/60">
            {displaySlots.map((slotTime) => (
              <div 
                key={slotTime} 
                className="h-[84px] text-[11px] font-extrabold text-slate-400 flex items-start justify-end pt-2 select-none"
              >
                {slotTime}
              </div>
            ))}
          </div>

          {/* Contenedor Único del Día Seleccionado (Estilo Original) */}
          <div className="space-y-4 min-h-[500px] p-4 rounded-2xl bg-slate-50/50 border border-slate-200/60">
            {displaySlots.map((slotTime) => {
              let slotEvents = getSlotEvents(slotTime);

              // Si es el primer slot (07:00), incluir cualquier evento no asignado
              if (slotTime === '07:00' && unallocatedEvents.length > 0) {
                slotEvents = [...slotEvents, ...unallocatedEvents];
              }

              return (
                <div key={slotTime} className="min-h-[84px] flex items-start">
                  {slotEvents.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                      {slotEvents.map((evt) => (
                        <EventCard
                          key={evt.id}
                          event={evt}
                          onClick={onEventClick}
                          onActionClick={onEventActionClick}
                          onEdit={onEventEdit}
                          onDelete={onEventDelete}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
