import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Supplier } from '../../types';
import { Truck, Plus, Phone, Mail, Calendar, Edit2, Trash2, X, Save } from 'lucide-react';

export const AdminSuppliers: React.FC = () => {
  const { suppliers, token, addToast, refreshAllData } = useApp();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    contacto: '',
    telefono: '',
    email: '',
    rubro: 'Bebidas y gaseosas',
    diasEntrega: 'Lunes y Jueves',
  });

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setFormData({
      nombre: '',
      contacto: '',
      telefono: '',
      email: '',
      rubro: 'Bebidas y gaseosas',
      diasEntrega: 'Lunes y Jueves',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setFormData({
      nombre: sup.nombre,
      contacto: sup.contacto || '',
      telefono: sup.telefono || '',
      email: sup.email || '',
      rubro: sup.rubro || 'Golosinas y Bebidas',
      diasEntrega: sup.diasEntrega || '',
    });
    setModalOpen(true);
  };

  const handleSaveSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    try {
      const url = editingSupplier ? `/api/suppliers/${editingSupplier.id}` : '/api/suppliers';
      const method = editingSupplier ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        addToast('error', data.error || 'Error al guardar proveedor');
        return;
      }

      addToast(
        'success',
        editingSupplier ? 'Proveedor actualizado' : 'Proveedor creado',
        `"${formData.nombre}" guardado.`
      );
      setModalOpen(false);
      refreshAllData();
    } catch (e: any) {
      addToast('error', e.message);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Directorio de Proveedores
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Contactos comerciales, rubros y días de entrega para reposición de mercadería.
          </p>
        </div>

        <button
          id="btn-nuevo-proveedor"
          onClick={handleOpenAdd}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Proveedor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {suppliers.map((sup: any) => (
          <div
            key={sup.id}
            className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600">
                  <Truck className="w-5 h-5" />
                </div>
                <button
                  id={`edit-sup-${sup.id}`}
                  onClick={() => handleOpenEdit(sup)}
                  className="p-1.5 text-slate-400 hover:text-sky-600 rounded-lg cursor-pointer"
                  title="Editar proveedor"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-black text-slate-900 dark:text-white mt-3">
                {sup.nombre}
              </h3>
              <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 mt-1">
                {sup.rubro}
              </span>

              <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                {sup.contacto && (
                  <div>
                    <span className="text-slate-400">Atención:</span>{' '}
                    <strong className="text-slate-800 dark:text-slate-200">{sup.contacto}</strong>
                  </div>
                )}
                {sup.telefono && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{sup.telefono}</span>
                  </div>
                )}
                {sup.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{sup.email}</span>
                  </div>
                )}
                {sup.diasEntrega && (
                  <div className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-semibold">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>Entrega: {sup.diasEntrega}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Supplier Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                {editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor Kiosco'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre / Distribuidora *
                </label>
                <input
                  type="text"
                  required
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej. Distribuidora Golosinas Central"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rubro / Especialidad:
                </label>
                <input
                  type="text"
                  required
                  value={formData.rubro}
                  onChange={(e) => setFormData({ ...formData, rubro: e.target.value })}
                  placeholder="Ej. Alfajores y Galletitas, Bebidas Frías, Panificados"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contacto / Preventista
                  </label>
                  <input
                    type="text"
                    value={formData.contacto}
                    onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Días de Entrega en Escuela:
                </label>
                <input
                  type="text"
                  value={formData.diasEntrega}
                  onChange={(e) => setFormData({ ...formData, diasEntrega: e.target.value })}
                  placeholder="Ej. Martes y Viernes a las 09:00"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                />
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
                  id="confirm-save-supplier-btn"
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Guardar Proveedor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
