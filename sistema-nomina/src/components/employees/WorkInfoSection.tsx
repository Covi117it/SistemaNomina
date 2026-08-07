import React from 'react';
import { Empleado } from '../../types/empleado';
import { Briefcase } from 'lucide-react';
import { FormSelect } from '../common/FormSelect';

const ESTATUS_OPTIONS = [
  { label: 'ACTIVO', value: 'ACTIVO' },
  { label: 'INACTIVO', value: 'INACTIVO' },
];

interface WorkInfoSectionProps {
  formData: Partial<Empleado>;
  onChange: (field: keyof Empleado, value: any) => void;
  isEditMode?: boolean;
}

export const WorkInfoSection: React.FC<WorkInfoSectionProps> = ({
  formData,
  onChange,
  isEditMode = false,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 md:p-8 shadow-xs space-y-5">
      {/* Header de la Sección */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
          <Briefcase className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            Información Laboral
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Puesto asignado y estado activo/inactivo del empleado.
          </p>
        </div>
      </div>

      {/* Campos de la Sección */}
      <div className="space-y-4 pt-1">
        <div className={`grid grid-cols-1 ${isEditMode ? 'sm:grid-cols-2' : ''} gap-4`}>
          {/* Puesto o Cargo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Puesto o Cargo
            </label>
            <input
              type="text"
              value={formData.puesto || ''}
              onChange={(e) => onChange('puesto', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>

          {/* Estatus del Empleado - Solo visible en modo edición */}
          {isEditMode && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Estatus del Empleado
              </label>
              <FormSelect
                options={ESTATUS_OPTIONS}
                value={formData.eStatus || 'ACTIVO'}
                onChange={(val) => onChange('eStatus', val)}
                className="w-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
