import React from 'react';
import { Empleado } from '../types/empleado';
import { EmployeeKpiCards } from '../components/employees/EmployeeKpiCards';
import { EmployeeToolbar } from '../components/employees/EmployeeToolbar';
import { EmployeeTable } from '../components/employees/EmployeeTable';
import { UserPlus, UploadCloud, History} from 'lucide-react';

interface EmployeesPageProps {
  employees: Empleado[];
  totalTotal: number;
  totalActivos: number;
  totalInactivos: number;
  searchTerm: string;
  statusFilter: 'TODOS' | 'ACTIVO' | 'INACTIVO';
  loading: boolean;
  updatingCodigo: string | null;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (status: 'TODOS' | 'ACTIVO' | 'INACTIVO') => void;
  onRefresh: () => void;
  onDoubleClickRow: (emp: Empleado) => void;
  onEstatusChange: (emp: Empleado, estatus: string) => void;
  onEditClick: (emp: Empleado) => void;
  onDeleteClick: (codigo: string) => void;
  onNavigateToCreate: () => void;
  onNavigateToPayroll: () => void;
  onNavigateToHistory: () => void;
  onNavigateToDistribution: () => void;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({
  employees,
  totalTotal,
  totalActivos,
  totalInactivos,
  searchTerm,
  statusFilter,
  loading,
  updatingCodigo,
  onSearchChange,
  onStatusFilterChange,
  onRefresh,
  onDoubleClickRow,
  onEstatusChange,
  onEditClick,
  onDeleteClick,
  onNavigateToCreate,
  onNavigateToPayroll,
  onNavigateToHistory,
}) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Maestro de Empleados y Pagos
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onNavigateToCreate}
            className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-emerald-400" />
            + Nuevo Empleado
          </button>

          <button
            onClick={onNavigateToPayroll}
            className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            Procesar Nómina Quincenal
          </button>

          <button
            onClick={onNavigateToHistory}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-all flex items-center gap-2 cursor-pointer"
          >
            <History className="w-4 h-4 text-indigo-600" />
            Histórico
          </button>
        </div>
      </div>

      <EmployeeKpiCards total={totalTotal} activos={totalActivos} inactivos={totalInactivos} />

      <EmployeeToolbar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        onRefresh={onRefresh}
        loading={loading}
      />

      <EmployeeTable
        employees={employees}
        updatingCodigo={updatingCodigo}
        onDoubleClickRow={onDoubleClickRow}
        onEstatusChange={onEstatusChange}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
      />
    </div>
  );
};