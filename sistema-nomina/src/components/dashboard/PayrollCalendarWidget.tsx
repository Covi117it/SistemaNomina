import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  ArrowRight
} from 'lucide-react';
import { payrollApi } from '../../service/api/payrollApi';

interface PayrollCalendarWidgetProps {
  onNavigateToPayroll: () => void;
  onEventsLoaded?: (events: {
    day: number;
    time: string;
    title: string;
    description: string;
    badge: string;
    eventType: 'payroll-pending' | 'pdf-dispatch' | 'payroll-completed' | string;
  }[], month?: number) => void;
  onDateDoubleClick?: (dateStr: string) => void;
}

export const PayrollCalendarWidget: React.FC<PayrollCalendarWidgetProps> = ({
  onNavigateToPayroll,
  onEventsLoaded,
  onDateDoubleClick,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState<{
    nextPayrollDay: number;
    nextPayrollMonth: number;
    eventos: {
      day: number;
      time: string;
      title: string;
      description: string;
      badge: string;
      eventType: 'payroll-pending' | 'pdf-dispatch' | 'payroll-completed' | string;
    }[];
  } | null>(null);

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-indexed (0=Enero)

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  useEffect(() => {
    payrollApi.fetchCalendarEvents(currentYear, currentMonth + 1)
      .then((res) => {
        if (res && res.eventos) {
          setCalendarData(res);
          onEventsLoaded?.(res.eventos, currentMonth + 1);
        }
      })
      .catch((err) => {
        console.warn('Error al cargar eventos del calendario:', err);
      });
  }, [currentYear, currentMonth]);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const adjustedFirstDay = (firstDayOfMonth + 6) % 7; 
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-xs space-y-4 select-none">
      {/* Cabecera del Calendario */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors cursor-pointer"
            title="Mes Anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          <h3 className="text-sm font-black text-slate-900 tracking-tight px-1 uppercase">
            {monthNames[currentMonth]} {currentYear}
          </h3>

          <button
            onClick={handleNextMonth}
            className="p-1.5 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors cursor-pointer"
            title="Mes Siguiente"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
          <CalendarIcon className="w-3.5 h-3.5 text-emerald-600" />
          <span>Nómina</span>
        </div>
      </div>

      {/* Cabecera de Días de la Semana */}
      <div className="grid grid-cols-7 text-center text-[11px] font-extrabold uppercase text-slate-400 tracking-wider">
        <span>LU</span>
        <span>MA</span>
        <span>MI</span>
        <span>JU</span>
        <span>VI</span>
        <span>SÁ</span>
        <span>DO</span>
      </div>

      {/* Rejilla de Días del Mes */}
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold">
        {Array.from({ length: adjustedFirstDay }).map((_, idx) => (
          <div key={`empty-${idx}`} className="h-8" />
        ))}

        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const dayNum = idx + 1;

          // ÚNICAMENTE se iluminan los días que contengan al menos un evento agendado
          const hasEvent = calendarData?.eventos?.some((e) => e.day === dayNum);

          const formattedMonth = String(currentMonth + 1).padStart(2, '0');
          const formattedDay = String(dayNum).padStart(2, '0');
          const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;

          return (
            <div
              key={`day-${dayNum}`}
              className="h-8 flex flex-col items-center justify-center relative cursor-pointer group"
              onDoubleClick={() => onDateDoubleClick?.(dateStr)}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                  hasEvent
                    ? 'bg-emerald-600 text-white font-black shadow-md ring-2 ring-emerald-600/30 font-black'
                    : 'text-slate-700 hover:bg-slate-100 font-semibold'
                }`}
                title={hasEvent ? `Día ${dayNum}: Contiene evento agendado (Doble clic para ver)` : `Día ${dayNum} (Doble clic para agendar)`}
              >
                {dayNum}
              </div>
            </div>
          );
        })}
      </div>

      {/* Botón de Acción del Widget */}
      <button
        onClick={onNavigateToPayroll}
        className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-black transition-all duration-200 shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
      >
        <span>Procesar Nómina del Mes</span>
        <ArrowRight className="w-4 h-4 text-emerald-400" />
      </button>
    </div>
  );
};
