import React from 'react';

export const DashboardHeader: React.FC = () => {
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
    <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 md:p-8 shadow-xs flex items-center justify-between gap-6">
      {/* Texto e Información de Bienvenida */}
      <div className="space-y-1.5">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
         Centro de Control
        </h1>

        <p className="text-xs font-medium text-slate-500 flex items-center gap-2">
          <span>{getFormattedDate()}</span>
        </p>
      </div>

      {/* Logo Institucional ENFOCO */}
      <div className="shrink-0 flex items-center justify-center p-3 px-4 rounded-2xl bg-slate-50/80 border border-slate-100 shadow-2xs">
        <img
          src="/enfoco-logo.png"
          alt="ENFOCO Logo"
          className="h-10 md:h-12 w-auto object-contain"
        />
      </div>
    </div>
  );
};
