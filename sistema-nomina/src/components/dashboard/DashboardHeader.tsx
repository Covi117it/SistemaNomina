import React from 'react';
import { useNavigation } from '../../context/NavigationContext';
import { LogOut, UserCheck } from 'lucide-react';

export const DashboardHeader: React.FC = () => {
  const { currentUser, logout } = useNavigation();

  const getFormattedDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    const dateStr = new Date().toLocaleDateString('es-ES', options);
    return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
      {/* Texto e Información de Bienvenida */}
      <div className="space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Centro de Control
        </h1>

        <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
          <span>{getFormattedDate()}</span>
        </p>
      </div>

      {/* Panel Derecho: Perfil Activo, Botón Logout y Logo */}
      <div className="flex items-center gap-4">
        {/* Tarjeta de Usuario Logueado */}
        {currentUser && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/70 py-2 px-3.5 rounded-2xl">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
              <UserCheck className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-800 leading-tight">
                {currentUser.nombreCompleto}
              </span>
              <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                {currentUser.rol}
              </span>
            </div>
            <button
              type="button"
              onClick={logout}
              title="Cerrar sesión"
              className="ml-2 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Logo Institucional ENFOCO */}
        <div className="shrink-0 flex items-center justify-center p-3 px-4 rounded-2xl bg-slate-50/80 border border-slate-100 shadow-2xs">
          <img
            src="/enfoco-logo.png"
            alt="ENFOCO Logo"
            className="h-10 md:h-12 w-auto object-contain"
          />
        </div>
      </div>
    </div>
  );
};