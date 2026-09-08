import React, { useState, useEffect } from 'react';
import { NominaItem, PreviewNominaResponse } from '../types/nomina';
import { PageHeader } from '../components/common/PageHeader';
import { PillFilterGroup } from '../components/common/PillFilterGroup';
import { ActionsDropdown } from '../components/common/ActionsDropdown';
import { PayrollProcessingTab } from '../components/payroll/PayrollProcessingTab';
import { PayrollHistoryTab } from '../components/payroll/PayrollHistoryTab';
import { useAuthorization } from '../hooks/useAuthorization';

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
  onNavigateToUsers?: () => void;
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
  onNavigateToUsers,
  onCancelStaging,
  onBack,
  defaultTab = 'processing',
}) => {
    const { canProcessPayroll } = useAuthorization();
  const [activeSubTab, setActiveSubTab] = useState<'processing' | 'history'>(
    canProcessPayroll ? defaultTab : 'history'
  );

  useEffect(() => {
    if (!canProcessPayroll) {
      setActiveSubTab('history');
    } else {
      setActiveSubTab(defaultTab);
    }
  }, [defaultTab, canProcessPayroll]);

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
              onNavigateToUsers={onNavigateToUsers}
            />
          )
        }
        actions={
          canProcessPayroll ? (
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
          ) : undefined
        }
      />

        <div className={activeSubTab === 'processing' ? 'block' : 'hidden'}>
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
      </div>

      <div className={activeSubTab === 'history' ? 'block' : 'hidden'}>
        <PayrollHistoryTab isActive={activeSubTab === 'history'} />
      </div>
    </div>
  );
};