import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:5289' : 'https://sistemanomina.onrender.com');

export const ENDPOINTS = {
  HEALTH: `${API_URL}/api/health`,
  EMPLEADOS: `${API_URL}/api/empleados`,
  NOMINA: `${API_URL}/api/nomina`,
  CONFIG: `${API_URL}/api/config`,
  AUTH: `${API_URL}/api/auth`,
  USUARIOS: `${API_URL}/api/usuarios`,
};

axios.interceptors.request.use((config) => {
  try {
    const authData = localStorage.getItem('auth_user');
    if (authData) {
      const user = JSON.parse(authData);
      if (user?.tokenSesion) {
        config.headers.Authorization = `Bearer ${user.tokenSesion}`;
      }
    }
  } catch (error) {
    console.error('[Axios] Error al adjuntar token de autorización:', error);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn('[Axios] Sesión expirada o no autorizada (401). Limpiando credenciales...');
      localStorage.removeItem('auth_user');
    }
    return Promise.reject(error);
  }
);