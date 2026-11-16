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
      if (!data || !data.items || data.items.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Sin datos reconocidos',
          text: 'El archivo Excel no contiene filas de empleados válidas. Asegúrate de incluir la columna CÓDIGO EMPLEADO.',
        });
        return;
      }
      setPreviewNominaData(data);
      setIsPayrollStagingMode(true);
    } catch (err: any) {
      console.error('Error al subir Excel:', err);
      const mensaje = err?.response?.data?.mensaje || err?.response?.data?.detail || err?.message || 'No se pudo conectar con el servidor backend.';
      Swal.fire({
        icon: 'error',
        title: 'Error al leer el archivo Excel',
        text: mensaje,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayrollItem = (index: number, field: keyof NominaItem, value: any) => {
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

    const devengado = (curItem.sueldoBase || 0) + (curItem.incentivo || 0) + (curItem.reembolso || 0) + (curItem.horasExtras || 0);
    const deducciones = (curItem.prestamo || 0) + (curItem.cuotaCumpleanos || 0) + (curItem.seguroVehiculo || 0) + (curItem.seguroMedico || 0) + (curItem.sfs || 0) + (curItem.afp || 0) + (curItem.isr || 0);
    const neto = devengado - deducciones;

    curItem.totalDevengado = Math.round(devengado * 100) / 100;
    curItem.totalDeducciones = Math.round(deducciones * 100) / 100;
    curItem.netoAPagar = Math.round(neto * 100) / 100;

    updatedItems[index] = curItem;

    const totDev = updatedItems.reduce((acc, i) => acc + (i.totalDevengado || 0), 0);
    const totDed = updatedItems.reduce((acc, i) => acc + (i.totalDeducciones || 0), 0);
    const totNet = updatedItems.reduce((acc, i) => acc + (i.netoAPagar || 0), 0);

    setPreviewNominaData({
      ...previewNominaData,
      resumenTotales: {
        totalDevengado: Math.round(totDev * 100) / 100,
        totalDeducciones: Math.round(totDed * 100) / 100,
        totalNeto: Math.round(totNet * 100) / 100,
      },
      items: updatedItems,
    });
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