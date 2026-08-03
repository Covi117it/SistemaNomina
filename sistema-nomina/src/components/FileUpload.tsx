import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  onFileSelected: (file: File) => void;
  label: string;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelected, label, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelected(file);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        type="file"
        accept=".xlsx, .xls"
        ref={inputRef}
        onChange={handleChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
        className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-sm rounded-xl shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2.5 disabled:opacity-50 cursor-pointer"
      >
        <UploadCloud className="w-4 h-4 stroke-[2.5]" />
        <span>{label}</span>
      </button>
    </div>
  );
};