import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { ActionsDropdown } from '../components/common/ActionsDropdown';
import { EventHeader } from '../components/events/EventHeader';
import { EventDaysHeader } from '../components/events/EventDaysHeader';
import { EventTimeGrid } from '../components/events/EventTimeGrid';
import { CreateEventModal } from '../components/events/CreateEventModal';
import { useCalendarEvents, generateWeekDaysForDate } from '../hooks/useCalendarEvents';

interface CreateEventPageProps {
  selectedDate?: string;
  onBack: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToDirectory?: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToPayroll?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToDistribution?: () => void;
}

export const CreateEventPage: React.FC<CreateEventPageProps> = ({
  selectedDate,
  onBack,
  onNavigateToDashboard,
  onNavigateToDirectory,
  onNavigateToCreate,
  onNavigateToPayroll,
  onNavigateToHistory,
  onNavigateToDistribution,
}) => {
  const defaultTodayDate = () => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  };

  const [activeDate, setActiveDate] = useState(selectedDate || defaultTodayDate());

  useEffect(() => {
    if (selectedDate) setActiveDate(selectedDate);
  }, [selectedDate]);

  const {
    events,
    isModalOpen,
    setIsModalOpen,
    editingEvent,
    setEditingEvent,
    handleSaveEvent,
    handleDeleteEvent,
  } = useCalendarEvents(activeDate);

  const days = generateWeekDaysForDate(activeDate);

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

      {/* Contenedor Principal Estilo Agenda por Día y Creación de Eventos */}
      <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 md:p-8 shadow-xs space-y-6">
        <EventHeader
          onOpenCreateModal={() => {
            setEditingEvent(null);
            setIsModalOpen(true);
          }}
        />

        <EventDaysHeader
          days={days}
          selectedDate={activeDate}
          onSelectDay={setActiveDate}
        />

        <EventTimeGrid
          days={days}
          events={events}
          selectedDate={activeDate}
          onEventEdit={(evt) => {
            setEditingEvent(evt);
            setIsModalOpen(true);
          }}
          onEventDelete={handleDeleteEvent}
          onEventActionClick={(evt) => {
            if (evt.eventType === 'payroll-pending' && onNavigateToPayroll) {
              onNavigateToPayroll();
            } else if (evt.eventType === 'pdf-dispatch' && onNavigateToDistribution) {
              onNavigateToDistribution();
            }
          }}
        />
      </div>

      <CreateEventModal
        isOpen={isModalOpen}
        selectedDate={activeDate}
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