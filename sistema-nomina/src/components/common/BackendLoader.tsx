import React from 'react';
import { Loader2, RefreshCw } from 'lucide-react';

interface BackendLoaderProps {
  statusMessage?: string;
  isTimeout?: boolean;
  onRetry?: () => void;
}

export const BackendLoader: React.FC<BackendLoaderProps> = ({
  statusMessage = 'Conectando con el servidor y la base de datos...',
  isTimeout = false,
  onRetry,
}) => {
  return (
    <div className="min-h-screen bg-[#f4f7f4] flex flex-col items-center justify-center gap-4 p-8 select-none">
      <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      <div className="text-center max-w-sm">
        <h2 className="text-lg font-bold text-slate-800">Iniciando Sistema de Nómina</h2>
        <p className="text-sm text-slate-500 mt-1 transition-all">{statusMessage}</p>
        {isTimeout && onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 mx-auto cursor-pointer active:scale-95"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reintentar Conexión
          </button>
        )}
      </div>
    </div>
  );
};
