import React, { useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import {
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Calendar,
  AlertCircle,
  TrendingDown,
  ShoppingBag,
  Percent,
} from 'lucide-react';

export const AdminStatistics: React.FC = () => {
  const { orders, products } = useApp();

  // Metrics computation
  const statsData = useMemo(() => {
    // Aggregation by product
    const productMap: Record<
      string,
      { nombre: string; marca: string; cantidad: number; total: number; imagen: string }
    > = {};

    products.forEach((p) => {
      productMap[p.id] = {
        nombre: p.nombre,
        marca: p.marca,
        cantidad: 0,
        total: 0,
        imagen: p.imagen,
      };
    });

    let totalRevenue = 0;
    const hourMap: Record<number, number> = {};

    orders.forEach((o) => {
      if (o.estado !== 'cancelado') {
        totalRevenue += o.total;

        // Hour breakdown
        const hour = new Date(o.fecha).getHours();
        hourMap[hour] = (hourMap[hour] || 0) + 1;

        o.items.forEach((it) => {
          if (productMap[it.productoId]) {
            productMap[it.productoId].cantidad += it.cantidad;
            productMap[it.productoId].total += it.subtotal;
          } else {
            productMap[it.productoId] = {
              nombre: it.productoNombre,
              marca: '',
              cantidad: it.cantidad,
              total: it.subtotal,
              imagen: '',
            };
          }
        });
      }
    });

    const productList = Object.values(productMap);

    // Top selling
    const mostSold = [...productList].sort((a, b) => b.cantidad - a.cantidad);
    // Least sold (only products with >= 0 sales)
    const leastSold = [...productList].sort((a, b) => a.cantidad - b.cantidad);

    // Average ticket
    const validOrders = orders.filter((o) => o.estado !== 'cancelado');
    const ticketPromedio = validOrders.length > 0 ? totalRevenue / validOrders.length : 0;

    // Delivery rate on time (mocked based on delivered/total ratio)
    const deliveredCount = orders.filter((o) => o.estado === 'entregado').length;
    const fulfillmentRate = orders.length > 0 ? Math.round((deliveredCount / orders.length) * 100) : 100;

    return {
      mostSold: mostSold.slice(0, 5),
      leastSold: leastSold.slice(0, 5),
      ticketPromedio,
      totalOrders: validOrders.length,
      fulfillmentRate,
      hourMap,
    };
  }, [orders, products]);

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Estadísticas & Análisis de Rendimiento
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Comportamiento de compra escolar, ranking de productos y horarios pico.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Ticket Promedio</span>
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {formatCurrency(statsData.ticketPromedio)}
          </div>
          <span className="text-xs text-slate-400 block mt-0.5">Por cada compra de alumno</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total de Pedidos</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {statsData.totalOrders}
          </div>
          <span className="text-xs text-slate-400 block mt-0.5">Pedidos válidos procesados</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Tasa de Entrega</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {statsData.fulfillmentRate}%
          </div>
          <span className="text-xs text-slate-400 block mt-0.5">Pedidos retirados a tiempo</span>
        </div>
      </div>

      {/* Rankings: Most Sold vs Least Sold */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Sold Ranking */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Top 5 Productos Más Vendidos
              </h3>
              <span className="text-[11px] text-slate-400">Favoritos de los alumnos</span>
            </div>
          </div>

          <div className="space-y-3">
            {statsData.mostSold.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-amber-500 text-white font-black text-xs flex items-center justify-center">
                    #{idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {p.nombre}
                    </span>
                    <span className="text-[10px] text-slate-400">{p.marca}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-black text-slate-900 dark:text-white block">
                    {p.cantidad} u. vendidas
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600">
                    {formatCurrency(p.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Least Sold Ranking (Stagnant stock warning) */}
        <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                Productos Menos Vendidos (Alerta Merma)
              </h3>
              <span className="text-[11px] text-slate-400">Mercadería con baja rotación</span>
            </div>
          </div>

          <div className="space-y-3">
            {statsData.leastSold.map((p, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-black text-xs flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div>
                    <span className="font-bold text-xs text-slate-900 dark:text-white block">
                      {p.nombre}
                    </span>
                    <span className="text-[10px] text-slate-400">{p.marca}</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-bold text-rose-600 block">
                    {p.cantidad} u. registradas
                  </span>
                  <span className="text-[10px] text-slate-400">Evaluar promo</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Peak demand hours insight */}
      <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Horarios Pico & Recreos de Mayor Afluencia
            </h3>
            <span className="text-xs text-slate-400">
              Concentración de pedidos a lo largo de la jornada escolar
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
          <div className="p-3 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900">
            <span className="text-[11px] font-bold text-sky-700 dark:text-sky-300 block">
              1er Recreo (10:15 - 10:30)
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white block mt-1">
              Alta Demanda
            </span>
            <span className="text-[10px] text-slate-500">Bebidas y sándwiches</span>
          </div>

          <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900">
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 block">
              Almuerzo (12:00 - 13:00)
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white block mt-1">
              Pico Máximo
            </span>
            <span className="text-[10px] text-slate-500">Empanadas y tostados</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 block">
              2do Recreo (14:30 - 14:45)
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white block mt-1">
              Media Demanda
            </span>
            <span className="text-[10px] text-slate-500">Golosinas y galletitas</span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
              Salida (16:30 - 17:00)
            </span>
            <span className="text-lg font-black text-slate-900 dark:text-white block mt-1">
              Demanda Rápida
            </span>
            <span className="text-[10px] text-slate-500">Helados y aguas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
