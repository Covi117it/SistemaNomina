import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Mail, 
  Shield, 
  Calendar, 
  Activity, 
  CheckCircle2, 
  XCircle,
  Terminal
} from 'lucide-react';
import { Usuario } from '../types/usuario';
import { authApi } from '../service/api/authApi';
import { UserActionLogsConsole, UserActionLog } from '../components/user/UserActionLogsConsole';

interface UserAuditPageProps {
  user: Usuario | null;
  onBack: () => void;
}

export const UserAuditPage: React.FC<UserAuditPageProps> = ({ user, onBack }) => {
  const [logs, setLogs] = useState<UserActionLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);

  // Carga las acciones reales registradas en el backend
  const loadAuditLogs = async () => {
    if (!user) return;
    setLoadingLogs(true);
    try {
      const data = await authApi.fetchAuditoriaUsuario(user.id);
      setLogs(data);
    } catch (err) {
      console.error('Error al cargar acciones de auditoría:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    loadAuditLogs();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <button
          onClick={onBack}
          className="px-3.5 py-2 bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Volver a Gestión de Usuarios</span>
        </button>
        <div className="mt-8 bg-white border border-slate-200/80 rounded-2xl p-12 text-center text-slate-500 font-bold text-sm">
          No se ha seleccionado ningún usuario para inspeccionar.
        </div>
      </div>
    );
  }

  const initials = user.nombreCompleto
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const parseFechaUtc = (fechaStr?: string): Date | null => {
    if (!fechaStr) return null;
    const isoUtc = fechaStr.endsWith('Z') ? fechaStr : `${fechaStr}Z`;
    const d = new Date(isoUtc);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatFechaLegible = (fechaStr?: string) => {
    if (!fechaStr) return 'Sin registro';
    const d = parseFechaUtc(fechaStr);
    if (!d) return fechaStr;
    return d.toLocaleDateString('es-DO', {
      timeZone: 'America/Santo_Domingo',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Botón superior de retorno */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3.5 py-2 bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-slate-600" />
          <span>Volver a Gestión de Usuarios</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
          <Terminal className="w-4 h-4 text-indigo-500" />
          <span>Auditoría de Actividad</span>
        </div>
      </div>

      {/* Ficha de Identidad del Usuario */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-black text-xl flex items-center justify-center shadow-xs shrink-0">
            {initials || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {user.nombreCompleto}
              </h1>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold border ${
                user.activo 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {user.activo ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                {user.activo ? 'ACTIVO' : 'INACTIVO'}
              </span>
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Chips de Métricas (Datos Reales de Usuario y Auditoría) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <Shield className="w-4 h-4 text-purple-600" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Rol de Acceso
            </span>
            <span className="text-xs font-bold text-slate-800 truncate block">
              {user.rol || 'Sin rol'}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Último Acceso
            </span>
            <span className="text-xs font-bold text-slate-800 truncate block">
              {formatFechaLegible(user.ultimoAcceso)}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Acciones Totales
            </span>
            <span className="text-xs font-bold text-slate-800 truncate block">
              {loadingLogs ? 'Cargando...' : `${logs.length} tarea(s)`}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-3.5 shadow-xs flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 shrink-0">
            <Calendar className="w-4 h-4 text-amber-600" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
              Fecha de Registro
            </span>
            <span className="text-xs font-bold text-slate-800 truncate block">
              {formatFechaLegible(user.fechaCreacion)}
            </span>
          </div>
        </div>
      </div>

      {/* Componente Consola conectado con datos reales */}
      <UserActionLogsConsole 
        logs={logs}
        loading={loadingLogs}
        onRefresh={loadAuditLogs}
      />
    </div>
  );
};