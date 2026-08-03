import { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Empleado } from '../types/empleado';
import { PreviewNominaResponse, NominaItem } from '../types/nomina';

const API_BASE_URL = 'http://localhost:5289/api/empleados';
const API_NOMINA_URL = 'http://localhost:5289/api/nomina';

export const useEmployees = () => {
  const [dbEmployees, setDbEmployees] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [updatingCodigo, setUpdatingCodigo] = useState<string | null>(null);

  const [previewNominaData, setPreviewNominaData] = useState<PreviewNominaResponse | null>(null);
  const [isPayrollStagingMode, setIsPayrollStagingMode] = useState<boolean>(false);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode] = useState<'create' | 'edit'>('create');
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);

  useEffect(() => {
    fetchDbEmployees();
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const fetchDbEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Empleado[]>(API_BASE_URL);
      setDbEmployees(res.data);
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  const handleSaveModalEmpleado = async (empleado: Empleado) => {
    if (modalMode === 'edit' || selectedEmpleado) {
      await axios.put(`${API_BASE_URL}/${empleado.codigo}`, empleado);
      showNotification(`Empleado '${empleado.nombres}' actualizado exitosamente.`, 'success');
    } else {
      await axios.post(API_BASE_URL, empleado);
      showNotification(`Empleado '${empleado.nombres}' creado exitosamente.`, 'success');
    }
    fetchDbEmployees();
  };

  const handleEstatusChange = async (empleado: Empleado, nuevoEstatus: string) => {
    const empleadoActualizado = { ...empleado, eStatus: nuevoEstatus };
    setUpdatingCodigo(empleado.codigo);
    try {
      await axios.put(`${API_BASE_URL}/${empleado.codigo}`, empleadoActualizado);
      setDbEmployees((prev) =>
        prev.map((item) => (item.codigo === empleado.codigo ? empleadoActualizado : item))
      );
    } catch (err) {
      fetchDbEmployees();
    } finally {
      setUpdatingCodigo(null);
    }
  };

  const handleDeleteIndividualEmpleado = (codigo: string) => {
    Swal.fire({
      title: '¿Eliminar Empleado?',
      text: `¿Estás seguro de eliminar al empleado '${codigo}'?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#f43f5e',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'rounded-2xl shadow-2xl border border-slate-200 font-sans',
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        setLoading(true);
        try {
          await axios.delete(`${API_BASE_URL}/${codigo}`);
          fetchDbEmployees();
        } catch (err) {
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const handleFileUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    setLoading(true);
    try {
      const res = await axios.post<PreviewNominaResponse>(`${API_NOMINA_URL}/preview-quincena`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreviewNominaData(res.data);
      setIsPayrollStagingMode(true);
    } catch (err: any) {
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayrollItem = (index: number, field: keyof NominaItem, value: any) => {
    if (!previewNominaData) return;

    const updatedItems = [...previewNominaData.items];
    const item = { ...updatedItems[index], [field]: value };

    if (field === 'totalDevengado' || field === 'totalDeducciones') {
      item.netoAPagar = (item.totalDevengado || 0) - (item.totalDeducciones || 0);
    }

    updatedItems[index] = item;

    const newTotalDevengado = updatedItems.reduce((acc, i) => acc + (i.totalDevengado || 0), 0);
    const newTotalDeducciones = updatedItems.reduce((acc, i) => acc + (i.totalDeducciones || 0), 0);
    const newTotalNeto = updatedItems.reduce((acc, i) => acc + (i.netoAPagar || 0), 0);

    setPreviewNominaData({
      ...previewNominaData,
      resumenTotales: {
        totalDevengado: newTotalDevengado,
        totalDeducciones: newTotalDeducciones,
        totalNeto: newTotalNeto,
      },
      items: updatedItems,
    });
  };

  const handleConfirmSavePayroll = async (quincena?: string, mes?: number) => {
    if (!previewNominaData || previewNominaData.items.length === 0) return;
    const hoy = new Date();
    const mesActual = mes || (hoy.getMonth() + 1);
    const quincenaActual = quincena || (hoy.getDate() <= 15 ? '1Q' : '2Q');
    const conceptoActual = `Nómina Quincenal ${quincenaActual} - Mes ${mesActual}`;
    setIsSaving(true);
    try {
      await axios.post(
        `${API_NOMINA_URL}/procesar-quincena?mes=${mesActual}&quincena=${quincenaActual}&concepto=${encodeURIComponent(conceptoActual)}`,
        previewNominaData.items
      );
      showNotification(`Nómina ${quincenaActual} (Mes ${mesActual}) guardada en el histórico con éxito.`, 'success');
      
      // <-- AGREGAR ESTAS DOS LÍNEAS AQUÍ:
      setIsPayrollStagingMode(false);
      setPreviewNominaData(null);
    } catch (err: any) {
      showNotification('Error al guardar la quincena en el histórico.', 'error');
    } finally {
      setIsSaving(false);
    }
  };


  // BÚSQUEDA Y FILTRADO LOCAL POR ESTATUS (Sin tocar la BD masivamente)
  const filteredEmployees = dbEmployees.filter((emp) => {
    const matchesSearch =
      emp.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (emp.puesto && emp.puesto.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'TODOS' || emp.eStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalActivos = dbEmployees.filter((e) => e.eStatus === 'ACTIVO').length;
  const totalInactivos = dbEmployees.filter((e) => e.eStatus === 'INACTIVO').length;

  return {
    dbEmployees,
    filteredEmployees,
    previewNominaData,
    isPayrollStagingMode,
    loading,
    isSaving,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    notification,
    setNotification,
    updatingCodigo,
    isModalOpen,
    setIsModalOpen,
    modalMode,
    selectedEmpleado,
    setSelectedEmpleado,
    totalActivos,
    totalInactivos,
    fetchDbEmployees,
    handleSaveModalEmpleado,
    handleEstatusChange,
    handleDeleteIndividualEmpleado,
    handleFileUpload,
    handleUpdatePayrollItem,
    handleConfirmSavePayroll,
    setIsPayrollStagingMode,
    setPreviewNominaData,
  };
};