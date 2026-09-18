import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  Heart,
  User as UserIcon,
  Search,
  Sun,
  Moon,
  Clock,
  LogOut,
  Shield,
  Menu,
  X,
  Store,
} from 'lucide-react';

interface ShopHeaderProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export const ShopHeader: React.FC<ShopHeaderProps> = ({ searchQuery, setSearchQuery }) => {
  const {
    currentUser,
    activeShopTab,
    setActiveShopTab,
    cart,
    setCartOpen,
    setAuthModalOpen,
    setAuthModalTab,
    logout,
    theme,
    toggleTheme,
    setUserExperience,
    settings,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const totalCartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header
      id="shop-header"
      className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors"
    >
      {/* Top micro announcement */}
      <div className="bg-gradient-to-r from-sky-600 via-sky-500 to-cyan-500 text-white text-[11px] font-medium py-1 px-4 text-center">
        <span>⚡ Kiosco Escolar Online — ¡Hacé tu pedido ahora y retirá sin fila en el próximo recreo!</span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & School Branding */}
          <div className="flex items-center gap-3">
            <button
              id="brand-home-btn"
              onClick={() => setActiveShopTab('catalog')}
              className="flex items-center gap-2.5 text-left group cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black text-lg shadow-sm shadow-sky-500/30 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                  {settings?.nombreKiosco || 'Kiosco Escolar'}
                  <span className="text-[10px] px-1.5 py-0.5 font-bold uppercase tracking-wider bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 rounded-md">
                    Alumnos
                  </span>
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block -mt-0.5">
                  Tienda Online Oficial
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                id="shop-search-input"
                type="text"
                placeholder="Buscar bebidas, alfajores, snacks, tostados..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:bg-white dark:focus:bg-slate-900 transition-all"
              />
              {searchQuery && (
                <button
                  id="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right Nav & Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* If Admin logged in, button to go to Admin Panel */}
            {currentUser?.role === 'admin' && (
              <button
                id="header-goto-admin-btn"
                onClick={() => setUserExperience('admin')}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-xl hover:bg-amber-100 transition-all cursor-pointer"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Panel Kiosco</span>
              </button>
            )}

            {/* Light / Dark Mode Toggle */}
            <button
              id="theme-toggle-btn"
              onClick={toggleTheme}
              aria-label="Cambiar tema"
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Mis Favoritos Button */}
            <button
              id="nav-favorites-btn"
              onClick={() => {
                if (!currentUser) {
                  setAuthModalOpen(true);
                } else {
                  setActiveShopTab('favorites');
                }
              }}
              className={`p-2 rounded-xl transition-colors relative cursor-pointer ${
                activeShopTab === 'favorites'
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Mis Favoritos"
            >
              <Heart className="w-5 h-5" />
              {currentUser?.favorites && currentUser.favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {currentUser.favorites.length}
                </span>
              )}
            </button>

            {/* Mis Compras Button */}
            <button
              id="nav-orders-btn"
              onClick={() => {
                if (!currentUser) {
                  setAuthModalOpen(true);
                } else {
                  setActiveShopTab('orders');
                }
              }}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors cursor-pointer ${
                activeShopTab === 'orders'
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>Mis Pedidos</span>
            </button>

            {/* Shopping Cart Button */}
            <button
              id="open-cart-btn"
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-xs shadow-sky-600/30 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Carrito</span>
              {totalCartItems > 0 && (
                <span className="px-1.5 py-0.5 text-[11px] font-black bg-white text-sky-700 rounded-full">
                  {totalCartItems}
                </span>
              )}
            </button>

            {/* User Account / Profile */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
                <button
                  id="nav-profile-btn"
                  onClick={() => setActiveShopTab('profile')}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Ver Mi Perfil"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-sky-500 to-cyan-400 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {currentUser.nombreVisible.charAt(0)}
                  </div>
                  <span className="hidden lg:inline text-xs font-bold text-slate-800 dark:text-slate-200">
                    {currentUser.nombreVisible}
                  </span>
                </button>
                <button
                  id="header-logout-btn"
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 rounded-xl transition-colors cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="header-login-btn"
                onClick={() => {
                  setAuthModalTab('login');
                  setAuthModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-600 dark:text-sky-400 border border-sky-300 dark:border-sky-800 hover:bg-sky-50 dark:hover:bg-sky-950/60 rounded-xl transition-all cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Ingresar</span>
              </button>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 rounded-xl"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="md:hidden pb-3">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              id="mobile-shop-search-input"
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Mobile Expanded Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            <button
              id="mobile-nav-catalog-btn"
              onClick={() => {
                setActiveShopTab('catalog');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              🏪 Catálogo de Productos
            </button>
            <button
              id="mobile-nav-orders-btn"
              onClick={() => {
                if (!currentUser) setAuthModalOpen(true);
                else setActiveShopTab('orders');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              🕒 Mis Pedidos / Comprobantes
            </button>
            <button
              id="mobile-nav-favorites-btn"
              onClick={() => {
                if (!currentUser) setAuthModalOpen(true);
                else setActiveShopTab('favorites');
                setMobileMenuOpen(false);
              }}
              className="px-3 py-2 text-left text-sm font-semibold text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              ❤️ Mis Favoritos
            </button>
            {currentUser?.role === 'admin' && (
              <button
                id="mobile-nav-admin-btn"
                onClick={() => {
                  setUserExperience('admin');
                  setMobileMenuOpen(false);
                }}
                className="px-3 py-2 text-left text-sm font-bold text-amber-600 dark:text-amber-400 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-950/40"
              >
                👨‍💼 Cambiar a Panel Administrador
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
