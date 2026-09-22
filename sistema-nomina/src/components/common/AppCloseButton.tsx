import React, { useState } from 'react';
import { Power } from 'lucide-react';
import Swal from 'sweetalert2';
import { exit } from '@tauri-apps/plugin-process';
import { getCurrentWindow } from '@tauri-apps/api/window';

export const AppCloseButton: React.FC = () => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = async () => {
    if (isClosing) return;

    const result = await Swal.fire({
      title: '¿Cerrar aplicación?',
      text: '¿Estás seguro de que deseas salir del Sistema de Nómina? Asegúrate de haber guardado cualquier cambio pendiente.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, salir',
      cancelButtonText: 'Cancelar',
      reverseButtons: true,
      focusCancel: true,
    });

    if (result.isConfirmed) {
      setIsClosing(true);
      try {
        await exit(0);
      } catch (err) {
        console.warn('Tauri plugin-process exit failed, attempting window close:', err);
        try {
          await getCurrentWindow().close();
        } catch {
          window.close();
        }
      } finally {
        setIsClosing(false);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClose}
      disabled={isClosing}
      title="Cerrar aplicación"
      aria-label="Cerrar aplicación"
      className="fixed top-3.5 right-4 sm:top-4 sm:right-6 z-40 group flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/80 hover:bg-rose-50/90 text-slate-500 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200/90 backdrop-blur-md shadow-xs hover:shadow-sm transition-all duration-200 ease-out active:scale-95 cursor-pointer select-none"
    >
      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-slate-100/80 group-hover:bg-rose-100/90 text-slate-500 group-hover:text-rose-600 transition-colors">
        <Power className="w-3 h-3 stroke-[2.5]" />
      </div>
      <span className="text-[11px] font-bold tracking-tight pr-1 text-slate-600 group-hover:text-rose-600 transition-colors">
        {isClosing ? 'Saliendo...' : 'Salir'}
      </span>
    </button>
  );
};
