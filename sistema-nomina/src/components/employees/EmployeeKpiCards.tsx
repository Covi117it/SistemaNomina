import React from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
import { StatCard } from '../common/StatCard';

interface EmployeeKpiCardsProps {
  total: number;
  activos: number;
  inactivos: number;
}

export const EmployeeKpiCards: React.FC<EmployeeKpiCardsProps> = ({
  total,
  activos,
  inactivos,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard label="Total Empleados" value={total} icon={<Users className="w-5 h-5" />} variant="slate" />
      <StatCard label="Empleados Activos" value={activos} icon={<UserCheck className="w-5 h-5" />} variant="emerald" />
      <StatCard label="Empleados Inactivos" value={inactivos} icon={<UserX className="w-5 h-5" />} variant="slate" />
    </div>
  );
};