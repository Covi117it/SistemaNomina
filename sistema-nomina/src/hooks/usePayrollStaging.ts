import { useState } from 'react';
import Swal from 'sweetalert2';
import { PreviewNominaResponse, NominaItem } from '../types/nomina';
import { payrollApi } from '../service/api/payrollApi';

export const usePayrollStaging = (onSuccessCallback?: () => void) => {
  const [previewNominaData, setPreviewNominaData] = useState<PreviewNominaResponse | null>(null);
  const [isPayrollStagingMode, setIsPayrollStagingMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      const data = await payrollApi.uploadPreview(file);
      setPreviewNominaData(data);
      setIsPayrollStagingMode(true);
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayrollItem = async (index: number, field: keyof NominaItem, value: any) => {
    if (!previewNominaData) return;

    const updatedItems = [...previewNominaData.items];
    const curItem = { ...updatedItems[index], [field]: value };

    // Sincronización automática bidireccional entre sueldoBase y totalDevengado
    if (field === 'sueldoBase') {
      const nuevoSueldo = typeof value === 'number' ? value : parseFloat(value) || 0;
      const devengadoExtras = (curItem.incentivo || 0) + (curItem.reembolso || 0) + (curItem.horasExtras || 0);
      curItem.totalDevengado = nuevoSueldo + devengadoExtras;
    } else if (field === 'totalDevengado') {
      const nuevoDevengado = typeof value === 'number' ? value : parseFloat(value) || 0;
      const devengadoExtras = (curItem.incentivo || 0) + (curItem.reembolso || 0) + (curItem.horasExtras || 0);
      curItem.sueldoBase = Math.max(0, nuevoDevengado - devengadoExtras);
    }

    updatedItems[index] = curItem;

    try {
      const recalculated = await payrollApi.recalcularNomina(updatedItems);
      setPreviewNominaData({
        ...previewNominaData,
        resumenTotales: recalculated.resumenTotales,
        items: recalculated.items,
      });
    } catch {
      setPreviewNominaData({
        ...previewNominaData,
        items: updatedItems,
      });
    }
  };

  const handleConfirmSavePayroll = async (quincena?: string, mes?: number): Promise<boolean> => {
    if (!previewNominaData || !previewNominaData.items || previewNominaData.items.length === 0) return false;

    const noRegistrados = previewNominaData.items.filter(
      (i) => !i.empleadoExiste || i.eStatusEmpleado === 'NO_EXISTE' || i.nombreEmpleado?.includes('NO REGISTRADO')
    );

    if (noRegistrados.length > 0) {
      const codigosLista = noRegistrados.map((i) => i.codigoEmpleado).join(', ');
      Swal.fire({
        title: '¡No se puede guardar la nómina!',
        html: `
          <div class="text-left text-xs text-slate-600 space-y-3 pt-2">
            <p class="font-bold text-slate-800 text-sm">
              Existen <span class="text-rose-600 font-extrabold">${noRegistrados.length} empleados</span> en el archivo Excel que no están registrados en la Base de Datos:
            </p>
            <div class="p-3 bg-rose-50 border border-rose-200 rounded-xl font-mono text-rose-800 font-bold text-xs tracking-wide">
              Códigos: ${codigosLista}
            </div>
            <p class="text-slate-500 font-medium leading-relaxed">
              Para poder guardar esta nómina en el histórico, primero debe registrar a estos empleados en el catálogo o removerlos del archivo Excel.
            </p>
          </div>
        `,
        icon: 'error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border border-slate-200 font-sans p-6',
          title: 'text-lg font-extrabold text-slate-900',
        },
      });
      return false;
    }

    const hoy = new Date();
    const mesActual = mes || (hoy.getMonth() + 1);
    const quincenaActual = quincena || (hoy.getDate() <= 15 ? '1Q' : '2Q');
    const conceptoActual = `Nómina Quincenal ${quincenaActual} - Mes ${mesActual}`;

    setIsSaving(true);
    try {
      await payrollApi.processAndSaveQuincena(
        mesActual,
        quincenaActual,
        conceptoActual,
        previewNominaData.items
      );
      setIsPayrollStagingMode(false);
      setPreviewNominaData(null);
      if (onSuccessCallback) onSuccessCallback();
      return true;
    } catch (err: any) {
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const cancelStaging = () => {
    setIsPayrollStagingMode(false);
    setPreviewNominaData(null);
  };

  return {
    previewNominaData,
    isPayrollStagingMode,
    loading,
    isSaving,
    handleFileUpload,
    handleUpdatePayrollItem,
    handleConfirmSavePayroll,
    cancelStaging,
    setIsPayrollStagingMode,
    setPreviewNominaData,
  };
};