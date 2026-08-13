import React from 'react';
import { Empleado } from '../../types/empleado';
import { User } from 'lucide-react';
import { FormSelect } from '../common/FormSelect';
import { isValidCedulaRD, isValidPasaporte } from '../../utils/documentValidator';

const TIPO_DOC_OPTIONS = [
  { label: '1 - Cédula de Identidad', value: '1' },
  { label: '2 - Pasaporte', value: '2' },
];

interface PersonalInfoSectionProps {
  formData: Partial<Empleado>;
  onChange: (field: keyof Empleado, value: any) => void;
}

export const PersonalInfoSection: React.FC<PersonalInfoSectionProps> = ({
  formData,
  onChange,
}) => {
  const esPasaporte = formData.tipoDocumento === '2';

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

  const handleDocumentoInput = (rawVal: string) => {
    if (esPasaporte) {
      const clean = rawVal.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 20);
      onChange('cedula', clean);
    } else {
      handleCedulaInput(rawVal);
    }
  };

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

  const parseNombres = (fullName?: string | null) => {
    if (!fullName || !fullName.trim()) return { nombre: '', apellido: '' };
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return { nombre: parts[0], apellido: '' };
    if (parts.length === 2) return { nombre: parts[0], apellido: parts[1] };
    if (parts.length === 3) return { nombre: parts[0], apellido: parts.slice(1).join(' ') };
    return { nombre: parts.slice(0, 2).join(' '), apellido: parts.slice(2).join(' ') };
  };

  const [nombre, setNombre] = React.useState('');
  const [apellido, setApellido] = React.useState('');
  const lastCombinedRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    const currentCombined = formData.nombres || '';
    if (currentCombined !== lastCombinedRef.current) {
      const parsed = parseNombres(currentCombined);
      setNombre(parsed.nombre);
      setApellido(parsed.apellido);
      lastCombinedRef.current = currentCombined;
    }
  }, [formData.nombres]);

  const handleNombreChange = (newNombre: string) => {
    setNombre(newNombre);
    const combined = `${newNombre.trim()} ${apellido.trim()}`.trim();
    lastCombinedRef.current = combined;
    onChange('nombres', combined);
  };

  const handleApellidoChange = (newApellido: string) => {
    setApellido(newApellido);
    const combined = `${nombre.trim()} ${newApellido.trim()}`.trim();
    lastCombinedRef.current = combined;
    onChange('nombres', combined);
  };

  const documentoValido = esPasaporte
    ? isValidPasaporte(formData.cedula || '')
    : isValidCedulaRD(formData.cedula || '');

  return (
    <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 md:p-8 shadow-xs space-y-5">
      {/* Header de la Sección */}
      <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
          <User className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-base font-extrabold text-slate-900">
            Información Personal
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">
            Datos de identificación y contacto requeridos en el catálogo de empleados.
          </p>
        </div>
      </div>

      {/* Campos de la Sección */}
      <div className="space-y-4 pt-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nombres */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nombres <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={nombre}
              onChange={(e) => handleNombreChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>

          {/* Apellidos */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Apellidos
            </label>
            <input
              type="text"
              value={apellido}
              onChange={(e) => handleApellidoChange(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Tipo de Documento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Tipo de Documento
            </label>
            <FormSelect
              options={TIPO_DOC_OPTIONS}
              value={formData.tipoDocumento || '1'}
              onChange={(val) => {
                onChange('tipoDocumento', val);
                onChange('cedula', '');
              }}
              className="w-full"
            />
          </div>

          {/* Cédula o Pasaporte */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">
                {esPasaporte ? 'Número de Pasaporte' : 'Cédula de Identidad'}
              </label>
              {formData.cedula && formData.cedula.trim() !== '' && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    documentoValido
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-100 text-rose-800 border border-rose-200'
                  }`}
                >
                  {documentoValido ? '✓ Válido' : '✕ Inválido'}
                </span>
              )}
            </div>
            <input
              type="text"
              maxLength={esPasaporte ? 20 : 13}
              placeholder={esPasaporte ? 'A12345678' : '001-0000000-0'}
              value={formData.cedula || ''}
              onChange={(e) => handleDocumentoInput(e.target.value)}
              className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs font-mono font-medium focus:bg-white focus:outline-none transition-all ${
                formData.cedula && !documentoValido
                  ? 'border-rose-400 focus:border-rose-500'
                  : 'border-slate-200 focus:border-emerald-500'
              }`}
            />
          </div>
        </div>

        {/* Correo Electrónico */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Correo Electrónico
          </label>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => onChange('email', e.target.value)}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Fecha de Ingreso */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Fecha de Ingreso (DD/MM/YYYY)
            </label>
            <input
              type="text"
              maxLength={10}
              placeholder="DD/MM/YYYY"
              value={cleanIsoDate(formData.fechaIngreso)}
              onChange={(e) => handleDateInput('fechaIngreso', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>

          {/* Fecha de Nacimiento */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Fecha de Nacimiento (DD/MM/YYYY)
            </label>
            <input
              type="text"
              maxLength={10}
              placeholder="DD/MM/YYYY"
              value={cleanIsoDate(formData.fechaNacimiento)}
              onChange={(e) => handleDateInput('fechaNacimiento', e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono font-medium text-slate-900 focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
