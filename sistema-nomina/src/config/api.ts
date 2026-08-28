export const API_URL = import.meta.env.VITE_API_URL || 'https://sistemanomina.onrender.com';

export const ENDPOINTS = {
  HEALTH: `${API_URL}/api/health`,
  EMPLEADOS: `${API_URL}/api/empleados`,
  NOMINA: `${API_URL}/api/nomina`,
  CONFIG: `${API_URL}/api/config`,
};