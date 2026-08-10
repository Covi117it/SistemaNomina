import axios from 'axios';
import { Empleado } from '../../types/empleado';
import { ENDPOINTS } from '../../config/api';

export interface FetchEmployeesResponse {
  totalTotal: number;
  totalActivos: number;
  totalInactivos: number;
  totalFiltrados?: number;
  page?: number;
  pageSize?: number;
  totalPages?: number;
  empleados: Empleado[];
}

export const employeeApi = {
  fetchEmployees: async (
    search?: string,
    status?: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<FetchEmployeesResponse> => {
    const response = await axios.get(ENDPOINTS.EMPLEADOS, {
      params: {
        search: search || null,
        status: status && status !== 'TODOS' ? status : null,
        page,
        pageSize,
      },
    });
    
    if (Array.isArray(response.data)) {
      const list = response.data;
      const act = list.filter((e: any) => e.eStatus === 'ACTIVO').length;
      const inact = list.filter((e: any) => e.eStatus === 'INACTIVO').length;
      const totalFiltrados = list.length;
      const totalPages = Math.ceil(totalFiltrados / pageSize) || 1;
      const startIndex = (page - 1) * pageSize;
      const paginatedList = list.slice(startIndex, startIndex + pageSize);

      return {
        totalTotal: act + inact,
        totalActivos: act,
        totalInactivos: inact,
        totalFiltrados,
        page,
        pageSize,
        totalPages,
        empleados: paginatedList,
      };
    }
    return response.data;
  },

  createEmployee: async (empleado: Empleado): Promise<Empleado> => {
    const response = await axios.post(ENDPOINTS.EMPLEADOS, empleado);
    return response.data;
  },

  updateEmployee: async (codigo: string, empleado: Empleado): Promise<Empleado> => {
    const response = await axios.put(`${ENDPOINTS.EMPLEADOS}/${codigo}`, empleado);
    return response.data;
  },

  deleteEmployee: async (codigo: string): Promise<void> => {
    await axios.delete(`${ENDPOINTS.EMPLEADOS}/${codigo}`);
  },

  saveBatch: async (empleados: Empleado[]): Promise<{ mensaje: string; totalProcesados: number }> => {
    const response = await axios.post(`${ENDPOINTS.EMPLEADOS}/guardar-lote`, empleados);
    return response.data;
  },

  toggleAllStatus: async (nuevoEstatus: string): Promise<void> => {
    await axios.post(`${ENDPOINTS.EMPLEADOS}/toggle-estatus-todos`, null, {
      params: { nuevoEstatus },
    });
  },

  fetchNextSuggestedCode: async (): Promise<string> => {
    const response = await axios.get(`${ENDPOINTS.EMPLEADOS}/siguiente-codigo`);
    return response.data.siguienteCodigo;
  },
};