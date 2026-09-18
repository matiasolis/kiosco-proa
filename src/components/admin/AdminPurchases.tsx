import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { PurchaseOrder } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Receipt, Plus, Truck, Calendar, DollarSign, X, CheckCircle2 } from 'lucide-react';

export const AdminPurchases: React.FC = () => {
  const { suppliers, products, token, addToast, refreshAllData } = useApp();

  const [purchases, setPurchases] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // New purchase form
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [cantidad, setCantidad] = useState<number>(20);
  const [costoUnitario, setCostoUnitario] = useState<number>(products[0]?.precioCosto ?? products[0]?.precioCompra ?? 500);
  const [submitting, setSubmitting] = useState(false);

  const fetchPurchases = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/purchases', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setPurchases(data.purchases || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchases();
  }, [token]);

  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setCostoUnitario(prod.precioCosto ?? prod.precioCompra);
    }
  };

  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || !selectedProductId || cantidad <= 0 || costoUnitario <= 0) return;

    setSubmitting(true);
    try {
      const prod = products.find((p) => p.id === selectedProductId);
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          proveedorId: selectedSupplierId,
          items: [
            {
              productoId: selectedProductId,
              productoNombre: prod?.nombre || 'Producto',
              cantidad: Number(cantidad),
              costoUnitario: Number(costoUnitario),
              subtotal: Number(cantidad) * Number(costoUnitario),
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Error al registrar compra');
        return;
      }

      addToast(
        'success',
        'Compra a Proveedor Registrada',
        `Stock de "${prod?.nombre}" aumentado en +${cantidad} unidades automáticamente.`
      );
      setModalOpen(false);
      fetchPurchases();
      refreshAllData();
    } catch (e: any) {
      addToast('error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Compras a Proveedores & Reposición
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Registro de facturas de compra. Actualiza automáticamente el stock y deduce dinero disponible.
          </p>
        </div>

        <button
          id="btn-registrar-compra"
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Compra Proveedor</span>
        </button>
      </div>

      {/* Purchases List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Cargando compras...</div>
        ) : purchases.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No hay compras a proveedores registradas todavía.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5">Fecha</th>
                  <th className="p-3.5">Proveedor</th>
                  <th className="p-3.5">Artículos Ingresados</th>
                  <th className="p-3.5">Total Factura</th>
                  <th className="p-3.5">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {purchases.map((pur) => (
                  <tr key={pur.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                    <td className="p-3.5 text-slate-500 whitespace-nowrap">
                      {formatDateTime(pur.fecha)}
                    </td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                      {pur.proveedorNombre}
                    </td>
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        {pur.items.map((it: any, idx: number) => (
                          <div key={idx} className="text-slate-700 dark:text-slate-300">
                            <strong className="text-emerald-600">+{it.cantidad} u.</strong> {it.productoNombre} ({formatCurrency(it.costoUnitario ?? it.precioCosto ?? 0)} c/u)
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-3.5 font-black text-rose-600">
                      -{formatCurrency(pur.total)}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                        ✓ Ingresado a Stock
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* New Purchase Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Registrar Factura de Compra
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePurchase} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Proveedor:
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                >
                  {suppliers.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} ({s.rubro})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Producto a ingresar:
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => handleProductChange(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nombre} (Stock actual: {p.stock} u.)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Cantidad de unidades:
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={cantidad}
                    onChange={(e) => setCantidad(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Costo unitario ($):
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="50"
                    required
                    value={costoUnitario}
                    onChange={(e) => setCostoUnitario(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-500 font-semibold">Total a pagar a proveedor:</span>
                <span className="text-base font-black text-rose-600">
                  {formatCurrency(cantidad * costoUnitario)}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  id="confirm-save-purchase-btn"
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {submitting ? 'Procesando...' : 'Confirmar e Ingresar Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
