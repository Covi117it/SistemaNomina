import React, { useState, useEffect } from 'react';
import { Empleado } from '../types/empleado';
import { EmployeeFormFields } from '../components/employees/EmployeeFormFields';
import { PageHeader } from '../components/common/PageHeader';
import { Save, RotateCcw, CheckCircle } from 'lucide-react';

interface CreateEmployeePageProps {
  initialData?: Empleado | null;
  isEditMode?: boolean;
  onSave: (empleado: Empleado) => Promise<void>;
  onBack: () => void;
}

export const CreateEmployeePage: React.FC<CreateEmployeePageProps> = ({
  initialData,
  isEditMode = false,
  onSave,
  onBack,
}) => {
  const [formData, setFormData] = useState<Partial<Empleado>>({
    codigo: '',
    nombres: '',
    cedula: '',
    fechaIngreso: new Date().toISOString().split('T')[0],
    email: '',
    puesto: '',
    sueldoBase: 0,
    eStatus: 'ACTIVO',
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialData && isEditMode) {
      setFormData(initialData);
    }
  }, [initialData, isEditMode]);

  const handleChange = (field: keyof Empleado, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setFormData({
      codigo: '',
      nombres: '',
      cedula: '',
      fechaIngreso: new Date().toISOString().split('T')[0],
      email: '',
      puesto: '',
      sueldoBase: 0,
      eStatus: 'ACTIVO',
    });
    setSavedSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.codigo || !formData.nombres) return;
    setSaving(true);
    try {
      await onSave(formData as Empleado);
      setSavedSuccess(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* PageHeader Reutilizable */}
      <PageHeader
        title={isEditMode ? `Editar Empleado - ${formData.codigo || ''}` : 'Registrar Nuevo Empleado'}
        onBack={onBack}
        actions={
          savedSuccess ? (
            <div className="px-3.5 py-1.5 bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600" />
              ¡Guardado exitosamente!
            </div>
          ) : undefined
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Formulario Reutilizable */}
        <EmployeeFormFields formData={formData} onChange={handleChange} isEditMode={isEditMode} />

        {/* Acciones del Formulario */}
        <div className="flex items-center justify-end gap-3 pt-2">
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
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Guardando...' : isEditMode ? 'Guardar Cambios' : 'Guardar Empleado'}
          </button>
        </div>
      </form>
    </div>
  );
};