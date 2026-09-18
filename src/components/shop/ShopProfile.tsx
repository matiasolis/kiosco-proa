import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  User as UserIcon,
  Mail,
  Calendar,
  ShoppingBag,
  DollarSign,
  Heart,
  Save,
  CheckCircle2,
  AlertCircle,
  LogOut,
} from 'lucide-react';

export const ShopProfile: React.FC = () => {
  const { currentUser, token, logout, addToast, refreshAllData } = useApp();

  const [nombre, setNombre] = useState(currentUser?.nombre || '');
  const [apellido, setApellido] = useState(currentUser?.apellido || '');
  const [nombreVisible, setNombreVisible] = useState(currentUser?.nombreVisible || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!currentUser) return null;

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nombre, apellido, nombreVisible }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMsg({ type: 'error', text: data.error || 'Error al actualizar perfil.' });
        return;
      }

      setMsg({ type: 'success', text: 'Tus datos fueron actualizados correctamente.' });
      addToast('success', 'Perfil actualizado', 'Datos personales guardados.');
      refreshAllData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Top Banner Card */}
      <div className="bg-gradient-to-r from-sky-600 to-cyan-600 rounded-3xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-center gap-6 shadow-xl shadow-sky-500/10">
        <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center font-black text-3xl uppercase border-2 border-white/40 shadow-inner shrink-0">
          {currentUser.nombreVisible.charAt(0)}
        </div>

        <div className="text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider mb-1.5">
            Cuenta de Alumno
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">{currentUser.nombreVisible}</h1>
          <p className="text-sky-100 text-xs mt-0.5">
            {currentUser.nombre} {currentUser.apellido} • {currentUser.email}
          </p>
        </div>

        <button
          id="profile-logout-btn"
          onClick={logout}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Total Gastado</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(currentUser.totalSpent || 0)}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Histórico en el kiosco</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Pedidos Realizados</span>
            <ShoppingBag className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {currentUser.orderCount || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Compras confirmadas</span>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">Favoritos Guardados</span>
            <Heart className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {currentUser.favorites?.length || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">Snacks y bebidas preferidas</span>
        </div>
      </div>

      {/* Edit Personal Data Form */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-1">
          Datos Personales
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          Podés actualizar tu nombre visible para que el kiosco te identifique fácilmente al retirar.
        </p>

        {msg && (
          <div
            className={`mb-5 p-3 rounded-xl text-xs flex items-center gap-2 ${
              msg.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border border-emerald-200'
                : 'bg-rose-50 dark:bg-rose-950 text-rose-800 dark:text-rose-200 border border-rose-200'
            }`}
          >
            {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre
              </label>
              <input
                id="profile-nombre-input"
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Apellido
              </label>
              <input
                id="profile-apellido-input"
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Nombre Visible / Apodo
              </label>
              <span className="text-[10px] text-slate-400">Solo letras y espacios, sin números</span>
            </div>
            <input
              id="profile-nombre-visible-input"
              type="text"
              value={nombreVisible}
              onChange={(e) => setNombreVisible(e.target.value)}
              required
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Correo Electrónico (Identificador de cuenta)
            </label>
            <input
              type="email"
              disabled
              value={currentUser.email}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 cursor-not-allowed"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              id="save-profile-btn"
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
