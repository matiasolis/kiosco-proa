import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { Product } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Percent,
  Sparkles,
  Flame,
  AlertTriangle,
  CheckCircle2,
  X,
  Save,
  Tag,
  ArrowUpDown,
  EyeOff,
} from 'lucide-react';
import { motion } from 'motion/react';

export const AdminProducts: React.FC = () => {
  const { products, categories, suppliers, token, addToast, refreshAllData } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modals state
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [bulkPriceModalOpen, setBulkPriceModalOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    nombre: '',
    categoriaId: '',
    marca: '',
    precioCosto: 0,
    precioVenta: 0,
    stock: 0,
    stockMinimo: 5,
    imagen: '',
    descripcion: '',
    fechaVencimiento: '',
    proveedorId: '',
    estado: 'activo' as 'activo' | 'agotado' | 'desactivado',
    destacado: false,
    enPromocion: false,
    precioPromocional: 0,
  });

  // Bulk price form
  const [bulkPercent, setBulkPercent] = useState<number>(10);
  const [bulkCategory, setBulkCategory] = useState<string>('all');
  const [bulkApplying, setBulkApplying] = useState(false);

  // Filtered product list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          p.nombre.toLowerCase().includes(q) ||
          p.marca.toLowerCase().includes(q) ||
          p.descripcion.toLowerCase().includes(q);
        if (!matches) return false;
      }
      if (selectedCategory !== 'all' && p.categoriaId !== selectedCategory) return false;
      if (selectedStatus !== 'all' && p.estado !== selectedStatus) return false;
      return true;
    });
  }, [products, searchQuery, selectedCategory, selectedStatus]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      nombre: '',
      categoriaId: categories[0]?.id || 'bebidas',
      marca: '',
      precioCosto: 0,
      precioVenta: 0,
      stock: 10,
      stockMinimo: 5,
      imagen:
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
      descripcion: '',
      fechaVencimiento: '',
      proveedorId: suppliers[0]?.id || '',
      estado: 'activo',
      destacado: false,
      enPromocion: false,
      precioPromocional: 0,
    });
    setProductModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      nombre: product.nombre,
      categoriaId: product.categoriaId,
      marca: product.marca,
      precioCosto: product.precioCosto ?? product.precioCompra,
      precioVenta: product.precioVenta,
      stock: product.stock,
      stockMinimo: product.stockMinimo,
      imagen: product.imagen,
      descripcion: product.descripcion,
      fechaVencimiento: product.fechaVencimiento || '',
      proveedorId: product.proveedorId || '',
      estado: (product.estado === 'desactivado' ? 'desactivado' : product.estado === 'agotado' ? 'agotado' : 'activo'),
      destacado: product.destacado,
      enPromocion: product.enPromocion,
      precioPromocional: product.precioPromocional || 0,
    });
    setProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) {
      addToast('error', 'El nombre es obligatorio');
      return;
    }

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';

      const payload = {
        ...formData,
        precioCosto: Number(formData.precioCosto),
        precioVenta: Number(formData.precioVenta),
        stock: Number(formData.stock),
        stockMinimo: Number(formData.stockMinimo),
        precioPromocional: formData.enPromocion ? Number(formData.precioPromocional) : undefined,
        fechaVencimiento: formData.fechaVencimiento || undefined,
        proveedorId: formData.proveedorId || undefined,
      };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Error al guardar producto');
        return;
      }

      addToast(
        'success',
        editingProduct ? 'Producto actualizado' : 'Producto creado',
        `"${formData.nombre}" guardado con éxito.`
      );
      setProductModalOpen(false);
      refreshAllData();
    } catch (e: any) {
      addToast('error', e.message);
    }
  };

  const handleDeleteProduct = async (product: Product) => {
    try {
      const res = await fetch(`/api/products/${product.id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();

      if (!res.ok) {
        // If prevented due to historical records, inform clearly
        addToast('warning', 'Aviso de seguridad histórica', data.error);
        return;
      }

      if (data.action === 'deactivated') {
        addToast(
          'warning',
          'Producto Desactivado',
          'Al tener compras históricas registradas, se cambió a desactivado para proteger las estadísticas.'
        );
      } else {
        addToast('success', 'Producto eliminado', `"${product.nombre}" fue eliminado del catálogo.`);
      }

      setDeletingProduct(null);
      refreshAllData();
    } catch (e: any) {
      addToast('error', e.message);
    }
  };

  const handleApplyBulkPrices = async (e: React.FormEvent) => {
    e.preventDefault();
    setBulkApplying(true);
    try {
      const res = await fetch('/api/products/bulk-price-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          porcentaje: bulkPercent,
          categoriaId: bulkCategory !== 'all' ? bulkCategory : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Error en actualización');
        return;
      }

      addToast(
        'success',
        'Precios Actualizados',
        `Se actualizaron ${data.updatedCount} productos con un aumento del ${bulkPercent}%.`
      );
      setBulkPriceModalOpen(false);
      refreshAllData();
    } catch (e: any) {
      addToast('error', e.message);
    } finally {
      setBulkApplying(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Primary CTAs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Catálogo de Productos
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Alta, precios, márgenes de ganancia, promociones e imágenes de catálogo.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="bulk-price-update-trigger-btn"
            onClick={() => setBulkPriceModalOpen(true)}
            className="px-3.5 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Percent className="w-3.5 h-3.5 text-sky-500" />
            <span>Aumento Masivo %</span>
          </button>

          <button
            id="add-new-product-btn"
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs shadow-sky-600/30 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Producto</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="search-products-admin-input"
            type="text"
            placeholder="Buscar por nombre, marca..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          />
        </div>

        <div>
          <select
            id="filter-products-category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="all">Todas las Categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            id="filter-products-status-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
          >
            <option value="all">Todos los Estados</option>
            <option value="activo">Activo</option>
            <option value="agotado">Agotado</option>
            <option value="stock_bajo">Stock Bajo</option>
            <option value="desactivado">Desactivado</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Producto</th>
                <th className="p-3.5">Categoría</th>
                <th className="p-3.5">Costo</th>
                <th className="p-3.5">Precio Venta</th>
                <th className="p-3.5">Ganancia</th>
                <th className="p-3.5">Stock</th>
                <th className="p-3.5">Estado</th>
                <th className="p-3.5 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredProducts.map((p) => {
                const cost = p.precioCosto ?? p.precioCompra;
                const profit = p.precioVenta - cost;
                const marginPercent = cost > 0 ? Math.round((profit / cost) * 100) : 0;
                const isOutOfStock = p.stock <= 0;
                const isLow = p.stock <= p.stockMinimo;

                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    {/* Producto info */}
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.imagen}
                          alt={p.nombre}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 bg-white"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              {p.nombre}
                            </span>
                            {p.destacado && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                                TOP
                              </span>
                            )}
                            {p.enPromocion && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                                PROMO
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 block">{p.marca}</span>
                        </div>
                      </div>
                    </td>

                    {/* Categoría */}
                    <td className="p-3.5 text-slate-600 dark:text-slate-400 capitalize">
                      {p.categoriaId}
                    </td>

                    {/* Costo */}
                    <td className="p-3.5 font-medium text-slate-500">
                      {formatCurrency(p.precioCosto ?? p.precioCompra)}
                    </td>

                    {/* Venta */}
                    <td className="p-3.5">
                      <span className="font-black text-slate-900 dark:text-white block">
                        {formatCurrency(p.precioVenta)}
                      </span>
                      {p.enPromocion && p.precioPromocional && (
                        <span className="text-[10px] text-rose-600 font-bold block">
                          Promo: {formatCurrency(p.precioPromocional)}
                        </span>
                      )}
                    </td>

                    {/* Ganancia */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                        +{formatCurrency(profit)}
                      </span>
                      <span className="text-[10px] text-slate-400">+{marginPercent}% margen</span>
                    </td>

                    {/* Stock */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`font-black ${
                          isOutOfStock
                            ? 'text-rose-600'
                            : isLow
                            ? 'text-amber-600'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {p.stock} u.
                      </span>
                      <span className="text-[10px] text-slate-400 block">Mín: {p.stockMinimo}</span>
                    </td>

                    {/* Estado */}
                    <td className="p-3.5 whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          p.estado === 'disponible' || p.estado === 'activo'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : p.estado === 'stock_bajo'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : p.estado === 'agotado'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {p.estado.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="p-3.5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          id={`edit-product-btn-${p.id}`}
                          onClick={() => handleOpenEditModal(p)}
                          className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          id={`delete-product-btn-${p.id}`}
                          onClick={() => setDeletingProduct(p)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Eliminar o desactivar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* PRODUCT CREATE / EDIT MODAL                                        */}
      {/* ------------------------------------------------------------------ */}
      {productModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto para Kiosco'}
              </h3>
              <button
                id="close-product-modal-btn"
                onClick={() => setProductModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre del Producto *
                  </label>
                  <input
                    id="input-prod-nombre"
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    placeholder="Ej. Alfajor Jorgito Chocolate"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Marca
                  </label>
                  <input
                    id="input-prod-marca"
                    type="text"
                    value={formData.marca}
                    onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                    placeholder="Ej. Jorgito, Coca-Cola, Arcor"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Categoría
                  </label>
                  <select
                    id="select-prod-categoria"
                    value={formData.categoriaId}
                    onChange={(e) => setFormData({ ...formData, categoriaId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Proveedor Habitual
                  </label>
                  <select
                    id="select-prod-proveedor"
                    value={formData.proveedorId}
                    onChange={(e) => setFormData({ ...formData, proveedorId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="">Sin proveedor asignado</option>
                    {suppliers.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.nombre} ({s.rubro})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Prices and margins */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Precio de Costo ($)
                  </label>
                  <input
                    id="input-prod-costo"
                    type="number"
                    min="0"
                    step="50"
                    value={formData.precioCosto}
                    onChange={(e) => setFormData({ ...formData, precioCosto: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Precio de Venta ($) *
                  </label>
                  <input
                    id="input-prod-venta"
                    type="number"
                    min="0"
                    step="50"
                    required
                    value={formData.precioVenta}
                    onChange={(e) => setFormData({ ...formData, precioVenta: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold text-sky-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Ganancia Unitaria
                  </label>
                  <div className="px-3 py-2 text-xs rounded-xl bg-slate-100 dark:bg-slate-700/60 font-black text-emerald-600 flex items-center justify-between">
                    <span>{formatCurrency(formData.precioVenta - formData.precioCosto)}</span>
                    <span className="text-[10px] text-slate-400">
                      {formData.precioCosto > 0
                        ? `+${Math.round(
                            ((formData.precioVenta - formData.precioCosto) / formData.precioCosto) * 100
                          )}%`
                        : ''}
                    </span>
                  </div>
                </div>
              </div>

              {/* Stock settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stock Disponible
                  </label>
                  <input
                    id="input-prod-stock"
                    type="number"
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Stock Mínimo (Alerta)
                  </label>
                  <input
                    id="input-prod-stock-min"
                    type="number"
                    min="1"
                    value={formData.stockMinimo}
                    onChange={(e) => setFormData({ ...formData, stockMinimo: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Estado
                  </label>
                  <select
                    id="select-prod-estado"
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  >
                    <option value="activo">Activo</option>
                    <option value="agotado">Agotado</option>
                    <option value="desactivado">Desactivado</option>
                  </select>
                </div>
              </div>

              {/* Imagen URL and preview */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  URL de Imagen del Producto
                </label>
                <div className="flex gap-2">
                  <input
                    id="input-prod-imagen"
                    type="url"
                    value={formData.imagen}
                    onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                  {formData.imagen && (
                    <img
                      src={formData.imagen}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white"
                    />
                  )}
                </div>
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descripción (ingredientes, detalles para alumnos)
                </label>
                <textarea
                  id="input-prod-descripcion"
                  rows={2}
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              {/* Promoción and Destacado toggles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    id="chk-prod-destacado"
                    type="checkbox"
                    checked={formData.destacado}
                    onChange={(e) => setFormData({ ...formData, destacado: e.target.checked })}
                    className="w-4 h-4 text-sky-600 rounded"
                  />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    ⭐ Marcar como Destacado (Top en inicio)
                  </span>
                </label>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      id="chk-prod-promo"
                      type="checkbox"
                      checked={formData.enPromocion}
                      onChange={(e) => setFormData({ ...formData, enPromocion: e.target.checked })}
                      className="w-4 h-4 text-sky-600 rounded"
                    />
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      🔥 Activar Promoción
                    </span>
                  </label>

                  {formData.enPromocion && (
                    <input
                      id="input-prod-precio-promo"
                      type="number"
                      placeholder="Precio promocional ($)"
                      value={formData.precioPromocional || ''}
                      onChange={(e) =>
                        setFormData({ ...formData, precioPromocional: Number(e.target.value) })
                      }
                      className="w-full px-3 py-1.5 text-xs rounded-xl border border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold"
                    />
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  id="submit-product-form-btn"
                  type="submit"
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Producto</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* BULK PRICE UPDATE MODAL                                            */}
      {/* ------------------------------------------------------------------ */}
      {bulkPriceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600">
                  <Percent className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Aumento Masivo de Precios
                </h3>
              </div>
              <button
                id="close-bulk-price-modal"
                onClick={() => setBulkPriceModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplyBulkPrices} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Porcentaje de aumento (%)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="input-bulk-percent"
                    type="number"
                    step="1"
                    min="1"
                    max="200"
                    required
                    value={bulkPercent}
                    onChange={(e) => setBulkPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-bold text-sky-600 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  />
                  <span className="text-sm font-bold text-slate-500">%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Aplicar a categoría:
                </label>
                <select
                  id="select-bulk-category"
                  value={bulkCategory}
                  onChange={(e) => setBulkCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="all">Todo el Catálogo Completo</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-200">
                ⚠️ Los precios de venta se redondearán matemáticamente a múltiplos de $50 para agilizar el vuelto en el mostrador.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setBulkPriceModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  id="confirm-bulk-price-btn"
                  type="submit"
                  disabled={bulkApplying}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {bulkApplying ? 'Aplicando...' : `Aplicar +${bulkPercent}%`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* SAFE DELETE / DEACTIVATE CONFIRMATION DIALOG                      */}
      {/* ------------------------------------------------------------------ */}
      {deletingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              <span>¿Eliminar o desactivar?</span>
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              ¿Deseas dar de baja <strong className="text-slate-900 dark:text-white">"{deletingProduct.nombre}"</strong>?
              Si el producto cuenta con pedidos o estadísticas históricas asociadas, se desactivará automáticamente para preservar la integridad contable.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                id="abort-delete-prod-btn"
                onClick={() => setDeletingProduct(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                id="confirm-delete-prod-btn"
                onClick={() => handleDeleteProduct(deletingProduct)}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Confirmar Baja
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
