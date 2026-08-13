import React from 'react';
import { LucideIcon, ArrowRight, ChevronRight } from 'lucide-react';

export interface ModuleCardAction {
  label: string;
  onClick: () => void;
}

export interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeVariant?: 'emerald' | 'slate' | 'amber';
  primaryAction: ModuleCardAction;
  secondaryActions?: ModuleCardAction[];
  featured?: boolean;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  description,
  icon: Icon,
  badgeText,
  badgeVariant = 'slate',
  primaryAction,
  secondaryActions,
  featured = false,
}) => {
  const badgeStyles = {
    emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  return (
    <div
      className={`group relative rounded-[26px] p-6 transition-all duration-300 flex flex-col justify-between border ${
        featured
          ? 'bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800 text-white border-slate-800 shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:border-slate-700'
          : 'bg-white text-slate-900 border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300'
      }`}
    >
      <div>
        {/* Header: Icon & Badge */}
        <div className="flex items-center justify-between mb-5">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105 ${
              featured
                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
            }`}
          >
            <Icon className="w-6 h-6" />
          </div>

          {badgeText && (
            <span
              className={`px-3 py-1 text-[11px] font-extrabold rounded-full border ${badgeStyles[badgeVariant]}`}
            >
              {badgeText}
            </span>
          )}
        </div>

        {/* Content: Title & Description */}
        <h3
          className={`text-lg font-extrabold tracking-tight mb-2 ${
            featured ? 'text-white' : 'text-slate-900'
          }`}
        >
          {title}
        </h3>
        <p
          className={`text-xs leading-relaxed font-normal ${
            featured ? 'text-slate-300' : 'text-slate-500'
          }`}
        >
          {description}
        </p>
      </div>

      {/* Actions Section */}
      <div className="mt-6 space-y-3">
        {/* Primary Action Button */}
        <button
          onClick={primaryAction.onClick}
          className={`w-full py-3 px-4 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center justify-between cursor-pointer ${
            featured
              ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20'
              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
          }`}
        >
          <span>{primaryAction.label}</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>

        {/* Secondary Quick Action Links */}
        <div className="min-h-[28px] flex items-center flex-wrap gap-2">
          {secondaryActions && secondaryActions.length > 0 && (
            secondaryActions.map((action, idx) => (
              <button
                key={idx}
                onClick={action.onClick}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer ${
                  featured
                    ? 'text-slate-400 hover:text-emerald-400 hover:bg-slate-800/60'
                    : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{action.label}</span>
                <ChevronRight className="w-3 h-3 opacity-60" />
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
