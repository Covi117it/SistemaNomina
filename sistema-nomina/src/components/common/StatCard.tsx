import React from 'react';

export type StatCardVariant = 'slate' | 'emerald' | 'indigo' | 'rose' | 'amber';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  variant?: StatCardVariant;
}

const variantStyles: Record<StatCardVariant, { card: string; icon: string; text: string }> = {
  slate: {
    card: 'bg-white border-slate-200/80',
    icon: 'bg-slate-100 text-slate-600',
    text: 'text-slate-900',
  },
  emerald: {
    card: 'bg-white border-emerald-200',
    icon: 'bg-emerald-50 text-emerald-600',
    text: 'text-emerald-700',
  },
  indigo: {
    card: 'bg-white border-indigo-200',
    icon: 'bg-indigo-50 text-indigo-600',
    text: 'text-indigo-700',
  },
  rose: {
    card: 'bg-rose-50/50 border-rose-200',
    icon: 'bg-rose-100 text-rose-600',
    text: 'text-rose-600',
  },
  amber: {
    card: 'bg-amber-50/50 border-amber-200',
    icon: 'bg-amber-100 text-amber-600',
    text: 'text-amber-700',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  variant = 'slate',
}) => {
  const styles = variantStyles[variant];

  return (
    <div className={`border rounded-2xl p-4 flex items-center justify-between shadow-sm ${styles.card}`}>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
          {label}
        </p>
        <h3 className={`text-xl font-black mt-1 ${styles.text}`}>
          {value}
        </h3>
      </div>
      <div className={`p-3 rounded-xl ${styles.icon}`}>
        {icon}
      </div>
    </div>
  );
};