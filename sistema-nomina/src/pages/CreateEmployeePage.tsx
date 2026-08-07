import React, { useState, useEffect } from 'react';
import { Empleado } from '../types/empleado';
import { EmployeeFormFields } from '../components/employees/EmployeeFormFields';
import { ActionsDropdown } from '../components/common/ActionsDropdown';
import { Save, RotateCcw, CheckCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

interface CreateEmployeePageProps {
  initialData?: Empleado | null;
  isEditMode?: boolean;
  nextSuggestedCode?: string;
  onSave: (empleado: Empleado) => Promise<void>;
  onBack: () => void;
  onNavigateToDirectory?: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToPayroll?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToDistribution?: () => void;
}

export const CreateEmployeePage: React.FC<CreateEmployeePageProps> = ({
  initialData,
  isEditMode = false,
  nextSuggestedCode = '',
  onSave,
  onBack,
  onNavigateToDirectory,
  onNavigateToCreate,
  onNavigateToPayroll,
  onNavigateToHistory,
  onNavigateToDistribution,
}) => {
  const [formData, setFormData] = useState<Partial<Empleado>>({
    codigo: nextSuggestedCode,
    nombres: '',
    cedula: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    email: '',
    puesto: '',
    eStatus: 'ACTIVO',
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialData && isEditMode) {
      setFormData(initialData);
    } else if (nextSuggestedCode) {
      setFormData((prev) => ({ ...prev, codigo: nextSuggestedCode }));
    }
  }, [initialData, isEditMode, nextSuggestedCode]);

  const handleChange = (field: keyof Empleado, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData({
      codigo: isEditMode ? initialData?.codigo || '' : nextSuggestedCode,
      nombres: '',
      cedula: '',
      fechaIngreso: new Date().toISOString().split('T')[0],
      email: '',
      puesto: '',
      eStatus: 'ACTIVO',
    });
    setSavedSuccess(false);
  };

  const parseDateToIso = (dateStr?: string | null): string | null => {
    if (!dateStr || !dateStr.trim()) return null;
    const clean = dateStr.trim();
    if (clean.includes('/')) {
      const parts = clean.split('/');
      if (parts.length === 3) {
        const day = parts[0].padStart(2, '0');
        const month = parts[1].padStart(2, '0');
        const year = parts[2];
        return `${year}-${month}-${day}T00:00:00.000Z`;
      }
    }
    if (clean.includes('-')) {
      const parts = clean.split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}T00:00:00.000Z`;
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombres || !formData.nombres.trim()) return;
    setSaving(true);
    try {
      const payload: Empleado = {
        ...(formData as Empleado),
        codigo: isEditMode ? (formData.codigo || '') : (formData.codigo?.trim() || ''),
        fechaIngreso: parseDateToIso(formData.fechaIngreso) || new Date().toISOString(),
        fechaNacimiento: parseDateToIso(formData.fechaNacimiento) || undefined,
      };
      await onSave(payload);
      setSavedSuccess(true);
    } catch (err) {
      console.error('Error guardando empleado:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Bar: ActionsDropdown & Volver button (en la esquina de la pantalla) */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onNavigateToCreate && (
            <ActionsDropdown
              currentView={isEditMode ? 'edit-employee' : 'create-employee'}
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
            <span>Volver</span>
          </button>
        </div>

        {savedSuccess && (
          <div className="px-4 py-2 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            ¡Empleado guardado exitosamente!
          </div>
        )}
      </div>

      {/* Formulario y Header Card centrados */}
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Card */}
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 md:p-8 shadow-xs space-y-4">
          {/* Title, Verification Badge & Code Subtitle (Izquierda) + Estatus y Posición (Derecha) */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            {/* Lado Izquierdo: Nombre y Código */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {formData.nombres && formData.nombres.trim() !== ''
                    ? formData.nombres
                    : 'Nuevo Empleado'}
                </h1>
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              </div>
              <p className="text-xs font-medium text-slate-500">
                {formData.codigo
                  ? `Código: ${formData.codigo}`
                  : 'Formulario de registro de personal'}
              </p>
            </div>

            {/* Lado Derecho: Estatus y Posición / Puesto */}
            <div className="flex items-center gap-5 text-xs">
              <div className="text-left sm:text-right">
                <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider">Estatus</span>
                <span
                  className={`font-black text-xs px-3 py-1 rounded-full inline-block mt-0.5 ${
                    formData.eStatus === 'ACTIVO'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : 'bg-slate-100 text-slate-700 border border-slate-200'
                  }`}
                >
                  {formData.eStatus || 'ACTIVO'}
                </span>
              </div>

              <div className="text-left sm:text-right pl-5 border-l border-slate-200/80">
                <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider">Cargo / Puesto</span>
                <span className="font-extrabold text-slate-800 text-sm inline-block mt-0.5 truncate max-w-[200px]">
                  {formData.puesto && formData.puesto.trim() !== ''
                    ? formData.puesto
                    : 'Sin asignar'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Form Sections */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <EmployeeFormFields formData={formData} onChange={handleChange} isEditMode={isEditMode} />

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Limpiar Formulario
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white text-xs font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Guardar Empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};