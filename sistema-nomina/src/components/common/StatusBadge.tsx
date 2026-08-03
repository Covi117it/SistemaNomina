import React from 'react';
import { CheckCircle2, AlertTriangle, ShieldCheck, Clock } from 'lucide-react';

export type StatusType = 'ACTIVO' | 'INACTIVO' | 'Registrado' | 'No Existe' | 'Pendiente';

interface StatusBadgeProps {
  status: StatusType | string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'ACTIVO':
    case 'Registrado':
      return (
        <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full border border-emerald-200 inline-flex items-center gap-1">
          {status === 'Registrado' ? <ShieldCheck className="w-3 h-3 text-emerald-600" /> : <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
          {status}
        </span>
      );
    case 'INACTIVO':
      return (
        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-extrabold rounded-full border border-amber-200 inline-flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-amber-600" />
          INACTIVO
        </span>
      );
    case 'No Existe':
      return (
        <span className="px-2.5 py-0.5 bg-rose-100 text-rose-800 text-[10px] font-extrabold rounded-full border border-rose-200 inline-flex items-center gap-1">
          <AlertTriangle className="w-3 h-3 text-rose-600" />
          No Existe
        </span>
      );
    case 'Pendiente':
      return (
        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-extrabold rounded-full border border-slate-200 inline-flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-500" />
          Pendiente
        </span>
      );
    default:
      return (
        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full border border-slate-200">
          {status}
        </span>
      );
  }
};