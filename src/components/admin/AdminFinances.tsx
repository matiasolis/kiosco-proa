import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { FinanceStats } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Banknote,
  Receipt,
  Plus,
  Wallet,
  Calendar,
  ArrowDownRight,
  ArrowUpRight,
  FileText,
  X,
} from 'lucide-react';

export const AdminFinances: React.FC = () => {
  const { token, orders, addToast, setActiveVoucherOrder } = useApp();

  const [stats, setStats] = useState<FinanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [expenseConcepto, setExpenseConcepto] = useState('');
  const [expenseMonto, setExpenseMonto] = useState<number>(0);
  const [expenseCategoria, setExpenseCategoria] = useState('Insumos descartables');
  const [expenseSubmitting, setExpenseSubmitting] = useState(false);

  const fetchFinances = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/finances/stats', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinances();
  }, [token, orders]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseConcepto.trim() || expenseMonto <= 0) return;

    setExpenseSubmitting(true);
    try {
      const res = await fetch('/api/finances/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          concepto: expenseConcepto.trim(),
          monto: Number(expenseMonto),
          categoria: expenseCategoria,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Error al registrar gasto');
        return;
      }

      addToast('success', 'Gasto Registrado', `Se registraron ${formatCurrency(expenseMonto)} en "${expenseConcepto}".`);
      setExpenseModalOpen(false);
      setExpenseConcepto('');
      setExpenseMonto(0);
      fetchFinances();
    } catch (e: any) {
      addToast('error', e.message);
    } finally {
      setExpenseSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Control de Ventas & Finanzas
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Caja diaria, ganancias netas, costos de mercadería vendida y gastos operativos.
          </p>
        </div>

        <button
          id="btn-nuevo-gasto"
          onClick={() => setExpenseModalOpen(true)}
          className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Registrar Gasto Kiosco</span>
        </button>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ventas Hoy */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ventas Hoy</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(stats?.ventasHoy || 0)}
          </div>
          <span className="text-xs text-emerald-600 font-semibold block mt-1">
            +{formatCurrency(stats?.gananciasHoy || 0)} ganancia neta hoy
          </span>
        </div>

        {/* Ventas Mes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ventas del Mes</span>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {formatCurrency(stats?.ventasMes || 0)}
          </div>
          <span className="text-xs text-slate-500 block mt-1">
            Costo mercadería: {formatCurrency(stats?.costoMercaderiaMes || 0)}
          </span>
        </div>

        {/* Ganancia Neta Mes */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Ganancia Neta Mes</span>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(stats?.gananciasMes || 0)}
          </div>
          <span className="text-xs text-slate-500 block mt-1">
            (Total Facturado - Costo de Compra)
          </span>
        </div>

        {/* Dinero Disponible Caja Real */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-600/20">
          <span className="text-xs font-bold uppercase tracking-wider text-sky-100">Dinero Disponible Real</span>
          <div className="text-2xl font-black mt-1">
            {formatCurrency(stats?.dineroDisponible || 0)}
          </div>
          <span className="text-xs text-sky-100 block mt-1">
            Ingresos cobrados - compras - gastos
          </span>
        </div>
      </div>

      {/* Payment Methods Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
            Ingresos por Medio de Pago (Mes en curso)
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500 text-white">
                  <Banknote className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                    Efectivo en Mostrador
                  </h4>
                  <span className="text-xs text-emerald-700 dark:text-emerald-400">
                    Cobrado directamente en ventanilla
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {formatCurrency(stats?.efectivoTotal || 0)}
                </span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-sky-500 text-white">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-sky-950 dark:text-sky-200">
                    Mercado Pago (Transferencias / QR)
                  </h4>
                  <span className="text-xs text-sky-700 dark:text-sky-400">
                    Cobrado en cuenta digital oficial
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-slate-900 dark:text-white">
                  {formatCurrency(stats?.mercadopagoTotal || 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses and Cash Outflow summary */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Gastos Varios Operativos Registrados
              </h3>
              <button
                id="btn-add-expense-quick"
                onClick={() => setExpenseModalOpen(true)}
                className="text-xs text-sky-600 font-bold hover:underline"
              >
                + Nuevo Gasto
              </button>
            </div>

            {stats?.gastosRecientes && stats.gastosRecientes.length > 0 ? (
              <div className="space-y-2">
                {stats.gastosRecientes.slice(0, 4).map((g) => (
                  <div
                    key={g.id}
                    className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {g.concepto}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {g.categoria} • {formatDateTime(g.fecha)}
                      </span>
                    </div>
                    <span className="font-black text-rose-600">-{formatCurrency(g.monto)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No hay gastos varios cargados este mes.
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex justify-between text-slate-500">
            <span>Total gastos operativos:</span>
            <strong className="text-rose-600">-{formatCurrency(stats?.gastosMes || 0)}</strong>
          </div>
        </div>
      </div>

      {/* Recent Orders Ledger with Ticket Trigger */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Libro de Ventas Diarias
            </h3>
            <span className="text-xs text-slate-400">Detalle ordenado por fecha y comprobante</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5">Fecha</th>
                <th className="p-3.5">Pedido</th>
                <th className="p-3.5">Cliente</th>
                <th className="p-3.5">Método de Pago</th>
                <th className="p-3.5">Total Venta</th>
                <th className="p-3.5">Estado Pago</th>
                <th className="p-3.5 text-right">Comprobante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {orders.slice(0, 10).map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                  <td className="p-3.5 text-slate-500 whitespace-nowrap">
                    {formatDateTime(ord.fecha)}
                  </td>
                  <td className="p-3.5 font-bold text-slate-900 dark:text-white">
                    #{ord.numeroPedido}
                  </td>
                  <td className="p-3.5">{ord.clienteVisible}</td>
                  <td className="p-3.5 capitalize text-slate-600 dark:text-slate-300">
                    {ord.metodoPago === 'efectivo' ? '💵 Efectivo' : '📱 Mercado Pago'}
                  </td>
                  <td className="p-3.5 font-black text-slate-900 dark:text-white">
                    {formatCurrency(ord.total)}
                  </td>
                  <td className="p-3.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        ord.estadoPago === 'confirmado'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}
                    >
                      {ord.estadoPago}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      id={`ticket-ledger-btn-${ord.numeroPedido}`}
                      onClick={() => setActiveVoucherOrder(ord)}
                      className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg cursor-pointer"
                      title="Ver Comprobante Oficial"
                    >
                      <FileText className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* EXPENSE REGISTRATION MODAL                                    */}
      {/* ------------------------------------------------------------- */}
      {expenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Registrar Gasto del Kiosco
              </h3>
              <button
                id="close-expense-modal-btn"
                onClick={() => setExpenseModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Concepto del Gasto:
                </label>
                <input
                  id="input-expense-concepto"
                  type="text"
                  required
                  placeholder="Ej. Compra de servilletas y vasos descartables"
                  value={expenseConcepto}
                  onChange={(e) => setExpenseConcepto(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Monto ($):
                </label>
                <input
                  id="input-expense-monto"
                  type="number"
                  min="1"
                  step="50"
                  required
                  value={expenseMonto || ''}
                  onChange={(e) => setExpenseMonto(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold text-rose-600 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Categoría de Gasto:
                </label>
                <select
                  id="select-expense-categoria"
                  value={expenseCategoria}
                  onChange={(e) => setExpenseCategoria(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  <option value="Insumos descartables">Insumos descartables (vasos, servilletas)</option>
                  <option value="Hielo y refrigeración">Hielo y refrigeración</option>
                  <option value="Limpieza e higiene">Limpieza e higiene</option>
                  <option value="Mantenimiento kiosco">Mantenimiento tostadora / heladeras</option>
                  <option value="Fletes y logística">Flete / Transporte de mercadería</option>
                  <option value="Otros gastos">Otros gastos varios</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setExpenseModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  id="confirm-save-expense-btn"
                  type="submit"
                  disabled={expenseSubmitting}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  {expenseSubmitting ? 'Guardando...' : 'Registrar Salida de Dinero'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
