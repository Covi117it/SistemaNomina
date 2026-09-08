import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

export function useBackendHealth() {
  const [isBackendReady, setIsBackendReady] = useState(false);

  useEffect(() => {
    let intervalId: any;
    let attempts = 0;
    const maxAttempts = 30; // 15 segundos máximo

    const checkBackend = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/health`, { timeout: 800 });
        if (res.status === 200) {
          setIsBackendReady(true);
          clearInterval(intervalId);
        }
      } catch {
        attempts++;
        if (attempts >= maxAttempts) {
          clearInterval(intervalId);
          setIsBackendReady(true);
        }
      }
    };

    checkBackend();
    intervalId = setInterval(checkBackend, 300);

    return () => clearInterval(intervalId);
  }, []);

  return { isBackendReady };
}
