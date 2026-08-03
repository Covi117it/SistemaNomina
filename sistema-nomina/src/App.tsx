import { useState } from 'react';
import { EmployeesPage } from './pages/EmployeesPage';
import { CreateEmployeePage } from './pages/CreateEmployeePage';
import { PayrollManagementPage } from './pages/PayrollManagementPage';
import { DistributionPdfPage } from './pages/DistributionPdfPage';
import { useEmployees } from './hooks/useEmployees';
import { Toast } from './components/Toast';

export type CurrentView = 
  | 'main-directory'
  | 'create-employee'
  | 'edit-employee'
  | 'payroll-processing'
  | 'payroll-history'
  | 'distribution-pdf';

export default function App() {
  const [currentView, setCurrentView] = useState<CurrentView>('main-directory');
  
  const {
    dbEmployees,
    filteredEmployees,
    previewNominaData,
    isPayrollStagingMode,
    loading,
    isSaving,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    notification,
    setNotification,
    updatingCodigo,
    selectedEmpleado,
    setSelectedEmpleado,
    totalActivos,
    totalInactivos,
    fetchDbEmployees,
    handleSaveModalEmpleado,
    handleEstatusChange,
    handleDeleteIndividualEmpleado,
    handleFileUpload,
    handleUpdatePayrollItem,
    handleConfirmSavePayroll,
    setIsPayrollStagingMode,
    setPreviewNominaData,
  } = useEmployees();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans p-6 md:p-10">
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {currentView === 'main-directory' && (
        <EmployeesPage
          employees={filteredEmployees}
          totalTotal={dbEmployees.length}
          totalActivos={totalActivos}
          totalInactivos={totalInactivos}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          loading={loading}
          updatingCodigo={updatingCodigo}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onRefresh={fetchDbEmployees}
          onDoubleClickRow={(emp) => {
            setSelectedEmpleado(emp);
            setCurrentView('edit-employee');
          }}
          onEstatusChange={handleEstatusChange}
          onEditClick={(emp) => {
            setSelectedEmpleado(emp);
            setCurrentView('edit-employee');
          }}
          onDeleteClick={handleDeleteIndividualEmpleado}
          onNavigateToCreate={() => setCurrentView('create-employee')}
          onNavigateToPayroll={() => setCurrentView('payroll-processing')}
          onNavigateToHistory={() => setCurrentView('payroll-history')}
          onNavigateToDistribution={() => setCurrentView('distribution-pdf')}
        />
      )}

      {(currentView === 'create-employee' || currentView === 'edit-employee') && (
        <CreateEmployeePage
          initialData={currentView === 'edit-employee' ? selectedEmpleado : null}
          isEditMode={currentView === 'edit-employee'}
          onSave={async (emp) => {
            await handleSaveModalEmpleado(emp);
            setCurrentView('main-directory');
          }}
          onBack={() => {
            setSelectedEmpleado(null);
            setCurrentView('main-directory');
          }}
        />
      )}

       {(currentView === 'payroll-processing' || currentView === 'payroll-history') && (
        <PayrollManagementPage
          key={currentView}
          defaultTab={currentView === 'payroll-history' ? 'history' : 'processing'}
          previewNominaData={previewNominaData}
          isPayrollStagingMode={isPayrollStagingMode}
          loading={loading}
          isSaving={isSaving}
          onFileUpload={handleFileUpload}
          onUpdatePayrollItem={handleUpdatePayrollItem}
          onConfirmSavePayroll={async (quincena, mes) => {
      await handleConfirmSavePayroll(quincena, mes);
      setCurrentView('distribution-pdf');
    }}  
          onNavigateToDistribution={() => setCurrentView('distribution-pdf')}
          onCancelStaging={() => {
            setIsPayrollStagingMode(false);
            setPreviewNominaData(null);
          }}
          onBack={() => setCurrentView('main-directory')}
        />
      )}

      {currentView === 'distribution-pdf' && (
        <DistributionPdfPage
          items={previewNominaData?.items}
          onBack={() => setCurrentView('payroll-processing')}
        />
      )}
    </div>
  );
}