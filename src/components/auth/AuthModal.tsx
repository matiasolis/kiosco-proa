import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Lock, Mail, User as UserIcon, Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const AuthModal: React.FC = () => {
  const { authModalOpen, setAuthModalOpen, authModalTab, setAuthModalTab, login, register } = useApp();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [nombreVisible, setNombreVisible] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!authModalOpen) return null;

  const validateClientName = (name: string): string | null => {
    if (!name.trim()) return 'El nombre visible es obligatorio.';
    if (name.trim().length < 2) return 'Mínimo 2 caracteres.';
    if (name.trim().length > 20) return 'Máximo 20 caracteres.';
    if (/\d/.test(name)) return 'No se permiten números en el nombre visible.';
    if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/.test(name)) return 'Solo letras y espacios (sin símbolos extraños).';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      if (authModalTab === 'login') {
        const ok = await login(email, password);
        if (!ok) {
          setErrorMsg('Email o contraseña incorrectos.');
        }
      } else {
        const nameErr = validateClientName(nombreVisible);
        if (nameErr) {
          setErrorMsg(nameErr);
          setLoading(false);
          return;
        }

        const ok = await register({
          nombre,
          apellido,
          nombreVisible,
          email,
          password,
        });
        if (!ok) {
          setErrorMsg('No se pudo completar el registro. Verificá los datos ingresados.');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await login(demoEmail, demoPass);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="auth-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
      >
        {/* Header with School Celeste theme */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 p-6 text-white relative">
          <button
            id="close-auth-modal"
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-white/20 rounded-full">
              Kiosco Escolar
            </span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight">
            {authModalTab === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta de Alumno'}
          </h2>
          <p className="text-sky-100 text-xs mt-1">
            {authModalTab === 'login'
              ? 'Accedé a tus compras o al panel de administración con tu email.'
              : 'Registrate para pedir desde tu celular y retirar en el recreo.'}
          </p>

          {/* Tab Switcher */}
          <div className="mt-5 grid grid-cols-2 p-1 bg-black/15 backdrop-blur-md rounded-xl text-sm font-medium">
            <button
              id="tab-login-btn"
              type="button"
              onClick={() => {
                setAuthModalTab('login');
                setErrorMsg('');
              }}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                authModalTab === 'login'
                  ? 'bg-white text-sky-700 font-bold shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              id="tab-register-btn"
              type="button"
              onClick={() => {
                setAuthModalTab('register');
                setErrorMsg('');
              }}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                authModalTab === 'register'
                  ? 'bg-white text-sky-700 font-bold shadow-xs'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              Registrarse
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {authModalTab === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nombre
                    </label>
                    <input
                      id="register-nombre-input"
                      type="text"
                      required
                      placeholder="Ej. Matías"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Apellido
                    </label>
                    <input
                      id="register-apellido-input"
                      type="text"
                      required
                      placeholder="Ej. Olís"
                      value={apellido}
                      onChange={(e) => setApellido(e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Nombre visible / Apodo
                    </label>
                    <span className="text-[10px] text-slate-400">Sin números ni símbolos</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-4 h-4" />
                    </div>
                    <input
                      id="register-nombre-visible-input"
                      type="text"
                      required
                      placeholder="Ej. Matias"
                      value={nombreVisible}
                      onChange={(e) => setNombreVisible(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Es el nombre que verá el kiosco en tus pedidos.
                  </p>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="auth-email-input"
                  type="email"
                  required
                  placeholder="alumno@colegio.edu o admin@kiosco.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="auth-password-input"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-semibold text-sm rounded-xl shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading
                ? 'Procesando...'
                : authModalTab === 'login'
                ? 'Ingresar al Kiosco'
                : 'Crear Mi Cuenta'}
            </button>
          </form>

          {/* Quick Demo Access Bar */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-1.5 mb-2.5 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Accesos Rápidos Demo (1 Click)</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                id="quick-login-admin-btn"
                type="button"
                onClick={() => handleQuickLogin('admin@kiosco.edu', 'admin123')}
                disabled={loading}
                className="p-2.5 text-left rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/70 dark:bg-sky-950/40 hover:bg-sky-100 dark:hover:bg-sky-900/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-sky-800 dark:text-sky-300">
                  <ShieldCheck className="w-4 h-4 text-sky-600" />
                  <span>Administrador</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  admin@kiosco.edu
                </div>
              </button>

              <button
                id="quick-login-student-btn"
                type="button"
                onClick={() => handleQuickLogin('matias@alumno.edu', 'alumno123')}
                disabled={loading}
                className="p-2.5 text-left rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300">
                  <UserIcon className="w-4 h-4 text-emerald-600" />
                  <span>Alumno Matías</span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  matias@alumno.edu
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
