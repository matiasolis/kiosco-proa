import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLog } from '../../types';
import { formatDateTime } from '../../utils/formatters';
import { History, Shield, Tag, Package, DollarSign, User } from 'lucide-react';

export const AdminActivity: React.FC = () => {
  const { token } = useApp();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch('/api/activity', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [token]);

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Historial de Auditoría & Actividad
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Trazabilidad de cambios de precios, modificaciones de stock y operaciones de administración.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Cargando registros de auditoría...</div>
        ) : logs.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No hay registros de actividad todavía.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {logs.map((log) => (
              <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 shrink-0 mt-0.5">
                  <Shield className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {log.accion}
                    </span>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap">
                      {formatDateTime(log.fecha)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{log.detalle}</p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    Operador: <strong className="text-slate-600 dark:text-slate-300">{log.usuarioNombre}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
