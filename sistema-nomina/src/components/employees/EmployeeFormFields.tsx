import React from 'react';
import { Empleado } from '../../types/empleado';
import { User, Briefcase } from 'lucide-react';
import { FormSelect } from '../common/FormSelect';

const TIPO_DOC_OPTIONS = [
  { label: '1 - Cédula de Identidad', value: '1' },
  { label: '2 - Pasaporte', value: '2' },
];

const ESTATUS_OPTIONS = [
  { label: 'ACTIVO', value: 'ACTIVO' },
  { label: 'INACTIVO', value: 'INACTIVO' },
];

interface EmployeeFormFieldsProps {
  formData: Partial<Empleado>;
  onChange: (field: keyof Empleado, value: any) => void;
  isEditMode?: boolean;
}

export const EmployeeFormFields: React.FC<EmployeeFormFieldsProps> = ({
  formData,
  onChange,
  isEditMode = false,
}) => {

  // Limpia formatos ISO como "2017-01-02T00:00:00" a "02/01/2017"
  const cleanIsoDate = (val?: string | null) => {
    if (!val || !val.trim()) return '';
    if (val.includes('/')) return val;
    const clean = val.split('T')[0];
    const parts = clean.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return val;
  };

  // Auto-formateador de Cédula (XXX-XXXXXXX-X)
  const handleCedulaInput = (rawVal: string) => {
    const digits = rawVal.replace(/\D/g, '').slice(0, 11);
    let formatted = digits;
    if (digits.length > 3 && digits.length <= 10) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else if (digits.length > 10) {
      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 10)}-${digits.slice(10)}`;
    }
    onChange('cedula', formatted);
  };

  // Auto-formateador de Fecha en tiempo real (DD/MM/YYYY)
  const handleDateInput = (field: 'fechaIngreso' | 'fechaNacimiento', rawVal: string) => {
    const digits = rawVal.replace(/\D/g, '').slice(0, 8);
    let formatted = digits;
    if (digits.length > 2 && digits.length <= 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    } else if (digits.length > 4) {
      formatted = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    }
    onChange(field, formatted);
  };

  return (
    <div className="space-y-6">
      {/* Tarjeta 1: Información Personal */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <User className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Información Personal
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Código del Empleado *</label>
            <input
              type="text"
              required
              readOnly={isEditMode}
              value={formData.codigo || ''}
              onChange={(e) => onChange('codigo', e.target.value)}
              className={`w-full border rounded-xl px-3 py-2 text-xs font-mono font-bold transition-all ${
                isEditMode
                  ? 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                  : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none'
              }`}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1">Nombres y Apellidos Completo *</label>
            <input
              type="text"
              required
              value={formData.nombres || ''}
              onChange={(e) => onChange('nombres', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Tipo de Documento Único */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Tipo de Documento</label>
            <FormSelect
              options={TIPO_DOC_OPTIONS}
              value={formData.tipoDocumento || '1'}
              onChange={(val) => onChange('tipoDocumento', val)}
              className='w-full'
            />
          </div>

          {/* Cédula */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Cédula de Identidad</label>
            <input
              type="text"
              maxLength={13}
              placeholder="001-0000000-0"
              value={formData.cedula || ''}
              onChange={(e) => handleCedulaInput(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Fecha de Ingreso Limpia DD/MM/YYYY */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Fecha de Ingreso (DD/MM/YYYY)</label>
            <input
              type="text"
              maxLength={10}
              placeholder="DD/MM/YYYY"
              value={cleanIsoDate(formData.fechaIngreso)}
              onChange={(e) => handleDateInput('fechaIngreso', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Fecha de Nacimiento Limpia DD/MM/YYYY */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Fecha de Nacimiento (DD/MM/YYYY)</label>
            <input
              type="text"
              maxLength={10}
              placeholder="DD/MM/YYYY"
              value={cleanIsoDate(formData.fechaNacimiento)}
              onChange={(e) => handleDateInput('fechaNacimiento', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-medium text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1">Correo Electrónico</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={(e) => onChange('email', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Tarjeta 2: Información Laboral */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
            <Briefcase className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
            Información Laboral
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Puesto o Cargo</label>
            <input
              type="text"
              value={formData.puesto || ''}
              onChange={(e) => onChange('puesto', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:bg-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          {/* Estatus del Empleado Único */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Estatus del Empleado</label>
            <FormSelect
              options={ESTATUS_OPTIONS}
              value={formData.eStatus || 'ACTIVO'}
              onChange={(val) => onChange('eStatus', val)}
              className='w-full'
            />
          </div>
        </div>
      </div>
    </div>
  );
};