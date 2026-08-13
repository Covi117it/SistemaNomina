import React, { useState, useEffect } from 'react';
import { NominaItem, PreviewNominaResponse } from '../types/nomina';
import { PageHeader } from '../components/common/PageHeader';
import { PillFilterGroup } from '../components/common/PillFilterGroup';
import { ActionsDropdown } from '../components/common/ActionsDropdown';
import { PayrollProcessingTab } from '../components/payroll/PayrollProcessingTab';
import { PayrollHistoryTab } from '../components/payroll/PayrollHistoryTab';

interface PayrollManagementPageProps {
  previewNominaData: PreviewNominaResponse | null;
  isPayrollStagingMode: boolean;
  loading: boolean;
  isSaving: boolean;
  onFileUpload: (file: File) => Promise<void>;
  onUpdatePayrollItem: (index: number, field: keyof NominaItem, value: any) => void;
  onConfirmSavePayroll: (quincena?: string, mes?: number) => Promise<void>;
  onNavigateToDashboard?: () => void;
  onNavigateToDirectory?: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToPayroll?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToDistribution?: () => void;
  onCancelStaging: () => void;
  onBack: () => void;
  defaultTab?: 'processing' | 'history';
}

export const PayrollManagementPage: React.FC<PayrollManagementPageProps> = ({
  previewNominaData,
  isPayrollStagingMode,
  loading,
  isSaving,
  onFileUpload,
  onUpdatePayrollItem,
  onConfirmSavePayroll,
  onNavigateToDashboard,
  onNavigateToDirectory,
  onNavigateToCreate,
  onNavigateToPayroll,
  onNavigateToHistory,
  onNavigateToDistribution,
  onCancelStaging,
  onBack,
  defaultTab = 'processing',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'processing' | 'history'>(defaultTab);

  useEffect(() => {
    setActiveSubTab(defaultTab);
  }, [defaultTab]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="Gestión de Nómina Quincenal"
        onBack={onBack}
        leftActions={
          onNavigateToCreate && (
            <ActionsDropdown
              currentView={activeSubTab === 'history' ? 'payroll-history' : 'payroll-processing'}
              onNavigateToDashboard={onNavigateToDashboard}
              onNavigateToDirectory={onNavigateToDirectory}
              onNavigateToCreate={onNavigateToCreate}
              onNavigateToPayroll={onNavigateToPayroll}
              onNavigateToHistory={onNavigateToHistory}
              onNavigateToDistribution={onNavigateToDistribution}
            />
          )
        }
        actions={
          <PillFilterGroup<'processing' | 'history'>
            title="Módulo"
            options={[
              { key: 'processing', label: 'Carga y Procesamiento' },
              { key: 'history', label: 'Histórico de Nóminas' },
            ]}
            value={activeSubTab}
            onChange={(val) => {
              setActiveSubTab(val);
            }}
          />
        }
      />

      {activeSubTab === 'processing' && (
        <PayrollProcessingTab
          isPayrollStagingMode={isPayrollStagingMode}
          previewNominaData={previewNominaData}
          loading={loading}
          isSaving={isSaving}
          onFileUpload={onFileUpload}
          onUpdatePayrollItem={onUpdatePayrollItem}
          onConfirmSavePayroll={onConfirmSavePayroll}
          onNavigateToDistribution={onNavigateToDistribution}
          onCancelStaging={onCancelStaging}
        />
      )}

      {activeSubTab === 'history' && (
        <PayrollHistoryTab isActive={activeSubTab === 'history'} />
      )}
    </div>
  );
};