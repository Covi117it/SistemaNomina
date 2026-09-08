import { invoke } from '@tauri-apps/api/core';

export const secureStorage = {

  async guardarToken(token: string): Promise<void> {
    try {
      await invoke('guardar_token_seguro', { token });
    } catch (err) {
      console.warn('[secureStorage] Fallo al guardar en Keyring, usando fallback seguro:', err);
      localStorage.setItem('auth_session_token_fallback', token);
    }
  },

  async obtenerToken(): Promise<string | null> {
    try {
      const token = await invoke<string | null>('obtener_token_seguro');
      if (token) return token;
    } catch (err) {
      console.warn('[secureStorage] Fallo al leer de Keyring, usando fallback seguro:', err);
    }
    return localStorage.getItem('auth_session_token_fallback');
  },

  async eliminarToken(): Promise<void> {
    try {
      await invoke('eliminar_token_seguro');
    } catch (err) {
      console.warn('[secureStorage] Fallo al eliminar de Keyring:', err);
    }
    localStorage.removeItem('auth_session_token_fallback');
  }
};