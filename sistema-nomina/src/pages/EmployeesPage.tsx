import React from 'react';
import { Empleado } from '../types/empleado';
import { EmployeeKpiCards } from '../components/employees/EmployeeKpiCards';
import { EmployeeToolbar } from '../components/employees/EmployeeToolbar';
import { EmployeeTable } from '../components/employees/EmployeeTable';
import { ActionsDropdown } from '../components/common/ActionsDropdown';

interface EmployeesPageProps {
  employees: Empleado[];
  paginatedEmployees?: Empleado[];
  totalTotal: number;
  totalActivos: number;
  totalInactivos: number;
  totalItems?: number;
  searchTerm: string;
  statusFilter: 'TODOS' | 'ACTIVO' | 'INACTIVO';
  loading: boolean;
  updatingCodigo: string | null;
  currentPage?: number;
  totalPages?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (status: 'TODOS' | 'ACTIVO' | 'INACTIVO') => void;
  onRefresh: () => void;
  onDoubleClickRow: (emp: Empleado) => void;
  onEstatusChange: (emp: Empleado, estatus: string) => void;
  onEditClick: (emp: Empleado) => void;
  onDeleteClick: (codigo: string) => void;
  onNavigateToDashboard?: () => void;
  onNavigateToCreate: () => void;
  onNavigateToPayroll: () => void;
  onNavigateToHistory: () => void;
  onNavigateToDistribution?: () => void;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({
  employees,
  paginatedEmployees,
  totalTotal,
  totalActivos,
  totalInactivos,
  totalItems,
  searchTerm,
  statusFilter,
  loading,
  updatingCodigo,
  currentPage,
  totalPages,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onSearchChange,
  onStatusFilterChange,
  onRefresh,
  onDoubleClickRow,
  onEstatusChange,
  onEditClick,
  onDeleteClick,
  onNavigateToDashboard,
  onNavigateToCreate,
  onNavigateToPayroll,
  onNavigateToHistory,
  onNavigateToDistribution,
}) => {
  const displayEmployees = paginatedEmployees || employees;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <ActionsDropdown
          currentView="main-directory"
          onNavigateToDashboard={onNavigateToDashboard}
          onNavigateToCreate={onNavigateToCreate}
          onNavigateToPayroll={onNavigateToPayroll}
          onNavigateToHistory={onNavigateToHistory}
          onNavigateToDistribution={onNavigateToDistribution}
        />
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
          Maestro de Empleados y Pagos
        </h1>
      </div>

      <EmployeeKpiCards total={totalTotal} activos={totalActivos} inactivos={totalInactivos} />

      <EmployeeToolbar
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        statusFilter={statusFilter}
        onStatusFilterChange={onStatusFilterChange}
        onRefresh={onRefresh}
        loading={loading}
        total={totalTotal}
        activos={totalActivos}
        inactivos={totalInactivos}
      />

      <EmployeeTable
        employees={displayEmployees}
        updatingCodigo={updatingCodigo}
        onDoubleClickRow={onDoubleClickRow}
        onEstatusChange={onEstatusChange}
        onEditClick={onEditClick}
        onDeleteClick={onDeleteClick}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </div>
  );
};