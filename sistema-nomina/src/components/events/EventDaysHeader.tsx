import React from 'react';

export interface DayHeaderItem {
  dayName: 'LU' | 'MA' | 'MI' | 'JU' | 'VI' | 'SÁ' | 'DO';
  dayOfWeek: 'LU' | 'MA' | 'MI' | 'JU' | 'VI' | 'SÁ' | 'DO';
  dateStr: string; // "11/08"
  fullDate: string; // "2026-08-11"
  isToday?: boolean;
  isSelected?: boolean;
  isWeekend?: boolean;
}

interface EventDaysHeaderProps {
  days: DayHeaderItem[];
  selectedDate?: string;
  onSelectDay?: (dateStr: string) => void;
}

export const EventDaysHeader: React.FC<EventDaysHeaderProps> = ({
  days,
  selectedDate,
  onSelectDay,
}) => {
  // Obtener únicamente el día seleccionado
  const activeDay = days.find((d) => d.fullDate === selectedDate || d.isSelected) || days[0];

  return (
    <div className="flex items-center gap-4 select-none border-b border-slate-200/60 pb-3">
      {/* Espacio alineado con la columna de horas */}
      <div className="w-[80px] text-right pr-3 text-slate-400 font-extrabold text-xs">
        <span className="text-[11px] uppercase tracking-wider">HRS</span>
      </div>

      {/* Única pastilla del día seleccionado */}
      {activeDay && (
        <div
          onClick={() => onSelectDay?.(activeDay.fullDate)}
          className="flex items-center gap-2.5 py-2 px-5 rounded-2xl bg-slate-900 text-white shadow-md font-black cursor-pointer"
        >
          <span className="text-xs uppercase tracking-wider opacity-80">
            {activeDay.dayName}
          </span>
          <span className="text-base tracking-tight font-black">
            {activeDay.dateStr}
          </span>
        </div>
      )}
    </div>
  );
};
