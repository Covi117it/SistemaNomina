import React from 'react';
import { Sparkles, CheckCircle2 } from 'lucide-react';

interface StagingToolbarProps {
  totalRegistros: number;
  quincena: string;
  mes: string;
  onCancel: () => void;
  onConfirmSave: (quincena: string, mes: number) => void;
  isSaving: boolean;
  canSave: boolean;
}

export const StagingToolbar: React.FC<StagingToolbarProps> = ({
  totalRegistros,
  quincena,
  mes,
  onCancel,
  onConfirmSave,
  isSaving,
  canSave,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
      {/* Título e Información */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-lg border border-emerald-200/60 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            Vista Previa
          </span>
          <span className="text-slate-400 text-xs font-medium">
            • {totalRegistros} pagos procesados del Excel
          </span>
        </div>
        <h2 className="text-lg font-extrabold text-slate-900 mt-1">
          Revisión y Ajuste de Montos Quincenales
        </h2>
      </div>

      {/* Acciones Únicas y Limpias */}
      <div className="flex items-center gap-3">
        {/* Descartar */}
        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition-all cursor-pointer disabled:opacity-50"
        >
          Descartar
        </button>

        {/* Guardar y Confirmar Período */}
        <button
          onClick={() => onConfirmSave(quincena, parseInt(mes))}
          disabled={isSaving || !canSave}
          className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          Guardar {quincena} en Histórico ➔
        </button>
      </div>
    </div>
  );
};