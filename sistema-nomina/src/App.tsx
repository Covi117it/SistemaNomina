import { useState, useEffect, lazy, Suspense } from 'react';
import { useEmployees } from './hooks/useEmployees';
import { usePayrollStaging } from './hooks/usePayrollStaging';
import { employeeApi } from './service/api/employeeApi';
import { Toast } from './components/Toast';
import { Loader2 } from 'lucide-react';
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

const DashboardPage = lazy(() => import('./pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const EmployeesPage = lazy(() => import('./pages/EmployeesPage').then((m) => ({ default: m.EmployeesPage })));
const CreateEmployeePage = lazy(() => import('./pages/CreateEmployeePage').then((m) => ({ default: m.CreateEmployeePage })));
const PayrollManagementPage = lazy(() => import('./pages/PayrollManagementPage').then((m) => ({ default: m.PayrollManagementPage })));
const DistributionPdfPage = lazy(() => import('./pages/DistributionPdfPage').then((m) => ({ default: m.DistributionPdfPage })));
const CreateEventPage = lazy(() => import('./pages/CreateEventPage').then((m) => ({ default: m.CreateEventPage })));
const MonthAgendaPage = lazy(() => import('./pages/MonthAgendaPage').then((m) => ({ default: m.MonthAgendaPage })));

const PageLoader = () => (
  <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 p-8">
    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    <span className="text-xs font-bold text-slate-500">Cargando módulo...</span>
  </div>
);

export type CurrentView = 
  | 'dashboard'
  | 'main-directory'
  | 'create-employee'
  | 'edit-employee'
  | 'payroll-processing'
  | 'payroll-history'
  | 'distribution-pdf'
  | 'create-event'
  | 'month-agenda';

export function App() {

  useEffect(() => {
    async function checkForUpdates() {
      try {
        const update = await check();
        if (update) {
          console.log(`Nueva versión disponible: ${update.version} (actual: ${update.currentVersion})`);
          await update.downloadAndInstall();
          await relaunch();
        }
      } catch (error) {
        console.error('Error al comprobar actualizaciones:', error);
      }
    }
    checkForUpdates();
  }, []);
  
  const [currentView, setCurrentView] = useState<CurrentView>('dashboard');
  const [selectedEventDate, setSelectedEventDate] = useState<string | undefined>(undefined);
  
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
    if (currentView === 'dashboard' || currentView === 'main-directory') {
      fetchDbEmployees();
    }
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
        {currentView === 'dashboard' && (
          <DashboardPage
            totalTotal={totalTotal}
            totalActivos={totalActivos}
            totalInactivos={totalInactivos}
            loadingEmployees={loadingEmployees}
            onNavigateToDirectory={() => setCurrentView('main-directory')}
            onNavigateToCreate={() => {
              setSelectedEmpleado(null);
              setCurrentView('create-employee');
            }}
            onNavigateToPayroll={() => setCurrentView('payroll-processing')}
            onNavigateToHistory={() => setCurrentView('payroll-history')}
            onNavigateToDistribution={() => setCurrentView('distribution-pdf')}
            onNavigateToCreateEvent={(dateStr?: string) => {
              setSelectedEventDate(dateStr);
              setCurrentView('create-event');
            }}
            onNavigateToMonthAgenda={() => {
              setCurrentView('month-agenda');
            }}
          />
        )}
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
            onNavigateToDashboard={() => setCurrentView('dashboard')}
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
            onNavigateToDashboard={() => setCurrentView('dashboard')}
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
            onNavigateToDashboard={() => setCurrentView('dashboard')}
            onNavigateToDirectory={() => setCurrentView('main-directory')}
            onNavigateToCreate={() => {
              setSelectedEmpleado(null);
              setCurrentView('create-employee');
            }}
            onNavigateToPayroll={() => setCurrentView('payroll-processing')}
            onNavigateToHistory={() => setCurrentView('payroll-history')}
            onNavigateToDistribution={() => setCurrentView('distribution-pdf')}
            onCancelStaging={cancelStaging}
            onBack={() => setCurrentView('dashboard')}
          />
        )}

        {currentView === 'distribution-pdf' && (
          <DistributionPdfPage
            items={previewNominaData?.items}
            onBack={() => setCurrentView('dashboard')}
            onNavigateToDashboard={() => setCurrentView('dashboard')}
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

        {currentView === 'create-event' && (
          <CreateEventPage
            selectedDate={selectedEventDate}
            onBack={() => setCurrentView('dashboard')}
            onNavigateToDashboard={() => setCurrentView('dashboard')}
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

        {currentView === 'month-agenda' && (
          <MonthAgendaPage
            onBack={() => setCurrentView('dashboard')}
            onNavigateToDashboard={() => setCurrentView('dashboard')}
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

export default App;