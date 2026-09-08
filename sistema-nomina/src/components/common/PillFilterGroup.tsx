export interface PillOption<T extends string = string> {
  key: T;
  label: string;
  count?: number;
}

interface PillFilterGroupProps<T extends string = string> {
  title?: string;
  options: PillOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export function PillFilterGroup<T extends string = string>({
  title,
  options,
  value,
  onChange,
  className = '',
}: PillFilterGroupProps<T>) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {title && (
        <span className="text-xs font-extrabold text-slate-900 tracking-tight whitespace-nowrap">
          {title}
        </span>
      )}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none shrink-0">
        {options.map((opt) => {
          const isActive = value === opt.key;
          return (
            <button
              key={opt.key}
              onClick={() => onChange(opt.key)}
              className={`px-4 py-2 text-xs font-semibold rounded-full transition-all cursor-pointer whitespace-nowrap focus:outline-none flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#10b981] text-white shadow-xs'
                  : 'bg-white hover:bg-slate-100/80 text-slate-600 border border-slate-200/80 shadow-2xs'
              }`}
            >
              <span>{opt.label}</span>
              {opt.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold transition-colors ${
                    isActive ? 'bg-[#059669] text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {opt.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
