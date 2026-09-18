import React from 'react';
import { useApp, AdminTab } from '../../context/AppContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Boxes,
  DollarSign,
  BarChart3,
  Truck,
  Receipt,
  Users,
  History,
  Settings,
  Store,
  LogOut,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface AdminSidebarProps {
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (o: boolean) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const {
    activeAdminTab,
    setActiveAdminTab,
    pendingOrdersCount,
    setUserExperience,
    currentUser,
    logout,
    theme,
    toggleTheme,
    settings,
  } = useApp();

  const navItems: { id: AdminTab; label: string; icon: any; badge?: number }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Pedidos', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'products', label: 'Productos', icon: Package },
    { id: 'stock', label: 'Stock e Inventario', icon: Boxes },
    { id: 'finances', label: 'Ventas y Finanzas', icon: DollarSign },
    { id: 'statistics', label: 'Estadísticas', icon: BarChart3 },
    { id: 'suppliers', label: 'Proveedores', icon: Truck },
    { id: 'purchases', label: 'Compras Proveedores', icon: Receipt },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'activity', label: 'Historial Actividad', icon: History },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  const handleSelectTab = (tab: AdminTab) => {
    setActiveAdminTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs"
        />
      )}

      <aside
        id="admin-sidebar"
        className={`fixed lg:sticky top-0 left-0 z-40 h-screen bg-slate-900 text-slate-100 flex flex-col justify-between border-r border-slate-800 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-64'
        } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Sidebar Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black text-lg shrink-0 shadow-md shadow-sky-500/20">
              <Store className="w-5 h-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="text-sm font-black text-white truncate leading-tight">
                  {settings?.nombreKiosco || 'Kiosco Escolar'}
                </h2>
                <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider block">
                  Panel de Gestión
                </span>
              </div>
            )}
          </div>

          <button
            id="sidebar-toggle-collapse-btn"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            title={collapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeAdminTab === item.id;

            return (
              <button
                key={item.id}
                id={`admin-nav-${item.id}`}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative group cursor-pointer ${
                  isActive
                    ? 'bg-sky-600 text-white shadow-xs shadow-sky-600/30'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-100'}`} />

                {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}

                {/* Badge for pending orders */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-black rounded-full shadow-xs ${
                      isActive ? 'bg-white text-sky-700' : 'bg-rose-500 text-white'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          {/* Switch to Student Store */}
          <button
            id="switch-to-shop-btn"
            onClick={() => setUserExperience('shop')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/40 border border-emerald-800/60 transition-colors cursor-pointer"
            title="Ver Tienda Online de Alumnos"
          >
            <Store className="w-4 h-4 shrink-0 text-emerald-400" />
            {!collapsed && <span className="truncate">Ver Tienda Alumnos</span>}
          </button>

          {/* User profile & Theme row */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
            {!collapsed ? (
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0">
                  {currentUser?.nombreVisible?.charAt(0) || 'A'}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {currentUser?.nombreVisible || 'Administrador'}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">Admin Autorizado</div>
                </div>
              </div>
            ) : (
              <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-xs uppercase mx-auto">
                {currentUser?.nombreVisible?.charAt(0) || 'A'}
              </div>
            )}

            <div className="flex items-center gap-1">
              <button
                id="sidebar-theme-toggle"
                onClick={toggleTheme}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Cambiar tema"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              <button
                id="sidebar-logout-btn"
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
