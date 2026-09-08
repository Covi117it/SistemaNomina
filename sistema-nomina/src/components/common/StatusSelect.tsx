import React from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';

interface StatusSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export const StatusSelect: React.FC<StatusSelectProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const isActivo = value === 'ACTIVO';

  return (
    <Select.Root value={value} onValueChange={onChange} disabled={disabled}>
      <Select.Trigger
        className={`inline-flex items-center justify-between gap-2 px-3 py-1 text-xs font-extrabold rounded-full border cursor-pointer focus:outline-none transition-all ${
          isActivo
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            : 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <Select.Value />
        <Select.Icon>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </Select.Icon>
      </Select.Trigger>

      <Select.Portal>
        <Select.Content
          className="bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 min-w-[120px] z-50 animate-in fade-in zoom-in-95"
          position="popper"
          sideOffset={4}
        >
          <Select.Viewport className="space-y-1">
            <Select.Item
              value="ACTIVO"
              className="flex items-center justify-between px-3 py-1.5 text-xs font-extrabold text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer outline-none transition-colors data-[state=checked]:bg-emerald-50"
            >
              <Select.ItemText>ACTIVO</Select.ItemText>
              <Select.ItemIndicator>
                <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[2.5]" />
              </Select.ItemIndicator>
            </Select.Item>

            <Select.Item
              value="INACTIVO"
              className="flex items-center justify-between px-3 py-1.5 text-xs font-extrabold text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer outline-none transition-colors data-[state=checked]:bg-slate-100"
            >
              <Select.ItemText>INACTIVO</Select.ItemText>
              <Select.ItemIndicator>
                <Check className="w-3.5 h-3.5 text-slate-600 stroke-[2.5]" />
              </Select.ItemIndicator>
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
};