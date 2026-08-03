import React from 'react';
import { RefreshCw, Filter } from 'lucide-react';
import { SearchInput } from '../common/SearchInput';

interface EmployeeToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: 'TODOS' | 'ACTIVO' | 'INACTIVO';
  onStatusFilterChange: (status: 'TODOS' | 'ACTIVO' | 'INACTIVO') => void;
  onRefresh: () => void;
  loading: boolean;
}

export const EmployeeToolbar: React.FC<EmployeeToolbarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  loading,
}) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
      <SearchInput
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Buscar empleado por nombre, cédula, código, puesto..."
      />
      <div className="flex items-center gap-2.5 w-full md:w-auto">
        <button
          onClick={() => onStatusFilterChange(statusFilter === 'ACTIVO' ? 'TODOS' : 'ACTIVO')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none ${
            statusFilter === 'ACTIVO'
              ? 'bg-emerald-500 text-white border-emerald-600 shadow-md shadow-emerald-500/20'
              : 'bg-emerald-50 hover:bg-emerald-100/80 text-emerald-700 border-emerald-200'
          }`}
        >
          <Filter className={`w-3.5 h-3.5 ${statusFilter === 'ACTIVO' ? 'text-white' : 'text-emerald-600'}`} />
          Solo Activos
        </button>

        <button
          onClick={() => onStatusFilterChange(statusFilter === 'INACTIVO' ? 'TODOS' : 'INACTIVO')}
          className={`px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer focus:outline-none ${
            statusFilter === 'INACTIVO'
              ? 'bg-slate-200 border-slate-300 text-slate-900 font-extrabold shadow-sm'
              : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
          }`}
        >
          Ver Inactivos
        </button>

        <button
          onClick={onRefresh}
          className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all cursor-pointer shadow-sm focus:outline-none"
          title="Actualizar tabla"
        >
          <RefreshCw className={`w-4 h-4 text-emerald-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  );
};