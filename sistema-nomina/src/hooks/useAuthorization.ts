import { useMemo } from 'react';
import { useNavigation } from '../context/NavigationContext';
import { 
  Permission, 
  hasPermission as checkPermission, 
  hasAnyPermission as checkAnyPermission,
  getUserPermissions 
} from '../constants/permissions';

export const useAuthorization = () => {
  const { currentUser } = useNavigation();

  const role = currentUser?.rol || '';
  const roleUpper = role.toUpperCase();

  const isAdmin = roleUpper === 'ADMIN';
  const isRRHH = roleUpper === 'RRHH';
  const isContador = roleUpper === 'CONTADOR';
  const isAuditor = roleUpper === 'AUDITOR';
  const isOperador = roleUpper === 'OPERADOR';
  const isReadOnly = isAuditor;

  const permissions = useMemo(() => {
    return getUserPermissions(currentUser);
  }, [currentUser]);

  const hasPermission = (permission: Permission): boolean => {
    return checkPermission(currentUser, permission);
  };

  const hasAnyPermission = (perms: Permission[]): boolean => {
    return checkAnyPermission(currentUser, perms);
  };

  // Permisos granulares de acceso rápido
  const canManageUsers = hasPermission('usuarios:manage');
  const canReadEmployees = hasPermission('empleados:read');
  const canCreateEmployee = hasPermission('empleados:create');
  const canEditEmployee = hasPermission('empleados:edit');
  const canDeleteEmployee = hasPermission('empleados:delete');
  const canProcessPayroll = hasPermission('nomina:process');
  const canReadPayroll = hasPermission('nomina:read');
  const canSendPaystubs = hasPermission('volantes:send');
  const canManageEvents = hasPermission('eventos:manage');

  return {
    currentUser,
    role,
    isAdmin,
    isRRHH,
    isContador,
    isAuditor,
    isOperador,
    isReadOnly,
    permissions,
    hasPermission,
    hasAnyPermission,
    canManageUsers,
    canReadEmployees,
    canCreateEmployee,
    canEditEmployee,
    canDeleteEmployee,
    canProcessPayroll,
    canReadPayroll,
    canSendPaystubs,
    canManageEvents,
  };
};
