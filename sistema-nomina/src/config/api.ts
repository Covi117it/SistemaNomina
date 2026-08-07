export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5289';

export const ENDPOINTS = {
  EMPLEADOS: `${API_URL}/api/empleados`,
  NOMINA: `${API_URL}/api/nomina`,
  CONFIG: `${API_URL}/api/config`,
};