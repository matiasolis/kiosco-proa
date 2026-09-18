import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatTime } from '../../utils/formatters';
import {
  CheckCircle2,
  Clock,
  PackageCheck,
  FileText,
  X,
  Sparkles,
  ArrowRight,
  Store,
} from 'lucide-react';
import { motion } from 'motion/react';

export const OrderSuccessModal: React.FC = () => {
  const { lastOrderPlaced, setLastOrderPlaced, setActiveVoucherOrder, setActiveShopTab } = useApp();

  if (!lastOrderPlaced) return null;

  const order = lastOrderPlaced;

  const steps = [
    { key: 'pendiente', label: 'Pendiente', icon: Clock, color: 'text-amber-500 bg-amber-100 dark:bg-amber-950' },
    { key: 'preparando', label: 'Preparando', icon: Store, color: 'text-sky-500 bg-sky-100 dark:bg-sky-950' },
    { key: 'listo', label: '¡Listo para Retirar!', icon: PackageCheck, color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-950' },
    { key: 'entregado', label: 'Entregado', icon: CheckCircle2, color: 'text-slate-500 bg-slate-100 dark:bg-slate-800' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === order.estado);

  return (
    <div
      id="order-success-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-center"
      >
        {/* Animated Celebration Banner */}
        <div className="bg-gradient-to-r from-emerald-600 via-sky-600 to-cyan-600 p-8 text-white relative overflow-hidden">
          <button
            id="close-success-modal-btn"
            onClick={() => setLastOrderPlaced(null)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, stiffness: 200 }}
            className="w-16 h-16 rounded-2xl bg-white text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-xl"
          >
            <CheckCircle2 className="w-10 h-10" />
          </motion.div>

          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-3 h-3 text-amber-300" />
            ¡Pedido Confirmado!
          </span>

          <h2 className="text-3xl font-black tracking-tight">Pedido #{order.numeroPedido}</h2>
          <p className="text-sky-100 text-xs mt-1">
            Ya fue enviado a la computadora del kiosco y está siendo registrado en tiempo real.
          </p>
        </div>

        {/* Progress Stepper */}
        <div className="p-6">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 mb-6">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-3 text-left">
              Estado de preparación
            </span>

            <div className="grid grid-cols-4 gap-2 relative">
              {steps.map((step, idx) => {
                const Icon = step.icon;
                const isCurrent = idx === currentStepIndex;
                const isCompleted = idx < currentStepIndex;

                return (
                  <div key={step.key} className="flex flex-col items-center">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                        isCurrent
                          ? 'bg-sky-600 text-white ring-4 ring-sky-500/20 scale-110'
                          : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span
                      className={`text-[10px] font-bold mt-1.5 leading-tight ${
                        isCurrent
                          ? 'text-sky-600 dark:text-sky-400 font-black'
                          : isCompleted
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Summary */}
          <div className="text-left text-xs space-y-2 p-3 bg-slate-50/70 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300">
            <div className="flex justify-between">
              <span>Modalidad de retiro:</span>
              <strong className="text-slate-900 dark:text-white">
                {order.modalidadRetiro === 'inmediato'
                  ? '⚡ Retiro Inmediato en mostrador'
                  : `🕐 Recreo (${order.recreoHora})`}
              </strong>
            </div>
            <div className="flex justify-between">
              <span>Método de pago:</span>
              <span className="capitalize font-semibold text-slate-900 dark:text-white">
                {order.metodoPago === 'efectivo' ? '💵 Efectivo' : '📱 Mercado Pago'} (
                {order.estadoPago === 'confirmado' ? 'Pagado' : 'Pendiente'})
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 text-sm font-black text-slate-900 dark:text-white">
              <span>Total:</span>
              <span className="text-sky-600 dark:text-sky-400">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
            <button
              id="view-voucher-from-success-btn"
              onClick={() => {
                setLastOrderPlaced(null);
                setActiveVoucherOrder(order);
              }}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>Ver Comprobante Digital</span>
            </button>

            <button
              id="go-to-my-orders-btn"
              onClick={() => {
                setLastOrderPlaced(null);
                setActiveShopTab('orders');
              }}
              className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Ir a Mis Compras</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
