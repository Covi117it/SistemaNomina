import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  durationMs?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type,
  onClose,
  durationMs = 3500, // Se oculta automáticamente a los 3.5 segundos
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, durationMs);

    return () => clearTimeout(timer);
  }, [message, onClose, durationMs]);

  return (
    <div
      className={`fixed top-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-xl border text-sm font-medium flex items-center gap-3 animate-in fade-in slide-in-from-top-4 transition-all ${
        type === 'success'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-emerald-500/10'
          : 'bg-rose-50 border-rose-200 text-rose-900 shadow-rose-500/10'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
      ) : (
        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
      )}
      <span className="text-slate-800 font-medium">{message}</span>
      <button
        onClick={onClose}
        className="p-1 hover:bg-slate-200/60 rounded-lg transition-colors text-slate-400 hover:text-slate-600 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};