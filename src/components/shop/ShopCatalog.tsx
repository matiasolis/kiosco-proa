import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import {
  Heart,
  Plus,
  Minus,
  ShoppingBag,
  Sparkles,
  Flame,
  Check,
  AlertTriangle,
  SlidersHorizontal,
  ChevronDown,
  Tag,
} from 'lucide-react';
import { motion } from 'motion/react';

interface ShopCatalogProps {
  searchQuery: string;
}

export const ShopCatalog: React.FC<ShopCatalogProps> = ({ searchQuery }) => {
  const { products, categories, addToCart, currentUser, toggleFavorite } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterPromoOnly, setFilterPromoOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'name'>('featured');
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});

  // Category list filter
  const activeCategories = useMemo(() => {
    return categories.filter((c) => c.activa);
  }, [categories]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.estado !== 'desactivado');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'all') {
      list = list.filter((p) => p.categoriaId === selectedCategory);
    }

    if (filterPromoOnly) {
      list = list.filter((p) => p.enPromocion);
    }

    // Sorting
    return [...list].sort((a, b) => {
      const priceA = a.enPromocion && a.precioPromocional ? a.precioPromocional : a.precioVenta;
      const priceB = b.enPromocion && b.precioPromocional ? b.precioPromocional : b.precioVenta;

      if (sortBy === 'price-asc') return priceA - priceB;
      if (sortBy === 'price-desc') return priceB - priceA;
      if (sortBy === 'name') return a.nombre.localeCompare(b.nombre);
      // 'featured'
      if (a.destacado && !b.destacado) return -1;
      if (!a.destacado && b.destacado) return 1;
      return 0;
    });
  }, [products, searchQuery, selectedCategory, filterPromoOnly, sortBy]);

  const featuredPromos = useMemo(() => {
    return products.filter((p) => p.enPromocion && p.estado !== 'desactivado' && p.stock > 0);
  }, [products]);

  const handleQtyChange = (productId: string, delta: number, maxStock: number) => {
    setItemQuantities((prev) => {
      const current = prev[productId] || 1;
      const next = Math.max(1, Math.min(maxStock, current + delta));
      return { ...prev, [productId]: next };
    });
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner / Hero Promos */}
      {featuredPromos.length > 0 && !searchQuery && selectedCategory === 'all' && (
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 text-white p-6 sm:p-8 shadow-xl shadow-sky-500/10">
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-black uppercase tracking-wider mb-3">
                <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                <span>Promociones del Recreo</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                Pedí antes del timbre y retirá sin hacer filas
              </h1>
              <p className="mt-2 text-sky-100 text-sm sm:text-base leading-relaxed">
                Aprovechá los descuentos especiales en sándwiches tostados, alfajores triples y bebidas frías.
              </p>
            </div>

            <div className="flex items-center gap-3 self-end md:self-center">
              <button
                id="filter-promos-banner-btn"
                onClick={() => setFilterPromoOnly(!filterPromoOnly)}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer ${
                  filterPromoOnly
                    ? 'bg-white text-sky-700 ring-4 ring-white/30'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                {filterPromoOnly ? '✓ Viendo Promociones' : 'Ver Todas las Promos 🔥'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Category Pills Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Categorías
          </h2>
          <span className="text-xs text-slate-500">
            {filteredProducts.length} {filteredProducts.length === 1 ? 'producto' : 'productos'}
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            id="cat-all-btn"
            onClick={() => setSelectedCategory('all')}
            className={`shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-sky-600 text-white shadow-xs shadow-sky-600/30 ring-2 ring-sky-500/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            Todos los Productos
          </button>

          {activeCategories.map((cat) => (
            <button
              key={cat.id}
              id={`cat-${cat.id}-btn`}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-sky-600 text-white shadow-xs shadow-sky-600/30 ring-2 ring-sky-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{cat.nombre}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Sort Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Filtros:</span>

          <button
            id="toggle-promo-chip-btn"
            onClick={() => setFilterPromoOnly(!filterPromoOnly)}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              filterPromoOnly
                ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border border-amber-300 dark:border-amber-700'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            🔥 Solo Promociones
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Ordenar por:</span>
          <div className="relative">
            <select
              id="sort-products-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-sky-500 cursor-pointer"
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Menor Precio</option>
              <option value="price-desc">Mayor Precio</option>
              <option value="name">Nombre (A-Z)</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-3xl">
          <ShoppingBag className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
            No encontramos productos con esos filtros
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
            Probá buscando con otro término o limpiá los filtros seleccionados para ver el catálogo completo.
          </p>
          <button
            id="reset-catalog-filters-btn"
            onClick={() => {
              setSelectedCategory('all');
              setFilterPromoOnly(false);
            }}
            className="mt-4 px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-xl hover:bg-sky-700 transition-colors"
          >
            Ver todos los productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 sm:gap-6">
          {filteredProducts.map((product) => {
            const isOutOfStock = product.stock <= 0 || product.estado === 'agotado';
            const isLowStock = !isOutOfStock && (product.stock <= product.stockMinimo || product.estado === 'stock_bajo');
            const hasPromo = product.enPromocion && product.precioPromocional;
            const currentPrice = hasPromo ? product.precioPromocional! : product.precioVenta;
            const quantity = itemQuantities[product.id] || 1;
            const isFavorite = currentUser?.favorites?.includes(product.id);

            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOutOfStock
                    ? 'border-slate-200/60 dark:border-slate-800/60 opacity-75'
                    : 'border-slate-200 dark:border-slate-800 hover:shadow-xl hover:shadow-sky-500/5 hover:border-sky-200 dark:hover:border-sky-900'
                }`}
              >
                {/* Product Image Stage */}
                <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <img
                    src={product.imagen}
                    alt={product.nombre}
                    referrerPolicy="no-referrer"
                    className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
                      isOutOfStock ? 'grayscale contrast-75' : ''
                    }`}
                    loading="lazy"
                  />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
                    {hasPromo && (
                      <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-rose-500 text-white rounded-md shadow-xs flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        <span>Promo</span>
                      </span>
                    )}
                    {product.destacado && (
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-500 text-white rounded-md shadow-xs flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        <span>Top</span>
                      </span>
                    )}
                  </div>

                  {/* Favorite Button */}
                  <button
                    id={`fav-btn-${product.id}`}
                    onClick={() => toggleFavorite(product.id)}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-xs text-slate-500 hover:text-rose-500 transition-colors cursor-pointer"
                    title={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                  >
                    <Heart
                      className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`}
                    />
                  </button>

                  {/* Out of Stock Overlay */}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-2xs flex items-center justify-center p-4">
                      <span className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-xs font-black uppercase tracking-wider shadow-lg">
                        🔴 Agotado
                      </span>
                    </div>
                  )}
                </div>

                {/* Info Container */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span className="font-semibold uppercase tracking-wider">{product.marca}</span>
                      <span className="capitalize">{product.categoriaId}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug line-clamp-2">
                      {product.nombre}
                    </h3>

                    {product.descripcion && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {product.descripcion}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                    {/* Price and Stock Status */}
                    <div className="flex items-baseline justify-between mb-3">
                      <div>
                        {hasPromo && (
                          <span className="text-xs text-slate-400 line-through mr-1.5">
                            {formatCurrency(product.precioVenta)}
                          </span>
                        )}
                        <span className="text-lg font-black text-slate-900 dark:text-white">
                          {formatCurrency(currentPrice)}
                        </span>
                      </div>

                      {/* Stock availability indicator */}
                      <div>
                        {isOutOfStock ? (
                          <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Agotado
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            ¡Últimas {product.stock}!
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Disponible
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Bar (Counter + Add to Cart) */}
                    <div className="flex items-center gap-2">
                      {!isOutOfStock ? (
                        <>
                          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 p-0.5">
                            <button
                              id={`qty-minus-${product.id}`}
                              onClick={() => handleQtyChange(product.id, -1, product.stock)}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-7 text-center text-xs font-bold text-slate-800 dark:text-slate-200">
                              {quantity}
                            </span>
                            <button
                              id={`qty-plus-${product.id}`}
                              onClick={() => handleQtyChange(product.id, 1, product.stock)}
                              className="w-7 h-7 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            id={`add-cart-btn-${product.id}`}
                            onClick={() => addToCart(product, quantity)}
                            className="flex-1 py-2 px-3 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Agregar</span>
                          </button>
                        </>
                      ) : (
                        <button
                          disabled
                          className="w-full py-2 px-3 bg-slate-100 dark:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed"
                        >
                          Sin Stock
                        </button>
                      )}
                    </div>
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
