import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export const ShopFavorites: React.FC = () => {
  const { products, currentUser, toggleFavorite, addToCart, setActiveShopTab } = useApp();

  const favoriteProducts = products.filter((p) => currentUser?.favorites?.includes(p.id));

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      <div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          <span>Mis Productos Favoritos</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Tus comidas y bebidas guardadas para agregarlas al carrito con un solo toque.
        </p>
      </div>

      {favoriteProducts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center mx-auto mb-3">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            Todavía no tenés productos favoritos
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Hacé clic en el corazón ❤️ de cualquier producto del catálogo para tenerlo siempre a mano acá.
          </p>
          <button
            id="go-catalog-from-empty-favs"
            onClick={() => setActiveShopTab('catalog')}
            className="mt-4 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Explorar Catálogo
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {favoriteProducts.map((product) => {
            const isOutOfStock = product.stock <= 0;
            const price =
              product.enPromocion && product.precioPromocional
                ? product.precioPromocional
                : product.precioVenta;

            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800">
                  <img
                    src={product.imagen}
                    alt={product.nombre}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <button
                    id={`remove-fav-btn-${product.id}`}
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 text-rose-500 backdrop-blur-md shadow-xs hover:scale-110 transition-transform cursor-pointer"
                    title="Quitar de favoritos"
                  >
                    <Heart className="w-4 h-4 fill-rose-500" />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {product.marca}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug mt-0.5">
                      {product.nombre}
                    </h4>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-slate-900 dark:text-white">
                        {formatCurrency(price)}
                      </span>
                    </div>

                    <button
                      id={`fav-add-to-cart-${product.id}`}
                      disabled={isOutOfStock}
                      onClick={() => addToCart(product, 1)}
                      className="py-1.5 px-3 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors disabled:opacity-40 cursor-pointer"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>{isOutOfStock ? 'Sin stock' : 'Agregar'}</span>
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
