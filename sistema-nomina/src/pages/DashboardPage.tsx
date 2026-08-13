import React, { useState, useEffect } from 'react';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { ModuleNavigationGrid } from '../components/dashboard/ModuleNavigationGrid';
import { SystemStatisticsPanel } from '../components/dashboard/SystemStatisticsPanel';
import { PayrollCalendarWidget } from '../components/dashboard/PayrollCalendarWidget';
import { MonthEventsWidget, PayrollEvent } from '../components/dashboard/MonthEventsWidget';
import { payrollApi } from '../service/api/payrollApi';

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
}) => {
  const [monthEvents, setMonthEvents] = useState<PayrollEvent[]>([]);

  // Cargar dinámicamente los eventos del MES ACTUAL desde MariaDB y backend
  useEffect(() => {
    const today = new Date();
    payrollApi.fetchCalendarEvents(today.getFullYear(), today.getMonth() + 1)
      .then((res) => {
        if (res && res.eventos) {
          const mapped = res.eventos.map((e: any) => ({
            id: e.id,
            day: e.day,
            time: e.time,
            startTime: e.startTime,
            title: e.title,
            subtitle: e.subtitle,
            description: e.description,
            badge: e.badge,
            eventType: e.eventType,
            dateStr: e.dateStr,
          }));
          setMonthEvents(mapped);
        }
      })
      .catch((err) => console.warn('Error al cargar eventos del mes en Dashboard:', err));
  }, []);

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
            onDateDoubleClick={(dateStr) => onNavigateToCreateEvent?.(dateStr)}
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
