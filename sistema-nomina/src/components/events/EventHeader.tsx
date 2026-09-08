import React from 'react';
import { Plus, RefreshCw } from 'lucide-react';

interface EventHeaderProps {
  onOpenCreateModal: () => void;
  onRefresh?: () => void;
}

export const EventHeader: React.FC<EventHeaderProps> = ({
  onOpenCreateModal,
  onRefresh,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
      {/* Lado Izquierdo: Título */}
      <h1 className="text-2xl font-black text-slate-900 tracking-tight">
        Agenda y Calendario de Eventos
      </h1>

      {/* Lado Derecho: Botón Refrescar y Botón + Crear Evento */}
      <div className="flex items-center gap-3">
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2.5 bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-600 rounded-xl transition-all cursor-pointer shadow-xs"
            title="Refrescar agenda"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}

        <button
          onClick={onOpenCreateModal}
          className="px-4 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Crear Evento</span>
        </button>
      </div>
    </div>
  );
};
