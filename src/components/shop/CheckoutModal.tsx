import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, playChime } from '../../utils/formatters';
import {
  X,
  Zap,
  Clock,
  Banknote,
  QrCode,
  ArrowRight,
  AlertCircle,
  Copy,
  Check,
  ShoppingBag,
} from 'lucide-react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';

export const CheckoutModal: React.FC = () => {
  const {
    checkoutOpen,
    setCheckoutOpen,
    cart,
    clearCart,
    currentUser,
    token,
    settings,
    setLastOrderPlaced,
    addToast,
    refreshAllData,
  } = useApp();

  const [modalidadRetiro, setModalidadRetiro] = useState<'inmediato' | 'recreo'>('inmediato');
  const [recreoSeleccionado, setRecreoSeleccionado] = useState<string>(
    settings?.recreosDisponibles?.[0] || '10:15 - Primer Recreo'
  );
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'mercadopago'>('efectivo');
  const [notas, setNotas] = useState('');
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!checkoutOpen) return null;

  const total = cart.reduce((acc, item) => {
    const price =
      item.product.enPromocion && item.product.precioPromocional
        ? item.product.precioPromocional
        : item.product.precioVenta;
    return acc + price * item.quantity;
  }, 0);

  const handleCopyAlias = () => {
    if (settings?.aliasMp) {
      navigator.clipboard.writeText(settings.aliasMp);
      setCopiedAlias(true);
      setTimeout(() => setCopiedAlias(false), 2000);
      addToast('success', 'Alias copiado', settings.aliasMp);
    }
  };

  const handleConfirmOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !token) {
      setErrorMsg('Debes iniciar sesión para realizar un pedido.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const orderPayload = {
        items: cart.map((item) => ({
          productoId: item.product.id,
          cantidad: item.quantity,
        })),
        metodoPago,
        modalidadRetiro,
        recreoHora: modalidadRetiro === 'recreo' ? recreoSeleccionado : undefined,
        notas: notas.trim() || undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || 'No se pudo procesar el pedido.');
        return;
      }

      // Order created successfully!
      playChime('order');
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#0284c7', '#38bdf8', '#fbbf24', '#34d399'],
      });

      setLastOrderPlaced(data.order);
      clearCart();
      setCheckoutOpen(false);
      refreshAllData();
      addToast(
        'success',
        `¡Pedido #${data.order.numeroPedido} Registrado!`,
        'Tu pedido ya está siendo preparado en el kiosco.'
      );
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de conexión.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      id="checkout-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 p-5 sm:p-6 text-white relative">
          <button
            id="close-checkout-modal"
            onClick={() => setCheckoutOpen(false)}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
            Confirmar Pedido
          </span>
          <h2 className="text-xl sm:text-2xl font-black mt-1.5">Finalizar Compra en el Kiosco</h2>
          <p className="text-sky-100 text-xs mt-0.5">
            Elegí cómo retirás tu pedido y el método de pago que prefieras.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleConfirmOrder} className="p-5 sm:p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Modalidad de Entrega */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              1. Modalidad de Retiro
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                id="delivery-inmediato-btn"
                onClick={() => setModalidadRetiro('inmediato')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  modalidadRetiro === 'inmediato'
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-sm">
                  <Zap className="w-4 h-4" />
                  <span>⚡ Retiro Inmediato</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Realizá tu pedido y pasá a buscarlo por el mostrador en cuanto esté listo.
                </p>
              </button>

              <button
                type="button"
                id="delivery-recreo-btn"
                onClick={() => setModalidadRetiro('recreo')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  modalidadRetiro === 'recreo'
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-sm">
                  <Clock className="w-4 h-4" />
                  <span>🕐 Retiro en Recreo</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Reservalo ahora y retiralo preparado durante el recreo indicado.
                </p>
              </button>
            </div>

            {/* Recreo dropdown if recreo chosen */}
            {modalidadRetiro === 'recreo' && (
              <div className="mt-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Seleccioná el recreo en el que retirarás:
                </label>
                <select
                  id="select-recreo-horario"
                  value={recreoSeleccionado}
                  onChange={(e) => setRecreoSeleccionado(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  {(settings?.recreosDisponibles || [
                    '09:15 - Recreo Mañana (15 min)',
                    '10:45 - Recreo Principal (20 min)',
                    '12:15 - Almuerzo escolar',
                    '14:30 - Recreo Tarde (15 min)',
                  ]).map((rec) => (
                    <option key={rec} value={rec}>
                      {rec}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Section 2: Método de Pago */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
              2. Método de Pago
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                id="pay-cash-btn"
                onClick={() => setMetodoPago('efectivo')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  metodoPago === 'efectivo'
                    ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                  <Banknote className="w-4 h-4" />
                  <span>💵 Pagar en Efectivo</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Abonás en efectivo en el mostrador del kiosco al retirar tu pedido.
                </p>
              </button>

              <button
                type="button"
                id="pay-mp-btn"
                onClick={() => setMetodoPago('mercadopago')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                  metodoPago === 'mercadopago'
                    ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/50 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-bold text-sm">
                  <QrCode className="w-4 h-4" />
                  <span>📱 Mercado Pago QR</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  Transferí o escaneá el código QR oficial del kiosco con la app.
                </p>
              </button>
            </div>

            {/* Mercado Pago QR and Alias Panel */}
            {metodoPago === 'mercadopago' && (
              <div className="mt-3 p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/70 flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white p-2.5 rounded-xl border border-sky-100 shadow-xs shrink-0">
                  <img
                    src={
                      settings?.qrImageUrl ||
                      'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https%3A%2F%2Fmpago.la%2Fpos%2Fkiosco-escolar'
                    }
                    alt="QR Mercado Pago Kiosco"
                    className="w-28 h-28 object-contain"
                  />
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                    Datos para abonar con Mercado Pago
                  </span>
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                      Alias: {settings?.aliasMp || 'kiosco.sanmartin.mp'}
                    </span>
                    <button
                      type="button"
                      id="copy-mp-alias-btn"
                      onClick={handleCopyAlias}
                      className="p-1 text-sky-600 hover:bg-sky-100 dark:hover:bg-sky-900 rounded-lg cursor-pointer"
                      title="Copiar Alias"
                    >
                      {copiedAlias ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Monto exacto a transferir:{' '}
                    <strong className="text-sky-600 font-bold">{formatCurrency(total)}</strong>. El pedido se
                    confirmará al validar el comprobante.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Optional notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notas o indicaciones para el kiosco (opcional):
            </label>
            <input
              id="checkout-notes-input"
              type="text"
              placeholder="Ej. Tostado bien caliente, sin mayonesa, etc."
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
          </div>

          {/* Summary */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400 mb-3">
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {currentUser?.nombreVisible} ({currentUser?.nombre} {currentUser?.apellido})
                </span>
              </div>
              <div className="flex justify-between">
                <span>Modalidad:</span>
                <span className="font-semibold text-sky-600 dark:text-sky-400">
                  {modalidadRetiro === 'inmediato' ? '⚡ Retiro Inmediato' : `🕐 ${recreoSeleccionado}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Método de pago:</span>
                <span className="font-semibold capitalize">
                  {metodoPago === 'efectivo' ? '💵 Efectivo en mostrador' : '📱 Mercado Pago'}
                </span>
              </div>
            </div>

            <div className="flex items-baseline justify-between py-2 border-t border-slate-200/60 dark:border-slate-700/60 text-lg font-black text-slate-900 dark:text-white">
              <span>Total a Pagar:</span>
              <span className="text-2xl text-sky-600 dark:text-sky-400">{formatCurrency(total)}</span>
            </div>

            <button
              id="submit-order-btn"
              type="submit"
              disabled={submitting}
              className="w-full mt-4 py-3.5 px-4 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-bold text-sm rounded-2xl shadow-lg shadow-sky-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {submitting ? (
                <span>Verificando stock y registrando...</span>
              ) : (
                <>
                  <span>Confirmar Pedido</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
