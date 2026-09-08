import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from 'lucide-react';
import { authApi } from '../service/api/authApi';
import { secureStorage } from '../service/secureStorage';
import { Usuario } from '../types/usuario';

interface LoginPageProps {
  onLoginSuccess?: (user: Usuario) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  // Envío de formulario de inicio de sesión
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      const user = await authApi.login({
        email: loginEmail,
        password: loginPassword,
        rememberMe: rememberMe,
      });

      // Guardar sesión en localStorage 
      localStorage.setItem('auth_user', JSON.stringify(user));

      if (user.tokenSesion && rememberMe) {
        await secureStorage.guardarToken(user.tokenSesion);
      } else {
        await secureStorage.eliminarToken();
      }

      if (onLoginSuccess) {
        onLoginSuccess(user as Usuario);
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al conectar con el servidor. Intente nuevamente.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-[#8ad3c5] flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
      {/* Contenedor Principal de la Tarjeta */}
      <div className="relative w-full max-w-4xl min-h-[520px] bg-white rounded-[28px] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* ================= PANEL IZQUIERDO (FORMULARIO) ================= */}
        <div className="w-full md:w-7/12 flex flex-col items-center justify-center px-8 py-10 sm:px-14 z-10">
          <form onSubmit={handleLoginSubmit} className="w-full flex flex-col items-center max-w-sm">
            <h1 className="text-3xl font-extrabold text-slate-800 mb-2 tracking-tight">
              Iniciar Sesión
            </h1>

            <span className="text-xs text-slate-500 font-medium mb-6">
              Ingrese sus credenciales de acceso institucional
            </span>

            {/* Mensajes de Error */}
            {errorMessage && (
              <div className="w-full mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Input Email */}
            <div className="w-full relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-100/90 border border-transparent focus:border-emerald-400 focus:bg-white rounded-lg text-sm text-slate-800 placeholder-slate-400 transition-all outline-none"
              />
            </div>

            {/* Input Password */}
            <div className="w-full relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-100/90 border border-transparent focus:border-emerald-400 focus:bg-white rounded-lg text-sm text-slate-800 placeholder-slate-400 transition-all outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

             {/* Checkbox Recordarme */}
            <div className="w-full flex items-center justify-between mb-5">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-600 hover:text-slate-800 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 text-[#33aa8f] focus:ring-[#33aa8f] cursor-pointer accent-[#33aa8f]"
                />
                <span>Mantener mi sesión iniciada</span>
              </label>
            </div>


            {/* Botón Iniciar Sesión */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#33aa8f] hover:bg-[#2c967e] text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-md shadow-emerald-500/20 active:scale-98 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'VERIFICANDO CREDENCIALES...' : 'INICIAR SESIÓN'}
            </button>
          </form>
        </div>

        {/* ================= PANEL DERECHO CURVO ================= */}
        <div className="w-full md:w-5/12 bg-[#33aa8f] flex flex-col items-center justify-center p-8 sm:p-10 text-white md:rounded-l-[180px]">
          <div className="flex flex-col items-center text-center max-w-xs animate-fadeIn">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
              Sistema de Nómina
            </h2>
            <p className="text-sm font-light text-white/95 leading-relaxed">
              Plataforma de gestión y administración de personal. Acceso exclusivo para colaboradores autorizados.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};