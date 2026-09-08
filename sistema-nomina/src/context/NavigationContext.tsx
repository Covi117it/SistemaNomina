import React, { createContext, useContext, useState, useEffect } from 'react';
import { Empleado } from '../types/empleado';
import { Usuario } from '../types/usuario';
import { secureStorage } from '../service/secureStorage';
import { authApi } from '../service/api/authApi';

export type CurrentView = 
  | 'dashboard'
  | 'main-directory'
  | 'create-employee'
  | 'edit-employee'
  | 'payroll-processing'
  | 'payroll-history'
  | 'distribution-pdf'
  | 'create-event'
  | 'month-agenda'
  | 'users-management'
  | 'create-user'
  | 'user-audit'
  | 'edit-user'
  | 'login';

interface NavigationState {
  currentView: CurrentView;
  currentUser: Usuario | null;
  selectedEmpleado: Empleado | null;
  selectedUsuario: Usuario | null;
  selectedEventDate?: string;
  nextSuggestedCode?: string;
}

interface NavigationContextType extends NavigationState {
  setCurrentView: (view: CurrentView) => void;
  setCurrentUser: (user: Usuario | null) => void;
  setSelectedEmpleado: (emp: Empleado | null) => void;
  setSelectedUsuario: (user: Usuario | null) => void;
  setSelectedEventDate: (dateStr?: string) => void;
  setNextSuggestedCode: (code: string) => void;
  navigateTo: (view: CurrentView, options?: Partial<NavigationState>) => void;
  goBack: (fallbackView?: CurrentView) => void;
  logout: () => Promise<void>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export const NavigationProvider: React.FC<{ children: React.ReactNode; initialView?: CurrentView }> = ({ 
  children, 
  initialView = 'login' 
}) => {
  const [currentView, setCurrentView] = useState<CurrentView>(initialView);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [selectedEmpleado, setSelectedEmpleado] = useState<Empleado | null>(null);
  const [selectedUsuario, setSelectedUsuario] = useState<Usuario | null>(null);
  const [selectedEventDate, setSelectedEventDate] = useState<string | undefined>(undefined);
  const [nextSuggestedCode, setNextSuggestedCode] = useState<string | undefined>(undefined);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Auto-Login seguro al arrancar la aplicación
  useEffect(() => {
    const verificarSesionPersistente = async () => {
      try {
        const token = await secureStorage.obtenerToken();
        if (token) {
          const user = await authApi.verificarSesion(token);
          if (user && user.activo) {
            localStorage.setItem('auth_user', JSON.stringify(user));
            setCurrentUser(user as Usuario);
            setCurrentView('dashboard');
            setIsCheckingAuth(false);
            return;
          }
        }
      } catch (err) {
        console.warn('[Auto-Login] Sesión no válida o expirada:', err);
        await secureStorage.eliminarToken();
        localStorage.removeItem('auth_user');
      }
      setIsCheckingAuth(false);
    };

    verificarSesionPersistente();
  }, []);

  const navigateTo = (view: CurrentView, options?: Partial<NavigationState>) => {
    if (options?.currentUser !== undefined) setCurrentUser(options.currentUser);
    if (options?.selectedEmpleado !== undefined) setSelectedEmpleado(options.selectedEmpleado);
    if (options?.selectedUsuario !== undefined) setSelectedUsuario(options.selectedUsuario);
    if (options?.selectedEventDate !== undefined) setSelectedEventDate(options.selectedEventDate);
    if (options?.nextSuggestedCode !== undefined) setNextSuggestedCode(options.nextSuggestedCode);
    setCurrentView(view);
  };

  const goBack = (fallbackView: CurrentView = 'dashboard') => {
    setCurrentView(fallbackView);
  };

  const logout = async () => {
    try {
      const token = await secureStorage.obtenerToken();
      await authApi.cerrarSesion(token || undefined);
    } catch (err) {
      console.warn('Error al cerrar sesión en el servidor:', err);
    } finally {
      await secureStorage.eliminarToken();
      localStorage.removeItem('auth_user');
      setCurrentUser(null);
      setCurrentView('login');
    }
  };

  // Pantalla de carga suave mientras valida las credenciales en el Keyring
  if (isCheckingAuth) {
    return (
      <div className="h-screen w-full bg-[#f4f7f4] flex flex-col items-center justify-center gap-3">
        <div className="w-9 h-9 border-4 border-[#33aa8f] border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold text-slate-500 tracking-wide uppercase">Verificando sesión...</span>
      </div>
    );
  }

  return (
    <NavigationContext.Provider
      value={{
        currentView,
        currentUser,
        selectedEmpleado,
        selectedUsuario,
        selectedEventDate,
        nextSuggestedCode,
        setCurrentView,
        setCurrentUser,
        setSelectedEmpleado,
        setSelectedUsuario,
        setSelectedEventDate,
        setNextSuggestedCode,
        navigateTo,
        goBack,
        logout,
      }}
    >
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation debe ser utilizado dentro de un NavigationProvider');
  }
  return context;
};