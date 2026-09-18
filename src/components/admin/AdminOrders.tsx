import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import { formatCurrency, formatDateTime, formatTime } from '../../utils/formatters';
import {
  Search,
  Filter,
  Clock,
  Store,
  PackageCheck,
  CheckCircle2,
  XCircle,
  FileText,
  DollarSign,
  User,
  AlertTriangle,
  ChevronDown,
  Check,
  Printer,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const AdminOrders: React.FC = () => {
  const { orders, token, addToast, refreshAllData, setActiveVoucherOrder } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterRetiro, setFilterRetiro] = useState<string>('all');
  const [filterPago, setFilterPago] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesNum = String(o.numeroPedido).includes(q);
        const matchesName =
          o.clienteNombre.toLowerCase().includes(q) ||
          o.clienteVisible.toLowerCase().includes(q);
        if (!matchesNum && !matchesName) return false;
      }

      // Status
      if (filterStatus !== 'all' && o.estado !== filterStatus) return false;

      // Modalidad retiro
      if (filterRetiro !== 'all' && o.modalidadRetiro !== filterRetiro) return false;

      // Metodo pago
      if (filterPago !== 'all' && o.metodoPago !== filterPago) return false;

      return true;
    });
  }, [orders, searchQuery, filterStatus, filterRetiro, filterPago]);

  const handleUpdateStatus = async (orderId: string, estado: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estado }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Error al cambiar estado');
        return;
      }
      addToast('success', `Pedido actualizado`, `Estado cambiado a "${estado}".`);
      refreshAllData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(data.order);
      }
    } catch (e: any) {
      addToast('error', e.message);
    }
  };

  const handleTogglePayment = async (orderId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'confirmado' ? 'pendiente' : 'confirmado';
    try {
      const res = await fetch(`/api/orders/${orderId}/payment`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ estadoPago: nextStatus }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Error al actualizar pago');
        return;
      }
      addToast('success', 'Pago actualizado', `Estado de pago: ${nextStatus}.`);
      refreshAllData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(data.order);
      }
    } catch (e: any) {
      addToast('error', e.message);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ motivo: cancelReason || 'Cancelado por administración' }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Error al cancelar');
        return;
      }
      addToast('success', 'Pedido cancelado', 'El stock de los productos fue restaurado automáticamente.');
      setCancellingOrderId(null);
      setCancelReason('');
      refreshAllData();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (e: any) {
      addToast('error', e.message);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Control de Pedidos en Vivo
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Actualización inmediata de cola, preparación, entregas y cobros.
          </p>
        </div>

        {/* Counts summary pill */}
        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-bold">
            {orders.filter((o) => o.estado === 'pendiente').length} Pendientes
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 font-bold">
            {orders.filter((o) => o.estado === 'preparando').length} Preparando
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold">
            {orders.filter((o) => o.estado === 'listo').length} Listos
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              id="search-orders-admin-input"
              type="text"
              placeholder="Buscar # pedido o alumno..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Status filter */}
          <div>
            <select
              id="filter-order-status-select"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="all">Todos los Estados</option>
              <option value="pendiente">🟡 Pendientes</option>
              <option value="preparando">🔵 Preparando</option>
              <option value="listo">🟢 Listos para Retirar</option>
              <option value="entregado">✅ Entregados</option>
              <option value="cancelado">❌ Cancelados</option>
            </select>
          </div>

          {/* Modalidad retiro filter */}
          <div>
            <select
              id="filter-order-retiro-select"
              value={filterRetiro}
              onChange={(e) => setFilterRetiro(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="all">Todas las Modalidades</option>
              <option value="inmediato">⚡ Retiro Inmediato</option>
              <option value="recreo">🕐 Retiro en Recreo</option>
            </select>
          </div>

          {/* Metodo pago filter */}
          <div>
            <select
              id="filter-order-pago-select"
              value={filterPago}
              onChange={(e) => setFilterPago(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
            >
              <option value="all">Todos los Métodos de Pago</option>
              <option value="efectivo">💵 Efectivo</option>
              <option value="mercadopago">📱 Mercado Pago</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center text-xs text-slate-400">
            No se encontraron pedidos con los filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Pedido</th>
                  <th className="p-3.5">Hora</th>
                  <th className="p-3.5">Alumno</th>
                  <th className="p-3.5">Items Solicitados</th>
                  <th className="p-3.5">Retiro</th>
                  <th className="p-3.5">Total & Pago</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((ord) => {
                  const isPending = ord.estado === 'pendiente';
                  const isPreparing = ord.estado === 'preparando';
                  const isReady = ord.estado === 'listo';
                  const isDelivered = ord.estado === 'entregado';
                  const isCancelled = ord.estado === 'cancelado';

                  return (
                    <tr
                      key={ord.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isPending ? 'bg-amber-50/20 dark:bg-amber-950/10' : ''
                      }`}
                    >
                      {/* Pedido */}
                      <td className="p-3.5 font-black text-slate-900 dark:text-white">
                        #{ord.numeroPedido}
                      </td>

                      {/* Hora */}
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">
                        {formatTime(ord.fecha)}
                      </td>

                      {/* Alumno */}
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {ord.clienteVisible}
                        </span>
                        <span className="text-[10px] text-slate-400 block">{ord.clienteNombre}</span>
                      </td>

                      {/* Items */}
                      <td className="p-3.5 max-w-xs">
                        <div className="space-y-0.5">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="text-[11px] text-slate-700 dark:text-slate-300 truncate">
                              <span className="font-bold text-sky-600">{it.cantidad}×</span> {it.productoNombre}
                            </div>
                          ))}
                        </div>
                        {ord.notas && (
                          <div className="text-[10px] text-amber-600 dark:text-amber-400 italic mt-1">
                            Nota: "{ord.notas}"
                          </div>
                        )}
                      </td>

                      {/* Retiro */}
                      <td className="p-3.5 whitespace-nowrap">
                        {ord.modalidadRetiro === 'inmediato' ? (
                          <span className="font-bold text-sky-600 flex items-center gap-1">
                            ⚡ Inmediato
                          </span>
                        ) : (
                          <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            🕐 {ord.recreoHora || 'Recreo'}
                          </span>
                        )}
                      </td>

                      {/* Total & Pago */}
                      <td className="p-3.5 whitespace-nowrap">
                        <span className="font-black text-slate-900 dark:text-white block">
                          {formatCurrency(ord.total)}
                        </span>
                        <div className="flex items-center gap-1 mt-0.5">
                          <button
                            id={`toggle-pay-${ord.numeroPedido}`}
                            onClick={() => handleTogglePayment(ord.id, ord.estadoPago)}
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase transition-colors cursor-pointer ${
                              ord.estadoPago === 'confirmado'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                            title="Hacé clic para cambiar estado del pago"
                          >
                            {ord.estadoPago === 'confirmado' ? '✓ Cobrado' : 'Impago'}
                          </button>
                          <span className="text-[10px] text-slate-400 capitalize">
                            ({ord.metodoPago === 'efectivo' ? 'Ef.' : 'MP'})
                          </span>
                        </div>
                      </td>

                      {/* Estado */}
                      <td className="p-3.5 whitespace-nowrap">
                        <select
                          id={`order-status-select-${ord.numeroPedido}`}
                          value={ord.estado}
                          disabled={isCancelled}
                          onChange={(e) => handleUpdateStatus(ord.id, e.target.value)}
                          className={`px-2.5 py-1 text-xs font-bold rounded-xl border focus:outline-hidden cursor-pointer ${
                            isPending
                              ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200'
                              : isPreparing
                              ? 'bg-sky-100 text-sky-900 border-sky-300 dark:bg-sky-950 dark:text-sky-200'
                              : isReady
                              ? 'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200'
                              : isDelivered
                              ? 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          <option value="pendiente">🟡 Pendiente</option>
                          <option value="preparando">🔵 Preparando</option>
                          <option value="listo">🟢 ¡Listo!</option>
                          <option value="entregado">✅ Entregado</option>
                          <option value="cancelado" disabled>
                            ❌ Cancelado
                          </option>
                        </select>
                      </td>

                      {/* Acciones */}
                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`ticket-order-${ord.numeroPedido}`}
                            onClick={() => setActiveVoucherOrder(ord)}
                            className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg transition-colors cursor-pointer"
                            title="Ver ticket oficial"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                          {!isCancelled && !isDelivered && (
                            <button
                              id={`cancel-order-${ord.numeroPedido}`}
                              onClick={() => setCancellingOrderId(ord.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                              title="Cancelar pedido y restaurar stock"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel order confirmation dialog */}
      {cancellingOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>¿Cancelar este pedido?</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Al cancelar, el stock de los productos comprados se reintegrará automáticamente al inventario.
            </p>

            <div className="mt-3">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                Motivo de cancelación:
              </label>
              <input
                id="cancel-reason-input"
                type="text"
                placeholder="Ej. Alumno no retiró, falta de insumo, etc."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button
                id="abort-cancel-order-btn"
                onClick={() => setCancellingOrderId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Volver
              </button>
              <button
                id="confirm-cancel-order-btn"
                onClick={() => handleCancelOrder(cancellingOrderId)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
