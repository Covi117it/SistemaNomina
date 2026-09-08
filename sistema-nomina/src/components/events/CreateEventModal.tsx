import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, Tag, Save, AlignLeft, AlertCircle } from 'lucide-react';
import { CalendarEventItem, EventType, EventPriority } from './types';
import { FormSelect, FormSelectOption } from '../common/FormSelect';

interface CreateEventModalProps {
  isOpen: boolean;
  selectedDate?: string;
  editingEvent?: CalendarEventItem | null;
  onClose: () => void;
  onSave: (event: Omit<CalendarEventItem, 'id'>) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  selectedDate,
  editingEvent,
  onClose,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: editingEvent?.title || '',
    subtitle: editingEvent?.subtitle || 'General',
    dateStr: editingEvent?.dateStr || selectedDate || new Date().toISOString().split('T')[0],
    startTime: editingEvent?.startTime || '08:00',
    endTime: editingEvent?.endTime || '08:30',
    eventType: (editingEvent?.eventType || 'general-reminder') as EventType,
    priority: (editingEvent?.priority || 'ALTA') as EventPriority,
    description: editingEvent?.description || '',
  });

  React.useEffect(() => {
    if (editingEvent) {
      setFormData({
        title: editingEvent.title || '',
        subtitle: editingEvent.subtitle || 'General',
        dateStr: editingEvent.dateStr || selectedDate || new Date().toISOString().split('T')[0],
        startTime: editingEvent.startTime || '08:00',
        endTime: editingEvent.endTime || '08:30',
        eventType: (editingEvent.eventType || 'general-reminder') as EventType,
        priority: (editingEvent.priority || 'ALTA') as EventPriority,
        description: editingEvent.description || '',
      });
    } else {
      setFormData({
        title: '',
        subtitle: 'General',
        dateStr: selectedDate || new Date().toISOString().split('T')[0],
        startTime: '08:00',
        endTime: '08:30',
        eventType: 'general-reminder' as EventType,
        priority: 'ALTA' as EventPriority,
        description: '',
      });
    }
  }, [editingEvent, selectedDate, isOpen]);

  if (!isOpen) return null;

  const eventTypeOptions: FormSelectOption[] = [
    { value: 'general-reminder', label: 'Evento General' },
    { value: 'payroll-pending', label: 'Procesar Nómina' },
    { value: 'pdf-dispatch', label: 'Despacho Volantes PDF' },
    { value: 'payroll-completed', label: 'Nómina Completada' },
  ];

  const priorityOptions: FormSelectOption[] = [
    { value: 'ALTA', label: 'Alta Prioridad' },
    { value: 'MEDIA', label: 'Prioridad Media' },
    { value: 'BAJA', label: 'Baja Prioridad' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    const actionText = formData.eventType === 'payroll-pending'
      ? 'Procesar'
      : formData.eventType === 'pdf-dispatch'
        ? 'Despachar'
        : undefined;

    onSave({
      title: formData.title,
      subtitle: formData.subtitle,
      dayNumber: parseInt(formData.dateStr.split('-')[2] || '15', 10),
      dayOfWeek: 'JU',
      dateStr: formData.dateStr,
      startTime: formData.startTime,
      endTime: formData.endTime,
      eventType: formData.eventType,
      priority: formData.priority,
      description: formData.description?.trim() || undefined,
      participants: ['TY', 'AB'],
      actionText: actionText,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200/80 rounded-[32px] max-w-2xl w-full p-8 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
        {/* Header Modal Ampliado */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {editingEvent ? 'Editar Evento' : 'Crear Evento'}
              </h3>
              <p className="text-xs font-semibold text-slate-400">
                {editingEvent ? 'Modifica la información y detalles del compromiso' : 'Ingresa los datos para agendar una nueva actividad en el sistema'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Título del Evento */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-emerald-600" />
              <span>Título del Evento *</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder=""
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Fecha y Hora de Inicio */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <CalendarIcon className="w-4 h-4 text-emerald-600" />
                <span>Fecha Programada (Fija)</span>
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={(() => {
                  if (!formData.dateStr) return '';
                  const parts = formData.dateStr.split('-');
                  if (parts.length === 3) {
                    return `${parts[2]}/${parts[1]}/${parts[0]}`;
                  }
                  return formData.dateStr;
                })()}
                className="w-full px-4 py-3 bg-slate-100/90 border border-slate-200/90 rounded-2xl text-xs font-black text-slate-600 cursor-not-allowed select-none shadow-inner opacity-90"
                title="La fecha es inmutable ya que fue elegida previamente"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Hora de Inicio</span>
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all"
              />
            </div>
          </div>

          {/* Tipo de Evento y Prioridad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-emerald-600" />
                <span>Tipo de Actividad</span>
              </label>
              <FormSelect
                options={eventTypeOptions}
                value={formData.eventType}
                onChange={(val) => setFormData({ ...formData, eventType: val as EventType })}
                className="w-full py-3 px-4 rounded-2xl bg-slate-50 border-slate-200 text-xs font-bold text-slate-900"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-emerald-600" />
                <span>Nivel de Prioridad</span>
              </label>
              <FormSelect
                options={priorityOptions}
                value={formData.priority}
                onChange={(val) => setFormData({ ...formData, priority: val as EventPriority })}
                className="w-full py-3 px-4 rounded-2xl bg-slate-50 border-slate-200 text-xs font-bold text-slate-900"
              />
            </div>
          </div>

          {/* Notas del Evento */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <AlignLeft className="w-4 h-4 text-emerald-600" />
              <span>Notas del Evento</span>
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Agrega información relevante, objetivos o notas adicionales sobre este evento..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-900 focus:outline-none focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-500/10 transition-all resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Acciones Modal */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-extrabold rounded-2xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-black rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4 stroke-[2.5]" />
              <span>{editingEvent ? 'Guardar Cambios' : 'Crear Evento'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
