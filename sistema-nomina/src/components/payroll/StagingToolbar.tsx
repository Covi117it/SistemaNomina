import React from 'react';
import { FormSelect } from '../common/FormSelect';
import { Sparkles, CheckCircle2, Calendar, Clock, Mail } from 'lucide-react';

const QUINCENA_OPTIONS = [
  { label: '1Q', value: '1Q' },
  { label: '2Q', value: '2Q' },
];

const MESES_OPTIONS = [
  { label: 'Mes 1 - Enero', value: '1' },
  { label: 'Mes 2 - Febrero', value: '2' },
  { label: 'Mes 3 - Marzo', value: '3' },
  { label: 'Mes 4 - Abril', value: '4' },
  { label: 'Mes 5 - Mayo', value: '5' },
  { label: 'Mes 6 - Junio', value: '6' },
  { label: 'Mes 7 - Julio', value: '7' },
  { label: 'Mes 8 - Agosto', value: '8' },
  { label: 'Mes 9 - Septiembre', value: '9' },
  { label: 'Mes 10 - Octubre', value: '10' },
  { label: 'Mes 11 - Noviembre', value: '11' },
  { label: 'Mes 12 - Diciembre', value: '12' },
];

interface StagingToolbarProps {
  totalRegistros: number;
  quincena: string;
  mes: string;
  setQuincena: (val: string) => void;
  setMes: (val: string) => void;
  onCancel: () => void;
  onConfirmSave: (quincena: string, mes: number) => void;
  onNavigateToDistribution?: () => void;
  isSaving: boolean;
  canSave: boolean;
}

export const StagingToolbar: React.FC<StagingToolbarProps> = ({
  totalRegistros,
  quincena,
  mes,
  setQuincena,
  setMes,
  onCancel,
  onConfirmSave,
  onNavigateToDistribution,
  isSaving,
  canSave,
}) => {
  return (
    <div className="flex flex-col items-start lg:items-center justify-start gap-4 mb-6 pb-4 border-b border-slate-100">
      <div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            Vista Previa de Nómina
          </span>
          <span className="text-slate-400 text-xs font-medium">
            {totalRegistros} pagos procesados del Excel
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-slate-900 mt-2">
          Revisión y Ajuste de Montos Quincenales
        </h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
          <FormSelect
            options={QUINCENA_OPTIONS}
            value={quincena}
            onChange={setQuincena}
            icon={<Clock className="w-3.5 h-3.5 text-slate-400" />}
            className="w-40"
          />
          <FormSelect
            options={MESES_OPTIONS}
            value={mes}
            onChange={setMes}
            icon={<Calendar className="w-3.5 h-3.5 text-slate-400" />}
            className="w-44"
          />
        </div>

        {onNavigateToDistribution && (
          <button
            onClick={onNavigateToDistribution}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Mail className="w-4 h-4 text-emerald-600" />
            Volantes y Correos
          </button>
        )}

        <button
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50"
        >
          Descartar
        </button>

        <button
          onClick={() => onConfirmSave(quincena, parseInt(mes))}
          disabled={isSaving || !canSave}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          Guardar {quincena} en Histórico ➔
        </button>
      </div>
    </div>
  );
};