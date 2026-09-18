import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Product, StockMovement } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  Boxes,
  Plus,
  Minus,
  AlertTriangle,
  ShoppingCart,
  History,
  CheckCircle2,
  X,
  FileSpreadsheet,
  Printer,
} from 'lucide-react';

export const AdminStock: React.FC = () => {
  const { products, token, addToast, refreshAllData } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'inventory' | 'movements' | 'shopping-list'>('inventory');
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

  // Adjustment modal
  const [adjustModalProduct, setAdjustModalProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<'entrada' | 'salida'>('entrada');
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustMotivo, setAdjustMotivo] = useState<string>('Compra a proveedor');
  const [adjustSubmitting, setAdjustSubmitting] = useState(false);

  // Fetch movements when switching to movements tab
  const fetchMovements = async () => {
    if (!token) return;
    setLoadingMovements(true);
    try {
      const res = await fetch('/api/stock/movements', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMovements(data.movements || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMovements(false);
    }
  };

  const handleSubTabChange = (tab: 'inventory' | 'movements' | 'shopping-list') => {
    setActiveSubTab(tab);
    if (tab === 'movements') {
      fetchMovements();
    }
  };

  const handleOpenAdjust = (p: Product, type: 'entrada' | 'salida') => {
    setAdjustModalProduct(p);
    setAdjustType(type);
    setAdjustQty(1);
    setAdjustMotivo(
      type === 'entrada' ? 'Compra a proveedor' : 'Producto dañado / merma'
    );
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalProduct || adjustQty <= 0) return;

    setAdjustSubmitting(true);
    try {
      const res = await fetch('/api/stock/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productoId: adjustModalProduct.id,
          tipo: adjustType,
          cantidad: Number(adjustQty),
          motivo: adjustMotivo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Error al ajustar stock');
        return;
      }

      addToast(
        'success',
        'Stock Actualizado',
        `${adjustType === 'entrada' ? '+' : '-'}${adjustQty} u. en "${adjustModalProduct.nombre}".`
      );
      setAdjustModalProduct(null);
      refreshAllData();
      if (activeSubTab === 'movements') {
        fetchMovements();
      }
    } catch (e: any) {
      addToast('error', e.message);
    } finally {
      setAdjustSubmitting(false);
    }
  };

  // Products that are below or equal to stockMinimo
  const lowStockList = products.filter(
    (p) => p.stock <= p.stockMinimo && p.estado !== 'desactivado'
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Control de Stock e Inventario
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Entradas, mermas, alertas de stock mínimo y lista automática de compras.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold self-start">
          <button
            id="stock-tab-inventory"
            onClick={() => handleSubTabChange('inventory')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'inventory'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            Inventario General
          </button>
          <button
            id="stock-tab-shopping-list"
            onClick={() => handleSubTabChange('shopping-list')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'shopping-list'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Lista de Compras ({lowStockList.length})</span>
          </button>
          <button
            id="stock-tab-movements"
            onClick={() => handleSubTabChange('movements')}
            className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'movements'
                ? 'bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Movimientos</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW 1: INVENTORY TABLE WITH FAST +/- CONTROLS             */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'inventory' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Producto</th>
                  <th className="p-3.5">Stock Actual</th>
                  <th className="p-3.5">Stock Mínimo</th>
                  <th className="p-3.5">Estado</th>
                  <th className="p-3.5 text-right">Ajuste de Stock Rápido</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {products.map((p) => {
                  const isOutOfStock = p.stock <= 0;
                  const isLow = p.stock <= p.stockMinimo;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imagen}
                            alt={p.nombre}
                            referrerPolicy="no-referrer"
                            className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 bg-white"
                          />
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {p.nombre}
                            </span>
                            <span className="text-[11px] text-slate-400">{p.marca}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-black text-sm">
                        <span
                          className={
                            isOutOfStock
                              ? 'text-rose-600'
                              : isLow
                              ? 'text-amber-600'
                              : 'text-slate-900 dark:text-white'
                          }
                        >
                          {p.stock} u.
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-500 font-semibold">{p.stockMinimo} u.</td>

                      <td className="p-3.5">
                        {isOutOfStock ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 font-bold text-[10px]">
                            🔴 Agotado
                          </span>
                        ) : isLow ? (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-[10px]">
                            🟡 Stock Bajo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                            🟢 Disponible
                          </span>
                        )}
                      </td>

                      {/* Fast Adjustment Buttons */}
                      <td className="p-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            id={`stock-minus-btn-${p.id}`}
                            onClick={() => handleOpenAdjust(p, 'salida')}
                            className="p-1.5 rounded-xl border border-rose-200 dark:border-rose-900 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            title="Descontar stock (merma/vencimiento)"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <button
                            id={`stock-plus-btn-${p.id}`}
                            onClick={() => handleOpenAdjust(p, 'entrada')}
                            className="p-1.5 rounded-xl border border-emerald-200 dark:border-emerald-900 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors cursor-pointer"
                            title="Ingresar stock (compra/reposición)"
                          >
                            <Plus className="w-3.5 h-3.5" />
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
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW 2: AUTOMATIC RESTOCK SHOPPING LIST                    */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'shopping-list' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500 text-white rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-amber-900 dark:text-amber-100">
                  Lista de Compras Sugerida para Proveedores
                </h3>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Calculada automáticamente comparando stock actual contra stock mínimo de seguridad.
                </p>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Lista</span>
            </button>
          </div>

          {lowStockList.length === 0 ? (
            <div className="py-16 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                ¡El inventario está abastecido!
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                No hay productos en nivel crítico en este momento.
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Producto</th>
                    <th className="p-3.5">Stock Actual</th>
                    <th className="p-3.5">Mínimo</th>
                    <th className="p-3.5">Sugerido a Comprar</th>
                    <th className="p-3.5">Costo Aprox.</th>
                    <th className="p-3.5 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {lowStockList.map((item) => {
                    const toBuy = Math.max(10, item.stockMinimo * 2 - item.stock);
                    const costEstimate = toBuy * (item.precioCosto ?? item.precioCompra);

                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                        <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                          {item.nombre} ({item.marca})
                        </td>
                        <td className="p-3.5 font-bold text-rose-600">{item.stock} u.</td>
                        <td className="p-3.5 text-slate-500">{item.stockMinimo} u.</td>
                        <td className="p-3.5 font-black text-sky-600">+{toBuy} unidades</td>
                        <td className="p-3.5 text-slate-700 dark:text-slate-300 font-semibold">
                          {formatCurrency(costEstimate)}
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            id={`quick-buy-btn-${item.id}`}
                            onClick={() => handleOpenAdjust(item, 'entrada')}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg cursor-pointer"
                          >
                            Cargar Ingreso
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-VIEW 3: HISTORICAL AUDITED STOCK MOVEMENTS                 */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'movements' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          {loadingMovements ? (
            <div className="py-12 text-center text-xs text-slate-400">Cargando movimientos...</div>
          ) : movements.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No hay movimientos de stock registrados todavía.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3.5">Fecha</th>
                    <th className="p-3.5">Producto</th>
                    <th className="p-3.5">Tipo</th>
                    <th className="p-3.5">Cantidad</th>
                    <th className="p-3.5">Stock Resultante</th>
                    <th className="p-3.5">Motivo</th>
                    <th className="p-3.5">Usuario</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {movements.map((mov) => (
                    <tr key={mov.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                      <td className="p-3.5 text-slate-500 whitespace-nowrap">
                        {formatDateTime(mov.fecha)}
                      </td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                        {mov.productoNombre}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            mov.tipo === 'entrada'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {mov.tipo === 'entrada' ? '▲ Entrada' : '▼ Salida'}
                        </span>
                      </td>
                      <td className="p-3.5 font-black">
                        {mov.tipo === 'entrada' ? '+' : '-'}
                        {mov.cantidad}
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-400">
                        {(mov.stockAnterior ?? mov.stockPrevio)} → <strong className="text-slate-900 dark:text-white">{(mov.stockNuevo ?? mov.stockPosterior)}</strong>
                      </td>
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">{mov.motivo}</td>
                      <td className="p-3.5 text-slate-400">{mov.usuarioNombre}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* STOCK ADJUSTMENT MODAL WITH MANDATORY MOTIVE                   */}
      {/* ------------------------------------------------------------- */}
      {adjustModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {adjustType === 'entrada' ? 'Ingreso de Mercadería' : 'Descuento de Stock / Merma'}
              </h3>
              <button
                id="close-adjust-modal-btn"
                onClick={() => setAdjustModalProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustment} className="mt-4 space-y-4">
              <div>
                <span className="text-xs text-slate-500 block">Producto:</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {adjustModalProduct.nombre}
                </span>
                <span className="text-xs text-slate-400 block mt-0.5">
                  Stock actual: <strong>{adjustModalProduct.stock} unidades</strong>
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Cantidad a {adjustType === 'entrada' ? 'sumar' : 'restar'}:
                </label>
                <input
                  id="input-adjust-qty"
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm font-black rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Motivo obligatorio del movimiento:
                </label>
                <select
                  id="select-adjust-motivo"
                  value={adjustMotivo}
                  onChange={(e) => setAdjustMotivo(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                >
                  {adjustType === 'entrada' ? (
                    <>
                      <option value="Compra a proveedor">Compra a proveedor</option>
                      <option value="Reposición de depósito">Reposición de depósito</option>
                      <option value="Devolución de cliente">Devolución de cliente</option>
                      <option value="Corrección de inventario (sobrante)">Corrección de inventario (sobrante)</option>
                    </>
                  ) : (
                    <>
                      <option value="Producto vencido">Producto vencido</option>
                      <option value="Producto dañado / merma">Producto dañado / merma</option>
                      <option value="Venta mostrador manual">Venta mostrador manual</option>
                      <option value="Consumo interno escolar">Consumo interno escolar</option>
                      <option value="Corrección de inventario (faltante)">Corrección de inventario (faltante)</option>
                    </>
                  )}
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustModalProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  id="confirm-adjust-stock-btn"
                  type="submit"
                  disabled={adjustSubmitting}
                  className={`px-4 py-2 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer ${
                    adjustType === 'entrada' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {adjustSubmitting ? 'Guardando...' : 'Confirmar Ajuste'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
