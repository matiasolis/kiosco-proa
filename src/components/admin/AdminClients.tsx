import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Users, Search, Ban, CheckCircle, ShoppingBag, DollarSign, ShieldAlert } from 'lucide-react';

export const AdminClients: React.FC = () => {
  const { token, addToast } = useApp();

  const [clients, setClients] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchClients = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/clients', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data.clients || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [token]);

  const handleToggleBlock = async (client: User) => {
    const nextBlocked = !client.bloqueado;
    try {
      const res = await fetch(`/api/clients/${client.id}/toggle-block`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ bloqueado: nextBlocked }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Error al cambiar estado');
        return;
      }
      addToast(
        'success',
        nextBlocked ? 'Cuenta Suspendida' : 'Cuenta Habilitada',
        `El alumno ${client.nombreVisible} ahora está ${nextBlocked ? 'bloqueado' : 'habilitado'}.`
      );
      fetchClients();
    } catch (e: any) {
      addToast('error', e.message);
    }
  };

  const filtered = clients.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.nombreVisible.toLowerCase().includes(q) ||
      c.nombre.toLowerCase().includes(q) ||
      c.apellido.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Gestión de Alumnos / Clientes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registro de usuarios, historial de consumo escolar y control de acceso.
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Buscar por nombre o email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Cargando alumnos...</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No se encontraron alumnos.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Alumno</th>
                  <th className="p-3.5">Email</th>
                  <th className="p-3.5">Pedidos Realizados</th>
                  <th className="p-3.5">Total Gastado</th>
                  <th className="p-3.5">Estado Cuenta</th>
                  <th className="p-3.5 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filtered.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 text-white font-bold flex items-center justify-center text-xs uppercase shrink-0">
                          {client.nombreVisible.charAt(0)}
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 dark:text-white block">
                            {client.nombreVisible}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {client.nombre} {client.apellido}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-300">{client.email}</td>

                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {client.orderCount || 0} compras
                    </td>

                    <td className="p-3.5 font-black text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(client.totalSpent || 0)}
                    </td>

                    <td className="p-3.5">
                      {client.bloqueado ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                          ⛔ Bloqueado
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                          ✓ Habilitado
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right">
                      <button
                        onClick={() => handleToggleBlock(client)}
                        className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                          client.bloqueado
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                            : 'bg-rose-100 hover:bg-rose-200 text-rose-800'
                        }`}
                      >
                        {client.bloqueado ? 'Desbloquear' : 'Bloquear'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
