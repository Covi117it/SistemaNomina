import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Save, 
  RotateCcw, 
  ShieldCheck, 
  User, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  UserCheck,
  UserX
} from 'lucide-react';
import Swal from 'sweetalert2';
import { ActionsDropdown } from '../components/common/ActionsDropdown';
import { authApi } from '../service/api/authApi';
import { Usuario, CrearUsuarioRequest, ActualizarUsuarioRequest } from '../types/usuario';
import { FormSelect } from '../components/common/FormSelect';
import { getPermissionsForRole } from '../constants/permissions';

interface CreateUserPageProps {
  initialData?: Usuario | null;
  isEditMode?: boolean;
  onBack: () => void;
  onSaveSuccess?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToDirectory?: () => void;
  onNavigateToCreate?: () => void;
  onNavigateToPayroll?: () => void;
  onNavigateToHistory?: () => void;
  onNavigateToDistribution?: () => void;
  onNavigateToUsers?: () => void;
}

const ROLES = [
  { value: 'Admin', label: 'Administrador (Acceso total)' },
  { value: 'RRHH', label: 'Recursos Humanos (Gestión de Personal)' },
  { value: 'Contador', label: 'Contabilidad (Nómina y Finanzas)' },
  { value: 'Auditor', label: 'Auditor (Solo Lectura)' },
  { value: 'Operador', label: 'Operador (Básico)' },
];

export const CreateUserPage: React.FC<CreateUserPageProps> = ({
  initialData,
  isEditMode = false,
  onBack,
  onSaveSuccess,
  onNavigateToDashboard,
  onNavigateToDirectory,
  onNavigateToCreate,
  onNavigateToPayroll,
  onNavigateToHistory,
  onNavigateToDistribution,
  onNavigateToUsers,
}) => {
  const [nombreCompleto, setNombreCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rol, setRol] = useState(() => isEditMode && initialData ? initialData.rol : 'RRHH');
  const [activo, setActivo] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData && isEditMode) {
      setNombreCompleto(initialData.nombreCompleto);
      setEmail(initialData.email);
      setPassword('');
      setConfirmPassword('');
      setRol(initialData.rol);
      setActivo(initialData.activo);
    } else {
      setNombreCompleto('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRol('RRHH');
      setActivo(true);
    }
    setError(null);
  }, [initialData, isEditMode]);

  const handleReset = () => {
    if (initialData && isEditMode) {
      setNombreCompleto(initialData.nombreCompleto);
      setEmail(initialData.email);
      setPassword('');
      setConfirmPassword('');
      setRol(initialData.rol);
      setActivo(initialData.activo);
    } else {
      setNombreCompleto('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRol('RRHH');
      setActivo(true);
    }
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!ROLES.some((option) => option.value === rol)) {
      setError('Selecciona un rol válido antes de guardar.');
      return;
    }

    if (!nombreCompleto.trim()) {
      setError('El nombre completo es obligatorio.');
      return;
    }

    if (!email.trim()) {
      setError('El correo electrónico es obligatorio.');
      return;
    }

    if (!isEditMode || password.trim() !== '') {
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    setSaving(true);
    try {
      if (isEditMode && initialData) {
        const payload: ActualizarUsuarioRequest = {
          nombreCompleto: nombreCompleto.trim(),
          email: email.trim().toLowerCase(),
          password: password.trim() ? password : undefined,
          rol: rol,
          permisosJson: rol === initialData.rol
            ? initialData.permisosJson
            : JSON.stringify(getPermissionsForRole(rol)),
          activo: activo,
        };

        await authApi.updateUsuario(initialData.id, payload);

        Swal.fire({
          icon: 'success',
          title: '¡Usuario actualizado!',
          text: `Los datos de ${nombreCompleto} han sido modificados correctamente.`,
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        const payload: CrearUsuarioRequest = {
          nombreCompleto: nombreCompleto.trim(),
          email: email.trim().toLowerCase(),
          password: password,
          rol: rol,
          permisosJson: JSON.stringify(getPermissionsForRole(rol)),
        };

        await authApi.createUsuario(payload);

        Swal.fire({
          icon: 'success',
          title: '¡Usuario creado!',
          text: `El colaborador ${nombreCompleto} ha sido registrado correctamente.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }

      if (onSaveSuccess) {
        onSaveSuccess();
      } else {
        onBack();
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al guardar el usuario en el servidor.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Barra Superior con ActionsDropdown y Botón Volver */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onNavigateToDashboard && (
            <ActionsDropdown
              onNavigateToDashboard={onNavigateToDashboard}
              onNavigateToDirectory={onNavigateToDirectory}
              onNavigateToCreate={onNavigateToCreate}
              onNavigateToPayroll={onNavigateToPayroll}
              onNavigateToHistory={onNavigateToHistory}
              onNavigateToDistribution={onNavigateToDistribution}
              onNavigateToUsers={onNavigateToUsers}
            />
          )}
          <button
            onClick={onBack}
            className="px-3.5 py-2 bg-white border border-slate-200/80 hover:bg-slate-100 text-slate-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Volver a Gestión de Usuarios</span>
          </button>
        </div>
      </div>

      {/* 2. Formulario y Cabecera Centrados */}
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Tarjeta de Cabecera / Previsualización */}
        <div className="bg-white border border-slate-200/80 rounded-[28px] p-6 md:p-8 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                  {nombreCompleto && nombreCompleto.trim() !== ''
                    ? nombreCompleto
                    : (isEditMode ? 'Editar Usuario' : 'Nuevo Usuario')}
                </h1>
                <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0" />
              </div>
              <p className="text-xs font-medium text-slate-500">
                {email ? email : (isEditMode ? 'Modificación de cuenta y permisos' : 'Formulario de registro y credenciales de acceso')}
              </p>
            </div>

            <div className="flex items-center gap-5 text-xs">
              <div className="text-left sm:text-right">
                <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider">
                  Rol Asignado
                </span>
                <span className="font-extrabold text-indigo-700 text-xs px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full inline-block mt-0.5">
                  {rol}
                </span>
              </div>

              <div className="text-left sm:text-right pl-5 border-l border-slate-200/80">
                <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider">
                  Estado
                </span>
                <span
                  className={`font-black text-xs px-3 py-1 rounded-full inline-block mt-0.5 ${
                    activo
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {activo ? 'ACTIVO' : 'INACTIVO'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario Principal */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center gap-3 text-xs font-bold text-rose-700 animate-fadeIn">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sección 1: Información General */}
          <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 md:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Información del Colaborador
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Nombre Completo */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Nombre Completo *
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Correo Electrónico */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Correo Electrónico (Login) *
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
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección 2: Rol y Nivel de Acceso */}
          <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 md:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Nivel de Acceso y Permisos
              </h2>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                Rol en el Sistema *
              </label>
              <FormSelect
                options={ROLES}
                value={rol}
                onChange={setRol}
                className="w-full py-2.5 text-xs font-bold"
              />
              <p className="text-[11px] text-slate-400 mt-1.5">
                Define las secciones y funciones a las que este usuario tendrá acceso en la plataforma.
              </p>
            </div>
          </div>

          {/* Sección 3: Seguridad y Contraseña */}
          <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 md:p-8 shadow-xs space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                <Lock className="w-4 h-4" />
              </div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center justify-between">
                <span>Credenciales de Seguridad</span>
                {isEditMode && (
                  <span className="text-[11px] text-slate-400 normal-case font-normal">
                    (Dejar en blanco para conservar la contraseña actual)
                  </span>
                )}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Contraseña */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  {isEditMode ? 'Nueva Contraseña (Opcional)' : 'Contraseña *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!isEditMode}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isEditMode ? 'Escribir solo para cambiar' : 'Mínimo 6 caracteres'}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 transition-all outline-none"
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

              {/* Confirmar Contraseña */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  {isEditMode ? 'Confirmar Nueva Contraseña' : 'Confirmar Contraseña *'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!isEditMode && password.length > 0}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={isEditMode ? 'Confirmar nueva contraseña' : 'Repita la contraseña'}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:bg-white rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 transition-all outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección 4: Estado de la Cuenta (Activo / Inactivo) */}
          <div className="bg-white border border-slate-200/80 rounded-[24px] p-6 md:p-8 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
              <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                {activo ? <UserCheck className="w-4 h-4 text-emerald-600" /> : <UserX className="w-4 h-4 text-rose-600" />}
              </div>
              <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">
                Estado de la Cuenta
              </h2>
            </div>

            <label className="flex items-center gap-3.5 p-4 bg-slate-50 border border-slate-200 rounded-2xl cursor-pointer hover:bg-slate-100/70 transition-colors">
              <input
                type="checkbox"
                checked={activo}
                onChange={(e) => setActivo(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
              />
              <div>
                <span className="text-xs font-bold text-slate-900 block">
                  Cuenta Activa
                </span>
                <span className="text-[11px] text-slate-500 block">
                  Permite o suspende el acceso de este usuario a la plataforma.
                </span>
              </div>
            </label>
          </div>

          {/* Botones de Acción Inferiores */}
          <div className="flex items-center justify-center gap-3 pt-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              {isEditMode ? 'Restablecer Datos' : 'Limpiar Formulario'}
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-7 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Guardando...' : (isEditMode ? 'Guardar Cambios' : 'Guardar Usuario')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
