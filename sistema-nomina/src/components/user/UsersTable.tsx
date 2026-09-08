import React from 'react';
import { Edit2, Trash2, Shield, Calendar, Mail, Loader2, Users } from 'lucide-react';
import { Usuario } from '../../types/usuario';
import { StatusBadge } from '../common/StatusBadge';

interface UsersTableProps {
  users: Usuario[];
  loading: boolean;
  onEdit: (user: Usuario) => void;
  onDelete: (user: Usuario) => void;
  onInspect?: (user: Usuario) => void; 
}

const getRoleBadgeStyle = (rol: string) => {
  switch (rol.toUpperCase()) {
    case 'ADMIN':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'RRHH':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'CONTADOR':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'AUDITOR':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  onEdit,
  onDelete,
  onInspect, 
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-slate-500 shadow-xs">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        <span className="text-xs font-bold">Cargando usuarios...</span>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white border border-slate-200/80 rounded-2xl p-12 flex flex-col items-center justify-center gap-3 text-center shadow-xs">
        <div className="p-3 bg-slate-50 text-slate-400 rounded-2xl border border-slate-100">
          <Users className="w-8 h-8" />
        </div>
        <h3 className="text-base font-bold text-slate-800">No se encontraron usuarios</h3>
        <p className="text-xs text-slate-500 max-w-sm">
          No hay usuarios que coincidan con los filtros aplicados o aún no se han registrado colaboradores.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-5">Usuario / Colaborador</th>
              <th className="py-3.5 px-4">Rol de Acceso</th>
              <th className="py-3.5 px-4">Estado</th>
              <th className="py-3.5 px-4">Último Acceso</th>
              <th className="py-3.5 px-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {users.map((u) => {
              const initials = u.nombreCompleto
                .split(' ')
                .map((n) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <tr 
                  key={u.id} 
                  onDoubleClick={() => onInspect?.(u)}
                   title="Doble clic para inspeccionar actividad"
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer select-none group"
>
                  {/* Nombre y Correo */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                        {initials || 'U'}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 block truncate">
                          {u.nombreCompleto}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1 truncate">
                          <Mail className="w-3 h-3 shrink-0" />
                          {u.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Rol */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border inline-flex items-center gap-1.5 ${getRoleBadgeStyle(
                        u.rol
                      )}`}
                    >
                      <Shield className="w-3 h-3" />
                      {u.rol}
                    </span>
                  </td>

                  {/* Estado (Reutilizando StatusBadge) */}
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <StatusBadge status={u.activo ? 'ACTIVO' : 'INACTIVO'} />
                  </td>

                  {/* Último Acceso */}
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px]">
                    {u.ultimoAcceso ? (
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {new Date(u.ultimoAcceso).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Nunca</span>
                    )}
                  </td>

                  {/* Acciones */}
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onEdit(u)}
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                        title="Editar usuario"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => onDelete(u)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar usuario"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};