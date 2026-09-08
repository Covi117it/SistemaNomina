import React from 'react';
import { StatCard } from '../common/StatCard';
import { Users, UserCheck, UserX } from 'lucide-react';

interface QuickMetricsBannerProps {
  totalTotal: number;
  totalActivos: number;
  totalInactivos: number;
  loading?: boolean;
}

export const QuickMetricsBanner: React.FC<QuickMetricsBannerProps> = ({
  totalTotal,
  totalActivos,
  totalInactivos,
  loading = false,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <StatCard
        label="Total de Empleados"
        value={loading ? '...' : totalTotal}
        icon={<Users className="w-5 h-5 text-slate-700" />}
        variant="slate"
        trendText="Registrados en maestro"
      />
      <StatCard
        label="Empleados Activos"
        value={loading ? '...' : totalActivos}
        icon={<UserCheck className="w-5 h-5 text-[#0d784a]" />}
        variant="emerald"
        trendText="Elegibles para nómina"
      />
      <StatCard
        label="Empleados Inactivos"
        value={loading ? '...' : totalInactivos}
        icon={<UserX className="w-5 h-5 text-slate-500" />}
        variant="slate"
        trendText="Inhabilitados en base de datos"
      />
    </div>
  );
};
