import React from 'react';
import { NominaItem, PreviewNominaResponse } from '../../types/nomina';
import { PayrollUploadBox } from './PayrollUploadBox';
import { PayrollStagingTable } from './PayrollStagingTable';

interface PayrollProcessingTabProps {
  isPayrollStagingMode: boolean;
  previewNominaData: PreviewNominaResponse | null;
  loading: boolean;
  isSaving: boolean;
  onFileUpload: (file: File) => Promise<void>;
  onUpdatePayrollItem: (index: number, field: keyof NominaItem, value: any) => void;
  onConfirmSavePayroll: (quincena?: string, mes?: number) => Promise<void>;
  onNavigateToDistribution?: () => void;
  onCancelStaging: () => void;
}

export const PayrollProcessingTab: React.FC<PayrollProcessingTabProps> = ({
  isPayrollStagingMode,
  previewNominaData,
  loading,
  isSaving,
  onFileUpload,
  onUpdatePayrollItem,
  onConfirmSavePayroll,
  onNavigateToDistribution,
  onCancelStaging,
}) => {
  return (
    <div className="space-y-6">
      {!isPayrollStagingMode || !previewNominaData ? (
        <PayrollUploadBox onFileUpload={onFileUpload} loading={loading} />
      ) : (
        <PayrollStagingTable
          previewData={previewNominaData}
          onUpdateItem={onUpdatePayrollItem}
          onConfirmSave={onConfirmSavePayroll}
          onNavigateToDistribution={onNavigateToDistribution}
          onCancel={onCancelStaging}
          isSaving={isSaving}
        />
      )}
    </div>
  );
};
