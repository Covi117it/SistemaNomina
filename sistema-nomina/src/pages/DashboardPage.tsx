import React, { useState } from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { ModuleNavigationGrid } from '../components/dashboard/ModuleNavigationGrid';
import { SystemStatisticsPanel } from '../components/dashboard/SystemStatisticsPanel';
import { PayrollCalendarWidget } from '../components/dashboard/PayrollCalendarWidget';
import { MonthEventsWidget, PayrollEvent } from '../components/dashboard/MonthEventsWidget';
import { useAuthorization } from '../hooks/useAuthorization';

interface DashboardPageProps {
  totalTotal: number;
  totalActivos: number;
  totalInactivos: number;
  loadingEmployees?: boolean;
  onNavigateToDirectory: () => void;
  onNavigateToCreate: () => void;
  onNavigateToPayroll: () => void;
  onNavigateToHistory: () => void;
  onNavigateToDistribution: () => void;
  onNavigateToCreateEvent?: (dateStr?: string) => void;
  onNavigateToMonthAgenda?: () => void;
  onNavigateToUsers?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  totalTotal,
  totalActivos,
  totalInactivos,
  loadingEmployees = false,
  onNavigateToDirectory,
  onNavigateToCreate,
  onNavigateToPayroll,
  onNavigateToHistory,
  onNavigateToDistribution,
  onNavigateToCreateEvent,
  onNavigateToMonthAgenda,
  onNavigateToUsers,
}) => {
  const [monthEvents, setMonthEvents] = useState<PayrollEvent[]>([]);
  const { canManageEvents } = useAuthorization();

  // Los eventos se cargan a través del widget de calendario para evitar peticiones duplicadas
  const handleEventsLoaded = (loadedEvents: PayrollEvent[], loadedMonth?: number) => {
    const currentMonth = new Date().getMonth() + 1;
    if (loadedEvents && (!loadedMonth || loadedMonth === currentMonth)) {
      setMonthEvents(loadedEvents);
    }
  };

  return (
    <div className="space-y-8 select-none max-w-[1400px] mx-auto pb-12">
      {/* 1. Encabezado y Logotipo */}
      <DashboardHeader />

      {/* 2. Layout Principal de 2 Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA (Módulos de Navegación) */}
        <div className="lg:col-span-7">
          <ModuleNavigationGrid
            totalTotal={totalTotal}
            onNavigateToDirectory={onNavigateToDirectory}
            onNavigateToCreate={onNavigateToCreate}
            onNavigateToPayroll={onNavigateToPayroll}
            onNavigateToHistory={onNavigateToHistory}
            onNavigateToDistribution={onNavigateToDistribution}
            onNavigateToUsers={onNavigateToUsers}
          />
        </div>

        {/* COLUMNA DERECHA: Información del Sistema + Calendario APILADOS VERTICALMENTE */}
        <div className="lg:col-span-5 space-y-6">
          {/* Información del Sistema (Ubicado ARRIBA del Calendario en forma vertical) */}
          <SystemStatisticsPanel
            totalTotal={totalTotal}
            totalActivos={totalActivos}
            totalInactivos={totalInactivos}
            loadingEmployees={loadingEmployees}
          />

          {/* Mini Calendario Interactivo de Pagos (Ubicado DEBAJO de Información del Sistema) */}
          <PayrollCalendarWidget
            onNavigateToPayroll={onNavigateToPayroll}
            onEventsLoaded={handleEventsLoaded}
            onDateDoubleClick={canManageEvents ? ((dateStr) => onNavigateToCreateEvent?.(dateStr)) : undefined}
          />
        </div>

      </div>

      {/* 3. Eventos del Mes Actual */}
      <MonthEventsWidget
        events={monthEvents}
        onNavigateToPayroll={onNavigateToPayroll}
        onNavigateToDistribution={onNavigateToDistribution}
        onNavigateToHistory={onNavigateToHistory}
        onNavigateToCreateEvent={onNavigateToCreateEvent}
        onNavigateToMonthAgenda={onNavigateToMonthAgenda}
      />
    </div>
  );
};
