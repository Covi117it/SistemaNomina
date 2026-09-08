import React from 'react';
import { Loader2 } from 'lucide-react';

export const BackendLoader: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#f4f7f4] flex flex-col items-center justify-center gap-4 p-8">
      <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
      <div className="text-center">
        <h2 className="text-lg font-bold text-slate-800">Iniciando Sistema de Nómina</h2>
        <p className="text-sm text-slate-500 mt-1">Conectando con el servidor y la base de datos...</p>
      </div>
    </div>
  );
};
