import React, { lazy, Suspense, useEffect } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { useEmployees } from '../hooks/useEmployees';
import { usePayrollStaging } from '../hooks/usePayrollStaging';
import { employeeApi } from '../service/api/employeeApi';
import { Toast } from '../components/Toast';
import { Loader2 } from 'lucide-react';
import { useAuthorization } from '../hooks/useAuthorization';

const DashboardPage = lazy(() => import('../pages/DashboardPage').then((m) => ({ default: m.DashboardPage })));
const EmployeesPage = lazy(() => import('../pages/EmployeesPage').then((m) => ({ default: m.EmployeesPage })));
const CreateEmployeePage = lazy(() => import('../pages/CreateEmployeePage').then((m) => ({ default: m.CreateEmployeePage })));
const PayrollManagementPage = lazy(() => import('../pages/PayrollManagementPage').then((m) => ({ default: m.PayrollManagementPage })));
const DistributionPdfPage = lazy(() => import('../pages/DistributionPdfPage').then((m) => ({ default: m.DistributionPdfPage })));
const CreateEventPage = lazy(() => import('../pages/CreateEventPage').then((m) => ({ default: m.CreateEventPage })));
const MonthAgendaPage = lazy(() => import('../pages/MonthAgendaPage').then((m) => ({ default: m.MonthAgendaPage })));
const LoginPage = lazy(() => import('../pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const UsersManagementPage = lazy(() => import('../pages/UsersManagementPage').then((m) => ({ default: m.UsersManagementPage })));
const CreateUserPage = lazy(() => import('../pages/CreateUserPage').then((m) => ({ default: m.CreateUserPage })));
const UserAuditPage = lazy(() => import('../pages/UserAuditPage').then((m) => ({ default: m.UserAuditPage }))); 

const PageLoader = () => (
  <div className="min-h-[400px] flex flex-col items-center justify-center gap-3 p-8">
    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
    <span className="text-xs font-bold text-slate-500">Cargando módulo...</span>
  </div>
);

export const AppRouter: React.FC = () => {
  const { canManageUsers, canCreateEmployee, canProcessPayroll, canManageEvents } = useAuthorization();

  const {
    currentView,
    selectedEmpleado,
    selectedUsuario,
    selectedEventDate,
    nextSuggestedCode,
    setNextSuggestedCode,
    navigateTo,
  } = useNavigation();

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
    totalTotal,
    totalActivos,
    totalInactivos,
    totalFiltrados,
    currentPage,
    totalPages,
    pageSize,
    setCurrentPage,
    setPageSize,
    fetchDbEmployees,
    handleSaveModalEmpleado,
    handleEstatusChange,
    handleDeleteIndividualEmpleado,
  } = useEmployees();

  const {
    previewNominaData,
    isPayrollStagingMode,
    loading,
    isSaving,
    handleFileUpload,
    handleUpdatePayrollItem,
    handleConfirmSavePayroll,
    cancelStaging,
  } = usePayrollStaging();

  useEffect(() => {
    if (currentView === 'create-employee') {
      employeeApi.fetchNextSuggestedCode().then((code) => {
        if (code) setNextSuggestedCode(code);
      }).catch(() => {});
    }
  }, [currentView]);

  useEffect(() => {
    if (
      (currentView === 'users-management' || currentView === 'create-user' || currentView === 'edit-user') &&
      !canManageUsers
    ) {
      setNotification({
        message: 'Acceso denegado: Se requiere rol de Administrador.',
        type: 'error',
      });
      navigateTo('dashboard');
    }

    if (currentView === 'create-employee' && !canCreateEmployee) {
      setNotification({
        message: 'Acceso denegado: No tienes permisos para registrar nuevos empleados.',
        type: 'error',
      });
      navigateTo('main-directory');
    }

    if (currentView === 'payroll-processing' && !canProcessPayroll) {
      navigateTo('payroll-history');
    }

    if (currentView === 'create-event' && !canManageEvents) {
      setNotification({
        message: 'Acceso denegado: No tienes permisos para crear eventos en la agenda.',
        type: 'error',
      });
      navigateTo('dashboard');
    }
  }, [currentView, canManageUsers, canCreateEmployee, canProcessPayroll, canManageEvents]);

  return (
    <div className={`min-h-screen text-slate-900 font-sans antialiased ${currentView === 'login' ? '' : 'bg-[#f4f7f4] p-4 md:p-8'}`}>
      {notification && (
        <Toast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      <Suspense fallback={<PageLoader />}>
         {currentView === 'login' && (
          <LoginPage onLoginSuccess={(user) => navigateTo('dashboard', { currentUser: user })} />
        )}

        {currentView === 'dashboard' && (
          <DashboardPage
            totalTotal={totalTotal}
            totalActivos={totalActivos}
            totalInactivos={totalInactivos}
            loadingEmployees={loadingEmployees}
            onNavigateToDirectory={() => navigateTo('main-directory')}
            onNavigateToCreate={() => navigateTo('create-employee', { selectedEmpleado: null })}
            onNavigateToPayroll={() => navigateTo('payroll-processing')}
            onNavigateToHistory={() => navigateTo('payroll-history')}
            onNavigateToDistribution={() => navigateTo('distribution-pdf')}
            onNavigateToCreateEvent={(dateStr?: string) => navigateTo('create-event', { selectedEventDate: dateStr })}
            onNavigateToMonthAgenda={() => navigateTo('month-agenda')}
            onNavigateToUsers={() => navigateTo('users-management')}
          />
        )}

         {currentView === 'users-management' && canManageUsers && (
          <UsersManagementPage
            onBack={() => navigateTo('dashboard')}
            onNavigateToCreateUser={() => navigateTo('create-user', { selectedUsuario: null })}
            onNavigateToEditUser={(user) => navigateTo('edit-user', { selectedUsuario: user })}
            onInspectUser={(user) => navigateTo('user-audit', { selectedUsuario: user })}
            onNavigateToDashboard={() => navigateTo('dashboard')}
            onNavigateToDirectory={() => navigateTo('main-directory')}
            onNavigateToCreate={() => navigateTo('create-employee', { selectedEmpleado: null })}
            onNavigateToPayroll={() => navigateTo('payroll-processing')}
            onNavigateToHistory={() => navigateTo('payroll-history')}
            onNavigateToDistribution={() => navigateTo('distribution-pdf')}
          />
        )}

        {(currentView === 'create-user' || currentView === 'edit-user') && canManageUsers && (
          <CreateUserPage
            initialData={currentView === 'edit-user' ? selectedUsuario : null}
            isEditMode={currentView === 'edit-user'}
            onBack={() => navigateTo('users-management', { selectedUsuario: null })}
            onSaveSuccess={() => navigateTo('users-management', { selectedUsuario: null })}
            onNavigateToDashboard={() => navigateTo('dashboard')}
            onNavigateToDirectory={() => navigateTo('main-directory')}
            onNavigateToCreate={() => navigateTo('create-employee', { selectedEmpleado: null })}
            onNavigateToPayroll={() => navigateTo('payroll-processing')}
            onNavigateToHistory={() => navigateTo('payroll-history')}
            onNavigateToDistribution={() => navigateTo('distribution-pdf')}
            onNavigateToUsers={() => navigateTo('users-management')}
          />
        )}

        {currentView === 'user-audit' && canManageUsers && (
          <UserAuditPage
            user={selectedUsuario}
            onBack={() => navigateTo('users-management', { selectedUsuario: null })}
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
            onDoubleClickRow={(emp) => navigateTo('edit-employee', { selectedEmpleado: emp })}
            onEstatusChange={handleEstatusChange}
            onEditClick={(emp) => navigateTo('edit-employee', { selectedEmpleado: emp })}
            onDeleteClick={handleDeleteIndividualEmpleado}
            onNavigateToDashboard={() => navigateTo('dashboard')}
            onNavigateToCreate={() => navigateTo('create-employee', { selectedEmpleado: null })}
            onNavigateToPayroll={() => navigateTo('payroll-processing')}
            onNavigateToHistory={() => navigateTo('payroll-history')}
            onNavigateToDistribution={() => navigateTo('distribution-pdf')}
            onNavigateToUsers={() => navigateTo('users-management')}
          />
        )}

        {(currentView === 'create-employee' || currentView === 'edit-employee') && (
          <CreateEmployeePage
            initialData={currentView === 'edit-employee' ? selectedEmpleado : null}
            isEditMode={currentView === 'edit-employee'}
            nextSuggestedCode={nextSuggestedCode}
            onSave={async (emp) => {
              await handleSaveModalEmpleado(emp, currentView === 'edit-employee');
              navigateTo('main-directory');
            }}
            onBack={() => navigateTo('main-directory', { selectedEmpleado: null })}
            onNavigateToDashboard={() => navigateTo('dashboard')}
            onNavigateToDirectory={() => navigateTo('main-directory')}
            onNavigateToCreate={() => navigateTo('create-employee', { selectedEmpleado: null })}
            onNavigateToPayroll={() => navigateTo('payroll-processing')}
            onNavigateToHistory={() => navigateTo('payroll-history')}
            onNavigateToDistribution={() => navigateTo('distribution-pdf')}
            onNavigateToUsers={() => navigateTo('users-management')}
          />
        )}

        {(currentView === 'payroll-processing' || currentView === 'payroll-history') && (
          <PayrollManagementPage
            key="payroll-management-page"
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
                navigateTo('distribution-pdf');
              }
            }}
            onNavigateToDashboard={() => navigateTo('dashboard')}
            onNavigateToDirectory={() => navigateTo('main-directory')}
            onNavigateToCreate={() => navigateTo('create-employee', { selectedEmpleado: null })}
            onNavigateToPayroll={() => navigateTo('payroll-processing')}
            onNavigateToHistory={() => navigateTo('payroll-history')}
            onNavigateToDistribution={() => navigateTo('distribution-pdf')}
            onNavigateToUsers={() => navigateTo('users-management')}
            onCancelStaging={cancelStaging}
            onBack={() => navigateTo('dashboard')}
          />
        )}

        {currentView === 'distribution-pdf' && (
          <DistributionPdfPage
            items={previewNominaData?.items}
            onBack={() => navigateTo('dashboard')}
            onNavigateToDashboard={() => navigateTo('dashboard')}
            onNavigateToDirectory={() => navigateTo('main-directory')}
            onNavigateToCreate={() => navigateTo('create-employee', { selectedEmpleado: null })}
            onNavigateToPayroll={() => navigateTo('payroll-processing')}
            onNavigateToHistory={() => navigateTo('payroll-history')}
            onNavigateToDistribution={() => navigateTo('distribution-pdf')}
          />
        )}

        {currentView === 'create-event' && (
          <CreateEventPage
            selectedDate={selectedEventDate}
            onBack={() => navigateTo('dashboard')}
            onNavigateToDashboard={() => navigateTo('dashboard')}
            onNavigateToDirectory={() => navigateTo('main-directory')}
            onNavigateToCreate={() => navigateTo('create-employee', { selectedEmpleado: null })}
            onNavigateToPayroll={() => navigateTo('payroll-processing')}
            onNavigateToHistory={() => navigateTo('payroll-history')}
            onNavigateToDistribution={() => navigateTo('distribution-pdf')}
          />
        )}

        {currentView === 'month-agenda' && (
          <MonthAgendaPage
            onBack={() => navigateTo('dashboard')}
            onNavigateToDashboard={() => navigateTo('dashboard')}
            onNavigateToDirectory={() => navigateTo('main-directory')}
            onNavigateToCreate={() => navigateTo('create-employee', { selectedEmpleado: null })}
            onNavigateToPayroll={() => navigateTo('payroll-processing')}
            onNavigateToHistory={() => navigateTo('payroll-history')}
            onNavigateToDistribution={() => navigateTo('distribution-pdf')}
          />
        )}
      </Suspense>
    </div>
  );
};
