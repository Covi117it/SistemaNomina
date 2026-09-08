import { useEffect } from 'react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { invoke } from '@tauri-apps/api/core';

export function useTauriUpdater() {
  useEffect(() => {
    async function checkForUpdates() {
      try {
        const update = await check();
        if (update) {
          await invoke('log_terminal', { msg: `🔔 Nueva versión encontrada: v${update.version} (actual: v${update.currentVersion})` });
          await invoke('log_terminal', { msg: '⏳ Descargando paquete de actualización en segundo plano...' });
          
          await update.downloadAndInstall();
          
          await invoke('log_terminal', { msg: '✅ ¡Descarga completada! Reiniciando aplicación...' });
          await relaunch();
        } else {
          await invoke('log_terminal', { msg: '✨ La aplicación está actualizada a la última versión disponible.' });
        }
      } catch (error) {
        console.error('Error al comprobar actualizaciones:', error);
      }
    }
    checkForUpdates();
  }, []);
}
