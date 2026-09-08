import React from 'react';
import { UserCheck, UserX } from 'lucide-react';

interface SystemStatisticsPanelProps {
  totalTotal: number;
  totalActivos: number;
  totalInactivos: number;
  loadingEmployees?: boolean;
}

export const SystemStatisticsPanel: React.FC<SystemStatisticsPanelProps> = ({
  totalTotal,
  totalActivos,
  totalInactivos,
  loadingEmployees = false,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
          Información del Sistema
        </h2>
      </div>

      <div className="space-y-3">
        {/* Metric 1: Total Empleados */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Empleados
            </p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              Registrados en maestro
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-900 font-black text-base flex items-center justify-center shadow-2xs">
            {loadingEmployees ? '...' : totalTotal}
          </div>
        </div>

        {/* Metric 2: Empleados Activos */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
          <div>
            <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
              Empleados Activos
            </p>
            <p className="text-xs font-semibold text-emerald-700/80 mt-0.5">
              Elegibles para nómina
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-[#144833] text-white font-black text-base flex items-center justify-center shadow-xs">
            {loadingEmployees ? '...' : totalActivos}
          </div>
        </div>

        {/* Metric 3: Empleados Inactivos */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <UserX className="w-3.5 h-3.5 text-slate-400 inline" />
              Empleados Inactivos
            </p>
            <p className="text-xs font-semibold text-slate-400 mt-0.5">
              Inhabilitados en base
            </p>
          </div>
          <div className="w-11 h-11 rounded-full bg-white border border-slate-200 text-slate-600 font-black text-base flex items-center justify-center shadow-2xs">
            {loadingEmployees ? '...' : totalInactivos}
          </div>
        </div>
      </div>
    </div>
  );
};
