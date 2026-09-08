import React from 'react';

export type StatCardVariant = 'dark' | 'slate' | 'emerald' | 'indigo' | 'rose' | 'amber';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  variant?: StatCardVariant;
  trendText?: string;
}

const variantStyles: Record<
  StatCardVariant,
  { card: string; iconBadge: string; labelText: string; valueText: string; trendText: string }
> = {
  dark: {
    card: 'bg-white border border-slate-200/70 shadow-xs hover:border-slate-300',
    iconBadge: 'bg-slate-100 text-slate-700 border border-slate-200/70',
    labelText: 'text-slate-500 font-medium',
    valueText: 'text-slate-900',
    trendText: 'text-[#0d784a] font-medium',
  },
  slate: {
    card: 'bg-white border border-slate-200/70 shadow-xs hover:border-slate-300',
    iconBadge: 'bg-slate-100 text-slate-700 border border-slate-200/70',
    labelText: 'text-slate-500 font-medium',
    valueText: 'text-slate-900',
    trendText: 'text-[#0d784a] font-medium',
  },
  emerald: {
    card: 'bg-white border border-slate-200/70 shadow-xs hover:border-slate-300',
    iconBadge: 'bg-[#e6f7ef] text-[#0d784a] border border-[#bcecd4]',
    labelText: 'text-slate-500 font-medium',
    valueText: 'text-slate-900',
    trendText: 'text-[#0d784a] font-medium',
  },
  indigo: {
    card: 'bg-white border border-slate-200/70 shadow-xs hover:border-slate-300',
    iconBadge: 'bg-indigo-50 text-indigo-700 border border-indigo-200/70',
    labelText: 'text-slate-500 font-medium',
    valueText: 'text-slate-900',
    trendText: 'text-[#0d784a] font-medium',
  },
  rose: {
    card: 'bg-white border border-slate-200/70 shadow-xs hover:border-slate-300',
    iconBadge: 'bg-rose-50 text-rose-700 border border-rose-200/70',
    labelText: 'text-slate-500 font-medium',
    valueText: 'text-slate-900',
    trendText: 'text-rose-600 font-medium',
  },
  amber: {
    card: 'bg-white border border-slate-200/70 shadow-xs hover:border-slate-300',
    iconBadge: 'bg-amber-50 text-amber-700 border border-amber-200/70',
    labelText: 'text-slate-500 font-medium',
    valueText: 'text-slate-900',
    trendText: 'text-[#0d784a] font-medium',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  variant = 'slate',
  trendText,
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={`rounded-[22px] p-5 flex flex-col justify-between min-h-[128px] transition-all duration-200 ${styles.card}`}
    >
      {/* Upper row: Label on left, Icon Badge on right */}
      <div className="flex items-start justify-between gap-2">
        <p className={`text-xs ${styles.labelText}`}>
          {label}
        </p>
        {icon && (
          <div className={`p-2 rounded-xl flex items-center justify-center shrink-0 ${styles.iconBadge}`}>
            {icon}
          </div>
        )}
      </div>

      {/* Middle row: Large value */}
      <div className="flex items-center justify-between my-2 gap-3">
        <h3 className={`text-3xl font-extrabold tracking-tight ${styles.valueText}`}>
          {value}
        </h3>
      </div>

      {/* Bottom row: Trend or comparative metric if provided */}
      {trendText && (
        <p className={`text-[11px] mt-1 ${styles.trendText}`}>
          {trendText}
        </p>
      )}
    </div>
  );
};