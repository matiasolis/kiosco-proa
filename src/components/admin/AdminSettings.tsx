import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Settings, QrCode, Clock, Save, Download, Store, CheckCircle2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { settings, token, addToast, refreshAllData, products, orders } = useApp();

  const [nombreKiosco, setNombreKiosco] = useState(settings?.nombreKiosco || 'Kiosco Escolar San Martín');
  const [aliasMp, setAliasMp] = useState(settings?.aliasMp || 'kiosco.sanmartin.mp');
  const [qrImageUrl, setQrImageUrl] = useState(settings?.qrImageUrl || '');
  const [recreos, setRecreos] = useState<string[]>(
    settings?.recreosDisponibles || [
      '09:15 - Recreo Mañana (15 min)',
      '10:45 - Recreo Principal (20 min)',
      '12:15 - Almuerzo escolar',
      '14:30 - Recreo Tarde (15 min)',
    ]
  );
  const [newRecreo, setNewRecreo] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddRecreo = () => {
    if (newRecreo.trim() && !recreos.includes(newRecreo.trim())) {
      setRecreos([...recreos, newRecreo.trim()]);
      setNewRecreo('');
    }
  };

  const handleRemoveRecreo = (index: number) => {
    setRecreos(recreos.filter((_, i) => i !== index));
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nombreKiosco,
          aliasMp,
          qrImageUrl: qrImageUrl || undefined,
          recreosDisponibles: recreos,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Error al guardar');
        return;
      }

      addToast('success', 'Configuración guardada', 'Los cambios están activos en todo el sistema.');
      refreshAllData();
    } catch (e: any) {
      addToast('error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleExportCSV = () => {
    // Generate simple CSV of products
    const headers = ['ID', 'Nombre', 'Marca', 'Categoria', 'Costo', 'PrecioVenta', 'Stock', 'Estado'];
    const rows = products.map((p) => [
      p.id,
      `"${p.nombre}"`,
      `"${p.marca}"`,
      p.categoriaId,
      p.precioCosto ?? p.precioCompra,
      p.precioVenta,
      p.stock,
      p.estado,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `kiosco_inventario_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast('success', 'Archivo CSV Exportado', 'Se descargó el catálogo e inventario completo.');
  };

  return (
    <div className="space-y-6 pb-16 max-w-4xl">
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
          Configuración General del Kiosco
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Ajustá el nombre del establecimiento, QR oficial de pagos, recreos escolares y copias de seguridad.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Identity */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Store className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Identidad del Kiosco Escolar
            </h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre Visible del Kiosco:
            </label>
            <input
              type="text"
              required
              value={nombreKiosco}
              onChange={(e) => setNombreKiosco(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold"
            />
          </div>
        </div>

        {/* Mercado Pago & QR */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <QrCode className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Datos de Cobro Mercado Pago
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alias de Transferencia:
              </label>
              <input
                type="text"
                required
                value={aliasMp}
                onChange={(e) => setAliasMp(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                URL Imagen Código QR Oficial:
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={qrImageUrl}
                onChange={(e) => setQrImageUrl(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
        </div>

        {/* School Recess Schedule */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Clock className="w-5 h-5 text-sky-600" />
            <h3 className="text-sm font-black text-slate-900 dark:text-white">
              Horarios de Recreos Escolares (Modalidad de Retiro)
            </h3>
          </div>

          <div className="space-y-2">
            {recreos.map((rec, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200">{rec}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveRecreo(idx)}
                  className="text-xs text-rose-500 hover:text-rose-700 font-bold px-2 py-1"
                >
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <input
              type="text"
              placeholder="Ej. 16:00 - Recreo Extraordinario"
              value={newRecreo}
              onChange={(e) => setNewRecreo(e.target.value)}
              className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
            />
            <button
              type="button"
              onClick={handleAddRecreo}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl"
            >
              + Agregar Recreo
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Guardando...' : 'Guardar Toda la Configuración'}</span>
          </button>
        </div>
      </form>

      {/* Export & Backups */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <h3 className="text-sm font-black text-slate-900 dark:text-white">
          Exportación de Datos & Backups
        </h3>
        <p className="text-xs text-slate-500">
          Descargá los reportes completos de inventario y compras para abrir en Excel, Google Sheets o archivar.
        </p>
        <div className="pt-2">
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:bg-slate-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Descargar Catálogo e Inventario (.CSV)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
