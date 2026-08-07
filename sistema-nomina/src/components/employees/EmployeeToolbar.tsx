import React from 'react';
import { RefreshCw } from 'lucide-react';
import { SearchInput } from '../common/SearchInput';
import { PillFilterGroup, PillOption } from '../common/PillFilterGroup';

interface EmployeeToolbarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: 'TODOS' | 'ACTIVO' | 'INACTIVO';
  onStatusFilterChange: (status: 'TODOS' | 'ACTIVO' | 'INACTIVO') => void;
  onRefresh: () => void;
  loading: boolean;
  total?: number;
  activos?: number;
  inactivos?: number;
}

export const EmployeeToolbar: React.FC<EmployeeToolbarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onRefresh,
  loading,
  total,
  activos,
  inactivos,
}) => {
  const filterOptions: PillOption<'TODOS' | 'ACTIVO' | 'INACTIVO'>[] = [
    { key: 'TODOS', label: 'Todos', count: total },
    { key: 'ACTIVO', label: 'Activos', count: activos },
    { key: 'INACTIVO', label: 'Inactivos', count: inactivos },
  ];

  return (
    <div className="space-y-4">
      {/* Search Input box */}
      <div className="bg-white border border-slate-200/70 rounded-[22px] p-4 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex-1">
          <SearchInput
            value={searchTerm}
            onChange={onSearchChange}
            placeholder="Buscar empleado por nombre, cédula, código, puesto..."
          />
        </div>
        <button
          onClick={onRefresh}
          className="p-2.5 bg-[#10b981] hover:bg-[#059669] text-white rounded-full transition-all cursor-pointer shadow-xs focus:outline-none shrink-0"
          title="Actualizar datos"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-white ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Pill Filter Row (Fila propia limpia debajo de la búsqueda) */}
      <div className="px-1 py-0.5">
        <PillFilterGroup<'TODOS' | 'ACTIVO' | 'INACTIVO'>
          title="Empleados"
          options={filterOptions}
          value={statusFilter}
          onChange={onStatusFilterChange}
        />
      </div>
    </div>
  );
};