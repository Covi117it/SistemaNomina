import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import { Empleado } from '../types/empleado';
import { employeeApi } from '../service/api/employeeApi';

export const useEmployees = () => {
  const [dbEmployees, setDbEmployees] = useState<Empleado[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'TODOS' | 'ACTIVO' | 'INACTIVO'>('TODOS');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [updatingCodigo, setUpdatingCodigo] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode] = useState<'create' | 'edit'>('create');
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
  };

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalTotal, setTotalTotal] = useState<number>(0);
  const [totalActivos, setTotalActivos] = useState<number>(0);
  const [totalInactivos, setTotalInactivos] = useState<number>(0);
  const [totalFiltrados, setTotalFiltrados] = useState<number>(0);

  const fetchDbEmployees = async (retries = 3) => {
    setLoading(true);
    try {
      const data = await employeeApi.fetchEmployees(searchTerm, statusFilter, currentPage, pageSize);
      let list: Empleado[] = [];
      let tot = 0;
      let act = 0;
      let inact = 0;
      let filt = 0;
      let pages = 1;

      if (Array.isArray(data)) {
        list = data;
        act = list.filter((e) => e.eStatus === 'ACTIVO').length;
        inact = list.filter((e) => e.eStatus === 'INACTIVO').length;
        tot = act + inact;
        filt = list.length;
        pages = Math.ceil(filt / pageSize) || 1;
      } else if (data && typeof data === 'object') {
        list = data.empleados || [];
        act = data.totalActivos ?? 0;
        inact = data.totalInactivos ?? 0;
        tot = data.totalTotal ?? (act + inact);
        filt = data.totalFiltrados ?? list.length;
        pages = data.totalPages ?? (Math.ceil(filt / pageSize) || 1);
      }

      setDbEmployees(list);
      setTotalTotal(tot);
      setTotalActivos(act);
      setTotalInactivos(inact);
      setTotalFiltrados(filt);
      setTotalPages(pages);
    } catch (err) {
      console.error('Error cargando empleados:', err);
      if (retries > 0) {
        setTimeout(() => fetchDbEmployees(retries - 1), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDbEmployees();
  }, [searchTerm, statusFilter, currentPage, pageSize]);

  // Al cambiar filtros o búsquedas, volver a la página 1
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const handleSaveModalEmpleado = async (empleado: Empleado, isEdit: boolean = false) => {
    try {
      if (isEdit || (selectedEmpleado && selectedEmpleado.codigo === empleado.codigo)) {
        await employeeApi.updateEmployee(empleado.codigo, empleado);
        showNotification(`Empleado '${empleado.nombres}' actualizado exitosamente.`, 'success');
      } else {
        await employeeApi.createEmployee(empleado);
        showNotification(`Empleado '${empleado.nombres}' creado exitosamente.`, 'success');
      }
      fetchDbEmployees();
    } catch (err: any) {
      const msg = err.response?.data?.mensaje || err.message || 'Error al guardar el empleado.';
      Swal.fire({
        title: 'No se pudo guardar',
        text: msg,
        icon: 'error',
        confirmButtonColor: '#10b981',
        customClass: {
          popup: 'rounded-2xl shadow-2xl border border-slate-200 font-sans',
        },
      });
      throw err;
    }
  };

  const handleEstatusChange = async (empleado: Empleado, nuevoEstatus: string) => {
    const empleadoActualizado = { ...empleado, eStatus: nuevoEstatus };
    setUpdatingCodigo(empleado.codigo);
    try {
      await employeeApi.updateEmployee(empleado.codigo, empleadoActualizado);
      await fetchDbEmployees();
    } catch (err) {
      await fetchDbEmployees();
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
          await employeeApi.deleteEmployee(codigo);
          fetchDbEmployees();
        } catch (err) {
        } finally {
          setLoading(false);
        }
      }
    });
  };

  return {
    dbEmployees,
    loading,
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
    totalTotal,
    totalActivos,
    totalInactivos,
    totalFiltrados,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    fetchDbEmployees,
    handleSaveModalEmpleado,
    handleEstatusChange,
    handleDeleteIndividualEmpleado,
  };
};