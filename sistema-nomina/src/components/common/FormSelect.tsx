import React from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';

export interface FormSelectOption {
  label: string;
  value: string;
}

interface FormSelectProps {
  options: FormSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  icon,
  disabled = false,
  className = '',
}) => {
  return (
    <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
      <Select.Trigger
        className={`inline-flex items-center justify-between gap-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-800 shadow-sm cursor-pointer focus:bg-white focus:border-emerald-500 focus:outline-none transition-all ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        } ${className}`}
      >
        <div className="flex items-center gap-2">
          {icon}
          <Select.Value placeholder={placeholder} />
        </div>
        <Select.Icon>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 min-w-[180px] max-h-60 overflow-y-auto z-50 animate-in fade-in zoom-in-95"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport className="space-y-1">
            {options.map((opt) => (
              <Select.Item
                key={opt.value}
                value={opt.value}
                className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg cursor-pointer outline-none transition-colors data-[state=checked]:bg-emerald-50 data-[state=checked]:text-emerald-700"
              >
                <Select.ItemText>{opt.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};