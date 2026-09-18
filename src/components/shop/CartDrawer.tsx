import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { X, Trash2, Plus, Minus, ArrowRight, ShoppingBag, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    cartOpen,
    setCartOpen,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    setCheckoutOpen,
    currentUser,
    setAuthModalOpen,
  } = useApp();

  if (!cartOpen) return null;

  const total = cart.reduce((acc, item) => {
    const price =
      item.product.enPromocion && item.product.precioPromocional
        ? item.product.precioPromocional
        : item.product.precioVenta;
    return acc + price * item.quantity;
  }, 0);

  // Check if any cart item exceeds live stock
  const hasStockIssues = cart.some((item) => item.quantity > item.product.stock);

  const handleProceedToCheckout = () => {
    if (!currentUser) {
      setAuthModalOpen(true);
      return;
    }
    setCartOpen(false);
    setCheckoutOpen(true);
  };

  return (
    <AnimatePresence>
      <div
        id="cart-drawer-backdrop"
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end"
      >
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-sky-50 dark:bg-sky-950 text-sky-600 rounded-xl">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Tu Carrito</h3>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {cart.length} {cart.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {cart.length > 0 && (
                <button
                  id="clear-cart-btn"
                  onClick={clearCart}
                  className="text-xs text-slate-400 hover:text-rose-600 px-2 py-1 rounded-lg transition-colors cursor-pointer"
                  title="Vaciar carrito"
                >
                  Vaciar
                </button>
              )}
              <button
                id="close-cart-btn"
                onClick={() => setCartOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Tu carrito está vacío</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Explorá los productos disponibles en el catálogo y agregá lo que quieras retirar.
                </p>
                <button
                  id="cart-continue-shopping-empty-btn"
                  onClick={() => setCartOpen(false)}
                  className="mt-5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const product = item.product;
                const isOverStock = item.quantity > product.stock;
                const price =
                  product.enPromocion && product.precioPromocional
                    ? product.precioPromocional
                    : product.precioVenta;
                const itemTotal = price * item.quantity;

                return (
                  <div
                    key={product.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isOverStock
                        ? 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={product.imagen}
                        alt={product.nombre}
                        referrerPolicy="no-referrer"
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-white border border-slate-200 dark:border-slate-700"
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {product.nombre}
                        </h4>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {formatCurrency(price)} c/u
                        </div>
                        <div className="text-xs font-black text-sky-600 dark:text-sky-400 mt-1">
                          {formatCurrency(itemTotal)}
                        </div>
                      </div>

                      <button
                        id={`remove-item-${product.id}`}
                        onClick={() => removeFromCart(product.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                        title="Eliminar producto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Quantity controls */}
                    <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-500">Cantidad:</span>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 p-0.5">
                          <button
                            id={`cart-minus-${product.id}`}
                            onClick={() => updateCartQuantity(product.id, item.quantity - 1)}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                            {item.quantity}
                          </span>
                          <button
                            id={`cart-plus-${product.id}`}
                            onClick={() => updateCartQuantity(product.id, item.quantity + 1)}
                            disabled={item.quantity >= product.stock}
                            className="w-6 h-6 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md disabled:opacity-30 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Stock Alert in Cart */}
                    {isOverStock && (
                      <div className="mt-2 text-[11px] text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          ⚠️ No hay suficientes unidades disponibles. Actualmente quedan {product.stock} unidades.
                        </span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Subtotal and Checkout Trigger */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                <span>Subtotal</span>
                <span>{formatCurrency(total)}</span>
              </div>
              <div className="flex items-center justify-between text-base font-black text-slate-900 dark:text-white">
                <span>Total a Pagar</span>
                <span className="text-xl text-sky-600 dark:text-sky-400">{formatCurrency(total)}</span>
              </div>

              {hasStockIssues && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Ajustá las cantidades señaladas para continuar con el pedido.</span>
                </div>
              )}

              <button
                id="cart-checkout-proceed-btn"
                onClick={handleProceedToCheckout}
                disabled={hasStockIssues}
                className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white text-sm font-bold rounded-xl shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>Continuar Compra</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                id="cart-continue-browsing-btn"
                onClick={() => setCartOpen(false)}
                className="w-full py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                Seguir Comprando
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
