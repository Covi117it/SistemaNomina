import { useState, useEffect, lazy, Suspense } from 'react';
import { useEmployees } from './hooks/useEmployees';
import { usePayrollStaging } from './hooks/usePayrollStaging';
import { employeeApi } from './service/api/employeeApi';
import { Toast } from './components/Toast';
import { Loader2 } from 'lucide-react';

const EmployeesPage = lazy(() => import('./pages/EmployeesPage').then((m) => ({ default: m.EmployeesPage })));
const CreateEmployeePage = lazy(() => import('./pages/CreateEmployeePage').then((m) => ({ default: m.CreateEmployeePage })));
const PayrollManagementPage = lazy(() => import('./pages/PayrollManagementPage').then((m) => ({ default: m.PayrollManagementPage })));
const DistributionPdfPage = lazy(() => import('./pages/DistributionPdfPage').then((m) => ({ default: m.DistributionPdfPage })));

const PageLoader = () => (
  <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 p-8">
    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    <span className="text-xs font-bold text-slate-500">Cargando módulo...</span>
  </div>
);

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
    loading: loadingEmployees,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    notification,
    setNotification,
    updatingCodigo,
    selectedEmpleado,
    setSelectedEmpleado,
    totalTotal,
    totalActivos,
    totalInactivos,
    totalFiltrados,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    fetchDbEmployees,
    handleSaveModalEmpleado,
    handleEstatusChange,
    handleDeleteIndividualEmpleado,
  } = useEmployees();

  const {
    previewNominaData,
    isPayrollStagingMode,
    loading: loadingStaging,
    isSaving,
    handleFileUpload,
    handleUpdatePayrollItem,
    handleConfirmSavePayroll,
    cancelStaging,
  } = usePayrollStaging();

  const loading = loadingEmployees || loadingStaging;

  const [nextSuggestedCode, setNextSuggestedCode] = useState<string>('001');

  useEffect(() => {
    if (currentView === 'create-employee') {
      employeeApi.fetchNextSuggestedCode().then((code) => {
        if (code) setNextSuggestedCode(code);
      }).catch(() => {});
    }
  }, [currentView]);

  return (
    <div className="min-h-screen bg-[#f4f7f4] text-slate-900 font-sans antialiased p-4 md:p-8">
      {/* Toast Notificación */}
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <Suspense fallback={<PageLoader />}>
        {currentView === 'main-directory' && (
          <EmployeesPage
            employees={dbEmployees}
            paginatedEmployees={dbEmployees}
            totalTotal={totalTotal}
            totalActivos={totalActivos}
            totalInactivos={totalInactivos}
            totalItems={totalFiltrados}
            searchTerm={searchTerm}
            statusFilter={statusFilter}
            loading={loadingEmployees}
            updatingCodigo={updatingCodigo}
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
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
            onNavigateToCreate={() => {
              setSelectedEmpleado(null);
              setCurrentView('create-employee');
            }}
            onNavigateToPayroll={() => setCurrentView('payroll-processing')}
            onNavigateToHistory={() => setCurrentView('payroll-history')}
            onNavigateToDistribution={() => setCurrentView('distribution-pdf')}
          />
        )}

        {(currentView === 'create-employee' || currentView === 'edit-employee') && (
          <CreateEmployeePage
            initialData={currentView === 'edit-employee' ? selectedEmpleado : null}
            isEditMode={currentView === 'edit-employee'}
            nextSuggestedCode={nextSuggestedCode}
            onSave={async (emp) => {
              await handleSaveModalEmpleado(emp, currentView === 'edit-employee');
              setCurrentView('main-directory');
            }}
            onBack={() => {
              setSelectedEmpleado(null);
              setCurrentView('main-directory');
            }}
            onNavigateToDirectory={() => setCurrentView('main-directory')}
            onNavigateToCreate={() => {
              setSelectedEmpleado(null);
              setCurrentView('create-employee');
            }}
            onNavigateToPayroll={() => setCurrentView('payroll-processing')}
            onNavigateToHistory={() => setCurrentView('payroll-history')}
            onNavigateToDistribution={() => setCurrentView('distribution-pdf')}
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
              const success = await handleConfirmSavePayroll(quincena, mes);
              if (success) {
                setCurrentView('distribution-pdf');
              }
            }}
            onNavigateToDirectory={() => setCurrentView('main-directory')}
            onNavigateToCreate={() => {
              setSelectedEmpleado(null);
              setCurrentView('create-employee');
            }}
            onNavigateToPayroll={() => setCurrentView('payroll-processing')}
            onNavigateToHistory={() => setCurrentView('payroll-history')}
            onNavigateToDistribution={() => setCurrentView('distribution-pdf')}
            onCancelStaging={cancelStaging}
            onBack={() => setCurrentView('main-directory')}
          />
        )}

        {currentView === 'distribution-pdf' && (
          <DistributionPdfPage
            items={previewNominaData?.items}
            onBack={() => setCurrentView('main-directory')}
            onNavigateToDirectory={() => setCurrentView('main-directory')}
            onNavigateToCreate={() => {
              setSelectedEmpleado(null);
              setCurrentView('create-employee');
            }}
            onNavigateToPayroll={() => setCurrentView('payroll-processing')}
            onNavigateToHistory={() => setCurrentView('payroll-history')}
            onNavigateToDistribution={() => setCurrentView('distribution-pdf')}
          />
        )}
      </Suspense>
    </div>
  );
}