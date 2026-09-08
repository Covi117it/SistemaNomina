import React from 'react';
import { FileText } from 'lucide-react';

interface PdfPaystubButtonProps {
  onClick: () => void;
  disabled?: boolean;
  title?: string;
  className?: string;
}

export const PdfPaystubButton: React.FC<PdfPaystubButtonProps> = ({
  onClick,
  disabled = false,
  title = 'Ver volante PDF',
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer border border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <FileText className="w-3.5 h-3.5 text-emerald-600" />
      PDF
    </button>
  );
};
