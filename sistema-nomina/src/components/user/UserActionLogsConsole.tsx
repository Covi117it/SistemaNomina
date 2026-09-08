import React, { useState, useMemo } from 'react';
import { 
  Search, 
  ChevronDown, 
  RotateCw, 
  Terminal, 
  Info, 
  AlertTriangle, 
  CheckCircle2,
  Loader2 
} from 'lucide-react';

export interface UserActionLog {
  id: string | number;
  fecha: string;
  hora: string;
  modulo: 'AUTH' | 'NOMINA' | 'EMPLEADOS' | 'EVENTOS' | 'SISTEMA' | string;
  tipo: 'info' | 'action' | 'warn';
  tarea: string;
  detalles?: string;
  fechaHora?: string;
}

interface UserActionLogsConsoleProps {
  logs?: UserActionLog[];
  loading?: boolean;
  onRefresh?: () => void;
}

export const UserActionLogsConsole: React.FC<UserActionLogsConsoleProps> = ({
  logs = [],
  loading = false,
  onRefresh,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModule, setSelectedModule] = useState<string>('TODOS');

  const availableModules = useMemo(() => {
    const modulos = Array.from(new Set(logs.map((l) => l.modulo.toUpperCase())));
    return ['TODOS', ...modulos];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch = 
        log.tarea.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.detalles && log.detalles.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchModule = selectedModule === 'TODOS' || log.modulo.toUpperCase() === selectedModule;
      return matchSearch && matchModule;
    });
  }, [logs, searchTerm, selectedModule]);

  const parseFechaUtc = (fechaStr?: string): Date | null => {
    if (!fechaStr) return null;
    const isoUtc = fechaStr.endsWith('Z') ? fechaStr : `${fechaStr}Z`;
    const d = new Date(isoUtc);
    return isNaN(d.getTime()) ? null : d;
  };

  const formatLogTime = (log: UserActionLog) => {
    if (log.fechaHora) {
      const d = parseFechaUtc(log.fechaHora);
      if (d) {
        return d.toLocaleTimeString('es-DO', {
          timeZone: 'America/Santo_Domingo',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true
        });
      }
    }
    return log.hora;
  };

  const formatLogDate = (log: UserActionLog) => {
    if (log.fechaHora) {
      const d = parseFechaUtc(log.fechaHora);
      if (d) {
        return d.toLocaleDateString('es-DO', {
          timeZone: 'America/Santo_Domingo',
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        });
      }
    }
    return log.fecha;
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      {/* Toolbar integrada al diseño de la App */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50/70 border-b border-slate-100">
        <div className="flex items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Selector de Módulo dinámico */}
          <div className="relative">
            <select
              value={selectedModule}
              onChange={(e) => setSelectedModule(e.target.value)}
              className="appearance-none bg-white border border-slate-200/80 text-slate-700 font-bold text-xs rounded-xl pl-3 pr-8 py-2 focus:outline-none focus:border-indigo-500 shadow-2xs cursor-pointer"
            >
              {availableModules.map((mod) => (
                <option key={mod} value={mod}>
                  {mod === 'TODOS' ? 'Todos los módulos' : `Módulo: ${mod}`}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Buscador de tareas */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar tareas ejecutadas, detalles o IPs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200/80 text-slate-800 placeholder-slate-400 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:border-indigo-500 shadow-2xs font-medium"
            />
          </div>
        </div>

        {/* Acciones del Toolbar */}
        <div className="flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              title="Actualizar registros desde el servidor"
              className="px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80 rounded-xl transition-colors cursor-pointer shadow-2xs flex items-center gap-1.5 text-xs font-bold"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Actualizar</span>
            </button>
          )}
        </div>
      </div>

      {/* Lista de Registros / Acciones (Estilo Log Limpio) */}
      <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
        {loading ? (
          <div className="py-14 flex flex-col items-center justify-center gap-2.5 text-slate-500">
            <Loader2 className="w-7 h-7 text-indigo-600 animate-spin" />
            <span className="text-xs font-bold text-slate-700">Consultando historial de auditoría...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-12 text-center text-slate-500 space-y-2">
            <Terminal className="w-8 h-8 mx-auto text-slate-400" />
            <p className="text-xs font-bold text-slate-700">No se encontraron tareas registradas</p>
            <p className="text-[11px] text-slate-400">Este usuario aún no tiene acciones registradas en el sistema.</p>
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isWarn = log.tipo === 'warn';
            const isAction = log.tipo === 'action';

            return (
              <div 
                key={log.id}
                className={`flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-3 px-5 py-3 transition-colors text-xs ${
                  isWarn 
                    ? 'bg-amber-50/50 hover:bg-amber-50/80 border-l-4 border-amber-400' 
                    : 'hover:bg-slate-50/80 border-l-4 border-transparent'
                }`}
              >
                {/* Timestamp exacto con tipografía tabular/mono */}
                <div className="flex items-center gap-2 shrink-0 select-none">
                  {isWarn ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  ) : isAction ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  )}
                  <span className="font-mono font-bold text-slate-800 text-[11px]">
                    {formatLogTime(log)}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ({formatLogDate(log)})
                  </span>
                </div>

                {/* Badge del Módulo */}
                <span className="shrink-0 font-mono text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md border bg-slate-100 text-slate-700 border-slate-200">
                  [{log.modulo.toLowerCase()}]
                </span>

                {/* Tipo / Nivel de acción */}
                <span className={`shrink-0 font-mono text-[11px] font-bold ${
                  isWarn 
                    ? 'text-amber-700' 
                    : isAction 
                    ? 'text-emerald-700' 
                    : 'text-blue-700'
                }`}>
                  {log.tipo}:
                </span>

                {/* Descripción de la tarea y detalles */}
                <div className="min-w-0 flex-1">
                  <span className="font-semibold text-slate-900">
                    {log.tarea}
                  </span>
                  {log.detalles && (
                    <span className="text-slate-500 text-[11px] ml-2 block sm:inline font-medium">
                      — {log.detalles}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pie de estado de la consola */}
      <div className="px-5 py-2.5 bg-slate-50/60 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="font-medium">
          {logs.length === 0 ? 'Sin registros históricos' : `Historial de ${logs.length} tarea(s) registradas`}
        </span>
        <span className="font-bold text-slate-600">
          Mostrando {filteredLogs.length} registro(s)
        </span>
      </div>
    </div>
  );
};