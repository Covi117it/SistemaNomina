import React, { useState, useEffect } from 'react';
import { X, User, Mail, Lock, Shield, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { Usuario, CrearUsuarioRequest, ActualizarUsuarioRequest } from '../../types/usuario';
import { FormSelect } from '../common/FormSelect';
import { getPermissionsForRole } from '../../constants/permissions';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CrearUsuarioRequest | ActualizarUsuarioRequest, isEdit: boolean, id?: number) => Promise<void>;
  userToEdit?: Usuario | null;
}

const ROLES = [
  { value: 'Admin', label: 'Administrador (Acceso total)' },
  { value: 'RRHH', label: 'Recursos Humanos (Gestión de Personal)' },
  { value: 'Contador', label: 'Contabilidad (Nómina y Finanzas)' },
  { value: 'Auditor', label: 'Auditor (Solo Lectura)' },
  { value: 'Operador', label: 'Operador (Básico)' },
];

export const UserFormModal: React.FC<UserFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  userToEdit,
}) => {
  const isEdit = !!userToEdit;

  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState('RRHH');
  const [activo, setActivo] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userToEdit) {
      setNombreCompleto(userToEdit.nombreCompleto);
      setEmail(userToEdit.email);
      setPassword(''); // Vacío en edición para solo actualizar si se escribe algo
      setRol(userToEdit.rol);
      setActivo(userToEdit.activo);
    } else {
      setNombreCompleto('');
      setEmail('');
      setPassword('');
      setRol('RRHH');
      setActivo(true);
    }
    setError(null);
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isEdit && (!password || password.length < 6)) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setLoading(true);
    try {
      if (isEdit && userToEdit) {
        const updateData: ActualizarUsuarioRequest = {
          nombreCompleto,
          email,
          password: password.trim() ? password : undefined,
          rol,
          permisosJson: JSON.stringify(getPermissionsForRole(rol)),
          activo,
        };
        await onSave(updateData, true, userToEdit.id);
      } else {
        const createData: CrearUsuarioRequest = {
          nombreCompleto,
          email,
          password,
          rol,
          permisosJson: JSON.stringify(getPermissionsForRole(rol)),
        };
        await onSave(createData, false);
      }
      onClose();
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Ocurrió un error al guardar el usuario.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {isEdit ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                {isEdit ? 'Modifica los permisos y accesos de la cuenta' : 'Registra un nuevo colaborador en el sistema'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-2.5 text-xs font-semibold text-rose-700 animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Nombre Completo */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Nombre Completo
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={nombreCompleto}
                onChange={(e) => setNombreCompleto(e.target.value)}
                placeholder="Ej. Carlos Mendoza"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-sm text-slate-800 placeholder-slate-400 transition-all outline-none"
              />
            </div>
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@empresa.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-sm text-slate-800 placeholder-slate-400 transition-all outline-none"
              />
            </div>
          </div>

          {/* Rol */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
              Rol en el Sistema
            </label>
            <FormSelect
              options={ROLES}
              value={rol}
              onChange={setRol}
              className="w-full py-2.5 text-sm"
            />
          </div>

          {/* Contraseña */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider flex items-center justify-between">
              <span>Contraseña {isEdit && <span className="text-slate-400 normal-case font-normal">(Opcional si no se va a cambiar)</span>}</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required={!isEdit}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={isEdit ? 'Dejar en blanco para mantener la actual' : 'Mínimo 6 caracteres'}
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-sm text-slate-800 placeholder-slate-400 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Estado Activo / Inactivo (solo en edición) */}
          {isEdit && (
            <div className="pt-2">
              <label className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100/80 transition-colors">
                <input
                  type="checkbox"
                  checked={activo}
                  onChange={(e) => setActivo(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <div>
                  <span className="text-xs font-bold text-slate-800 block">Usuario Activo</span>
                  <span className="text-[11px] text-slate-500 block">Permite o bloquea el inicio de sesión de este colaborador</span>
                </div>
              </label>
            </div>
          )}

          {/* Botones de Acción */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Guardando...' : (isEdit ? 'Actualizar Usuario' : 'Crear Usuario')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};