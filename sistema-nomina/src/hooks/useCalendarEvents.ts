import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { CalendarEventItem } from '../components/events/types';
import { DayHeaderItem } from '../components/events/EventDaysHeader';
import { payrollApi } from '../service/api/payrollApi';

export const generateWeekDaysForDate = (dateString: string): DayHeaderItem[] => {
  let baseDate: Date;
  try {
    const parts = dateString.split('-');
    if (parts.length === 3) {
      baseDate = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 12, 0, 0);
    } else {
      baseDate = new Date();
    }
  } catch {
    baseDate = new Date();
  }

  const dayOfWeekIndex = baseDate.getDay();
  const distanceToMon = (dayOfWeekIndex + 6) % 7;
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - distanceToMon);

  const dayNames: Array<'LU' | 'MA' | 'MI' | 'JU' | 'VI' | 'SÁ' | 'DO'> = ['LU', 'MA', 'MI', 'JU', 'VI', 'SÁ', 'DO'];
  const weekDays: DayHeaderItem[] = [];

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);

    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, '0');
    const day = String(current.getDate()).padStart(2, '0');
    const fullDate = `${year}-${month}-${day}`;

    weekDays.push({
      dayName: dayNames[i],
      dayOfWeek: dayNames[i],
      dateStr: `${day}/${month}`,
      fullDate: fullDate,
    });
  }

  return weekDays;
};

export const useCalendarEvents = (targetDateStr?: string) => {
  const [events, setEvents] = useState<CalendarEventItem[]>([]);
  const [monthName, setMonthName] = useState('Agosto');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEventItem | null>(null);

  const loadEventsFromApi = async () => {
    try {
      const today = new Date();
      let year = today.getFullYear();
      let month = today.getMonth() + 1;

      if (targetDateStr) {
        const parts = targetDateStr.split('-');
        if (parts.length === 3) {
          year = parseInt(parts[0], 10);
          month = parseInt(parts[1], 10);
        }
      }

      const res = await payrollApi.fetchCalendarEvents(year, month);
      if (res && res.eventos) {
        if (res.nombreMes) setMonthName(res.nombreMes);
        const mappedEvents: CalendarEventItem[] = res.eventos.map((e: any) => ({
          id: String(e.id || Date.now()),
          dayNumber: e.day || 15,
          dayOfWeek: 'VI',
          dateStr: e.dateStr || `${year}-${String(month).padStart(2, '0')}-${String(e.day || 15).padStart(2, '0')}`,
          startTime: e.startTime || e.time || '08:00',
          endTime: e.endTime || '08:30',
          title: e.title,
          subtitle: e.subtitle || '',
          eventType: e.eventType || 'general-reminder',
          priority: e.priority || e.badge || 'MEDIA',
          description: e.description,
          actionText: e.actionText,
        }));
        setEvents(mappedEvents);
      }
    } catch (err) {
      console.warn('Error al cargar eventos de MariaDB:', err);
    }
  };

  useEffect(() => {
    loadEventsFromApi();
  }, [targetDateStr]);

  const handleSaveEvent = async (eventData: Omit<CalendarEventItem, 'id'>) => {
    if (editingEvent) {
      try {
        await payrollApi.updateEvent(editingEvent.id, {
          titulo: eventData.title,
          subtitulo: eventData.subtitle,
          fechaStr: eventData.dateStr,
          horaStr: eventData.startTime,
          tipoEvento: eventData.eventType,
          prioridad: eventData.priority,
          descripcion: eventData.description,
        });

        Swal.fire({
          icon: 'success',
          title: 'Evento actualizado',
          text: 'Los cambios se han guardado exitosamente en MariaDB.',
          timer: 1800,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error('Error al actualizar evento en MariaDB:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error de servidor',
          text: 'No se pudieron guardar los cambios en la base de datos.',
        });
      }
    } else {
      try {
        await payrollApi.createEvent({
          titulo: eventData.title,
          subtitulo: eventData.subtitle,
          fechaStr: eventData.dateStr,
          horaStr: eventData.startTime,
          tipoEvento: eventData.eventType,
          prioridad: eventData.priority,
          descripcion: eventData.description,
          adjuntoNombre: eventData.attachmentName,
          textoAccion: eventData.actionText,
        });

        Swal.fire({
          icon: 'success',
          title: 'Evento creado',
          text: 'El evento ha sido guardado exitosamente en MariaDB.',
          timer: 1800,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error('Error guardando evento en MariaDB:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error de servidor',
          text: 'No se pudo crear el evento en la base de datos.',
        });
      }
    }

    setIsModalOpen(false);
    setEditingEvent(null);
    await loadEventsFromApi();
  };

  const handleDeleteEvent = async (event: CalendarEventItem) => {
    const result = await Swal.fire({
      title: '¿Eliminar recordatorio?',
      text: `¿Estás seguro de eliminar "${event.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (result.isConfirmed) {
      try {
        await payrollApi.deleteEvent(event.id);
        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'El recordatorio fue eliminado correctamente de MariaDB.',
          timer: 1800,
          showConfirmButton: false,
        });
      } catch (err) {
        console.error('Error eliminando evento en MariaDB:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo eliminar el evento en la base de datos.',
        });
      }

      await loadEventsFromApi();
    }
  };

  return {
    events,
    monthName,
    isModalOpen,
    setIsModalOpen,
    editingEvent,
    setEditingEvent,
    handleSaveEvent,
    handleDeleteEvent,
    loadEventsFromApi,
  };
};
