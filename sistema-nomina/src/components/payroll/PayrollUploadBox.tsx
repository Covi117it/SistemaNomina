import React from 'react';
import { Calculator } from 'lucide-react';
import { FileUpload } from '../FileUpload';

interface PayrollUploadBoxProps {
  onFileUpload: (file: File) => Promise<void>;
  loading: boolean;
}

export const PayrollUploadBox: React.FC<PayrollUploadBoxProps> = ({ onFileUpload, loading }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl p-10 text-center shadow-sm space-y-4">
      <div className="w-16 h-16 bg-[#e6f7ef] text-[#0d784a] rounded-2xl flex items-center justify-center mx-auto border border-[#bcecd4]">
        <Calculator className="w-8 h-8" />
      </div>
      <div>
        <h3 className="text-lg font-extrabold text-slate-900">Cargar Archivo Excel de Pagos Quincenales</h3>
      </div>
      <div className="inline-block pt-2">
        <FileUpload
          label="Seleccionar Archivo Excel de Nómina"
          onFileSelected={onFileUpload}
          disabled={loading}
        />
      </div>
    </div>
  );
};