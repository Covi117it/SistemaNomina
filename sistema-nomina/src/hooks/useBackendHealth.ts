import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

export function useBackendHealth() {
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Conectando con el servidor y la base de datos...');
  const [isTimeout, setIsTimeout] = useState(false);

  const checkBackend = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/health`, { timeout: 2500 });
      // Verifica que el backend responda 200 y que la base de datos esté explícitamente conectada
      if (res.status === 200) {
        if (res.data?.database === 'Connected' || res.data?.status === 'Online') {
          setStatusMessage('Servidor y base de datos listos.');
          setIsBackendReady(true);
          return true;
        } else {
          setStatusMessage('El servidor está en línea. Esperando a que la base de datos complete la inicialización...');
          return false;
        }
      }
      return false;
    } catch (err: any) {
      if (err.response?.status === 503) {
        setStatusMessage('Servidor detectado. Inicializando conexión con la base de datos...');
      } else {
        setStatusMessage('Esperando a que el backend y la base de datos inicien...');
      }
      return false;
    }
  }, []);

  useEffect(() => {
    let intervalId: any;
    let attempts = 0;
    const timeoutThreshold = 60; // 30 segundos (a 500ms por intento)

    const poll = async () => {
      attempts++;
      const ready = await checkBackend();
      if (ready) {
        clearInterval(intervalId);
      } else if (attempts >= timeoutThreshold) {
        setIsTimeout(true);
      }
    };

    poll();
    intervalId = setInterval(poll, 500);

    return () => clearInterval(intervalId);
  }, [checkBackend]);

  const retryConnection = () => {
    setIsTimeout(false);
    setStatusMessage('Reintentando conexión...');
    checkBackend();
  };

  return { isBackendReady, statusMessage, isTimeout, retryConnection };
}
