import { Usuario } from '../types/usuario';

export type Permission =
  | '*'
  | 'usuarios:manage'
  | 'empleados:read'
  | 'empleados:create'
  | 'empleados:edit'
  | 'empleados:delete'
  | 'nomina:read'
  | 'nomina:process'
  | 'volantes:send'
  | 'eventos:manage';

export const DEFAULT_ROLE_PERMISSIONS: Record<string, Permission[]> = {
  Admin: ['*'],
  RRHH: [
    'empleados:read',
    'empleados:create',
    'empleados:edit',
    'empleados:delete',
    'nomina:read',
    'nomina:process',
    'volantes:send',
    'eventos:manage',
  ],
  Contador: [
    'empleados:read',
    'nomina:read',
    'nomina:process',
    'volantes:send',
    'eventos:manage',
  ],
  Auditor: [
    'empleados:read',
    'nomina:read',
  ],
    Operador: [
    'empleados:read',
    'empleados:create',
    'empleados:edit',
    'nomina:read',
  ],
};

/**
 * Obtiene los permisos efectivos para un rol determinado.
 */
export const getPermissionsForRole = (rol: string): Permission[] => {
  const normalizedRole = Object.keys(DEFAULT_ROLE_PERMISSIONS).find(
    (key) => key.toLowerCase() === rol.trim().toLowerCase()
  );
  return normalizedRole ? DEFAULT_ROLE_PERMISSIONS[normalizedRole] : ['empleados:read'];
};

/**
 * Parsea de forma segura el JSON de permisos de un usuario o devuelve los permisos predeterminados de su rol.
 */
export const getUserPermissions = (user: Usuario | null | undefined): string[] => {
  if (!user) return [];

  const defaultRolePerms = getPermissionsForRole(user.rol);
  let customPerms: string[] = [];

  if (user.permisosJson && user.permisosJson.trim() !== '' && user.permisosJson !== '[]') {
    try {
      const parsed = JSON.parse(user.permisosJson);
      if (Array.isArray(parsed)) {
        customPerms = parsed;
      }
    } catch {
      // Ignorar error de parseo
    }
  }

  // Unir los permisos del rol con los permisos del JSON (sin duplicados)
  return Array.from(new Set([...defaultRolePerms, ...customPerms]));
};

/**
 * Comprueba si un usuario tiene un permiso específico o acceso total (*).
 */
export const hasPermission = (user: Usuario | null | undefined, permission: Permission): boolean => {
  if (!user || !user.activo) return false;
  if (user.rol.toUpperCase() === 'ADMIN') return true;

  const userPerms = getUserPermissions(user);
  return userPerms.includes('*') || userPerms.includes(permission);
};

/**
 * Comprueba si un usuario tiene al menos uno de los permisos indicados.
 */
export const hasAnyPermission = (user: Usuario | null | undefined, permissions: Permission[]): boolean => {
  if (!user || !user.activo) return false;
  if (user.rol.toUpperCase() === 'ADMIN') return true;

  const userPerms = getUserPermissions(user);
  if (userPerms.includes('*')) return true;

  return permissions.some((p) => userPerms.includes(p));
};
