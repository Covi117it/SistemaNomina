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
      <StatCard
        label="total empleados"
        value={total}
        icon={<Users className="w-4 h-4" />}
        variant="slate"
      />
      <StatCard
        label="empleados activos"
        value={activos}
        icon={<UserCheck className="w-4 h-4" />}
        variant="emerald"
      />
      <StatCard
        label="empleados inactivos"
        value={inactivos}
        icon={<UserX className="w-4 h-4" />}
        variant="rose"
      />
    </div>
  );
};