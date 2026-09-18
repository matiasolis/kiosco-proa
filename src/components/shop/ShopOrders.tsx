import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  Clock,
  PackageCheck,
  CheckCircle2,
  FileText,
  ShoppingBag,
  Store,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { motion } from 'motion/react';

export const ShopOrders: React.FC = () => {
  const { orders, setActiveVoucherOrder, setActiveShopTab } = useApp();
  const [filterState, setFilterState] = useState<'all' | 'active' | 'completed'>('all');

  const filteredOrders = orders.filter((o) => {
    if (filterState === 'active') return o.estado === 'pendiente' || o.estado === 'preparando' || o.estado === 'listo';
    if (filterState === 'completed') return o.estado === 'entregado';
    return true;
  });

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>🟡 Pendiente de preparación</span>
          </span>
        );
      case 'preparando':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" />
            <span>🔵 Preparando tu pedido</span>
          </span>
        );
      case 'listo':
        return (
          <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 ring-2 ring-emerald-500/30">
            <PackageCheck className="w-3.5 h-3.5" />
            <span>🟢 ¡Listo para retirar en mostrador!</span>
          </span>
        );
      case 'entregado':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
            <span>Entregado</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Mis Pedidos en el Kiosco
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Revisá el estado en tiempo real de tus pedidos o descargá tus comprobantes digitales.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold self-start">
          <button
            id="filter-orders-all"
            onClick={() => setFilterState('all')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterState === 'all'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            id="filter-orders-active"
            onClick={() => setFilterState('active')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterState === 'active'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            En Curso
          </button>
          <button
            id="filter-orders-completed"
            onClick={() => setFilterState('completed')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              filterState === 'completed'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Entregados
          </button>
        </div>
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
          <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No tenés pedidos registrados aún
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Hacé tu primera compra desde el catálogo para disfrutar de tus snacks favoritos en los recreos.
          </p>
          <button
            id="go-catalog-from-empty-orders"
            onClick={() => setActiveShopTab('catalog')}
            className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Ir a Comprar
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isReady = order.estado === 'listo';
            const isActive = order.estado === 'pendiente' || order.estado === 'preparando' || isReady;

            return (
              <motion.div
                key={order.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                  isReady
                    ? 'border-emerald-400 dark:border-emerald-600 shadow-md shadow-emerald-500/10 ring-2 ring-emerald-500/10'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                {/* Header card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      Pedido #{order.numeroPedido}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDateTime(order.fecha)}
                    </span>
                  </div>

                  <div>{getStatusBadge(order.estado)}</div>
                </div>

                {/* Items preview */}
                <div className="py-3.5 space-y-2">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {order.items.map((it, idx) => (
                      <span key={idx} className="inline-block mr-3">
                        <strong className="text-sky-600">{it.cantidad}×</strong> {it.productoNombre}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400 pt-1">
                    <span>
                      Retiro:{' '}
                      <strong className="text-slate-700 dark:text-slate-300">
                        {order.modalidadRetiro === 'inmediato'
                          ? '⚡ Inmediato'
                          : `🕐 Recreo (${order.recreoHora})`}
                      </strong>
                    </span>
                    <span>
                      Pago:{' '}
                      <strong className="text-slate-700 dark:text-slate-300 capitalize">
                        {order.metodoPago === 'efectivo' ? '💵 Efectivo' : '📱 Mercado Pago'}
                      </strong>
                    </span>
                    <span>
                      Comprobante:{' '}
                      <span className="font-mono">{order.comprobanteId}</span>
                    </span>
                  </div>
                </div>

                {/* Footer card */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Total:{' '}
                    <span className="text-base font-black text-slate-900 dark:text-white">
                      {formatCurrency(order.total)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      id={`view-voucher-order-${order.numeroPedido}`}
                      onClick={() => setActiveVoucherOrder(order)}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/60 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ver Comprobante</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
