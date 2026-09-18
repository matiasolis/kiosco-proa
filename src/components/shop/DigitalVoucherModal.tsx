import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { X, Printer, CheckCircle2, Store, QrCode } from 'lucide-react';
import { motion } from 'motion/react';

export const DigitalVoucherModal: React.FC = () => {
  const { activeVoucherOrder, setActiveVoucherOrder, settings } = useApp();

  if (!activeVoucherOrder) return null;

  const order = activeVoucherOrder;

  const handlePrint = () => {
    window.print();
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <span className="px-2.5 py-1 text-xs font-bold bg-amber-100 text-amber-800 rounded-md">🟡 Pendiente</span>;
      case 'preparando':
        return <span className="px-2.5 py-1 text-xs font-bold bg-sky-100 text-sky-800 rounded-md">🔵 En Preparación</span>;
      case 'listo':
        return <span className="px-2.5 py-1 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md">🟢 ¡Listo para retirar!</span>;
      case 'entregado':
        return <span className="px-2.5 py-1 text-xs font-bold bg-slate-100 text-slate-800 rounded-md">✅ Entregado</span>;
      default:
        return null;
    }
  };

  return (
    <div
      id="digital-voucher-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white text-slate-900 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden print:shadow-none print:border-none print:w-full print:max-w-none"
      >
        {/* Actions bar (hidden in print) */}
        <div className="bg-slate-100 px-6 py-3 flex items-center justify-between border-b border-slate-200 print:hidden">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
            Comprobante Digital Oficial
          </span>
          <div className="flex items-center gap-2">
            <button
              id="print-voucher-btn"
              onClick={handlePrint}
              className="p-1.5 text-slate-600 hover:text-sky-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
              title="Imprimir ticket"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              id="close-voucher-modal-btn"
              onClick={() => setActiveVoucherOrder(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Ticket Receipt Area */}
        <div className="p-6 sm:p-8 font-mono text-xs space-y-4">
          {/* Header */}
          <div className="text-center border-b border-dashed border-slate-300 pb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black mx-auto mb-2">
              <Store className="w-5 h-5" />
            </div>
            <h2 className="text-base font-extrabold tracking-tight uppercase font-sans">
              {settings?.nombreKiosco || 'Kiosco Escolar'}
            </h2>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Ticket Electrónico de Compra
            </p>
            <p className="text-[10px] text-slate-400 font-sans">
              Colegio San Martín — Kiosco Central
            </p>
          </div>

          {/* Order Details */}
          <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between items-center text-sm font-black">
              <span>PEDIDO:</span>
              <span className="text-sky-600">#{order.numeroPedido}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Comprobante ID:</span>
              <span className="font-semibold">{order.comprobanteId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Fecha y Hora:</span>
              <span>{formatDateTime(order.fecha)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Alumno:</span>
              <span className="font-bold">{order.clienteNombre} ({order.clienteVisible})</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Retiro:</span>
              <span className="font-semibold uppercase text-sky-700">
                {order.modalidadRetiro === 'inmediato'
                  ? '⚡ Retiro Inmediato'
                  : `🕐 Recreo (${order.recreoHora})`}
              </span>
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-slate-500">Estado Pedido:</span>
              <span>{getStatusBadge(order.estado)}</span>
            </div>
          </div>

          {/* Itemized list */}
          <div className="space-y-2 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <span>Cant. / Producto</span>
              <span>Subtotal</span>
            </div>

            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <span className="font-bold">{item.cantidad}× </span>
                  <span>{item.productoNombre}</span>
                  <span className="text-[10px] text-slate-400 block">
                    ({formatCurrency(item.precioUnitario)} c/u)
                  </span>
                </div>
                <span className="font-bold shrink-0">{formatCurrency(item.subtotal)}</span>
              </div>
            ))}
          </div>

          {/* Payment & Totals */}
          <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3">
            <div className="flex justify-between">
              <span className="text-slate-500">Método de Pago:</span>
              <span className="font-semibold capitalize">
                {order.metodoPago === 'efectivo' ? '💵 Efectivo' : '📱 Mercado Pago'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estado del Pago:</span>
              <span className="font-bold uppercase text-emerald-600">
                {order.estadoPago === 'confirmado' ? '✓ Pagado' : 'Pendiente al retirar'}
              </span>
            </div>
            {order.notas && (
              <div className="pt-1 text-[11px] text-slate-500 italic">
                Nota: "{order.notas}"
              </div>
            )}
            <div className="flex justify-between items-baseline pt-2 text-base font-black border-t border-slate-200">
              <span>TOTAL:</span>
              <span className="text-lg text-sky-600">{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* QR Barcode and Footer message */}
          <div className="text-center pt-2 space-y-2 font-sans">
            <div className="flex justify-center">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=PEDIDO-${order.numeroPedido}-${order.comprobanteId}`}
                alt="QR Pedido"
                className="w-20 h-20 border border-slate-200 p-1 rounded-lg"
              />
            </div>
            <p className="text-[10px] text-slate-400">
              Presentá este código o número de pedido al retirar en el mostrador.
            </p>
            <p className="text-[9px] text-slate-400">
              ¡Gracias por tu compra en el Kiosco Escolar!
            </p>
          </div>
        </div>

        {/* Print button footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3 print:hidden">
          <button
            id="voucher-print-action-btn"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Ticket</span>
          </button>
          <button
            id="voucher-close-action-btn"
            onClick={() => setActiveVoucherOrder(null)}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </motion.div>
    </div>
  );
};
