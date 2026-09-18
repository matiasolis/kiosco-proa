/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { ShopHeader } from './components/shop/ShopHeader';
import { ShopCatalog } from './components/shop/ShopCatalog';
import { CartDrawer } from './components/shop/CartDrawer';
import { CheckoutModal } from './components/shop/CheckoutModal';
import { OrderSuccessModal } from './components/shop/OrderSuccessModal';
import { DigitalVoucherModal } from './components/shop/DigitalVoucherModal';
import { ShopOrders } from './components/shop/ShopOrders';
import { ShopFavorites } from './components/shop/ShopFavorites';
import { ShopProfile } from './components/shop/ShopProfile';

import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminHeader } from './components/admin/AdminHeader';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminProducts } from './components/admin/AdminProducts';
import { AdminStock } from './components/admin/AdminStock';
import { AdminFinances } from './components/admin/AdminFinances';
import { AdminStatistics } from './components/admin/AdminStatistics';
import { AdminSuppliers } from './components/admin/AdminSuppliers';
import { AdminPurchases } from './components/admin/AdminPurchases';
import { AdminClients } from './components/admin/AdminClients';
import { AdminActivity } from './components/admin/AdminActivity';
import { AdminSettings } from './components/admin/AdminSettings';

import { AuthModal } from './components/auth/AuthModal';
import { ToastContainer } from './components/ui/Toast';

const MainLayout: React.FC = () => {
  const { userExperience, activeShopTab, activeAdminTab } = useApp();
  const [shopSearchQuery, setShopSearchQuery] = useState('');

  // Admin layout state
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [adminMobileOpen, setAdminMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* ========================================================= */}
      {/* 1. STUDENT / CLIENT SHOP EXPERIENCE                      */}
      {/* ========================================================= */}
      {userExperience === 'shop' && (
        <div className="flex flex-col min-h-screen">
          <ShopHeader searchQuery={shopSearchQuery} setSearchQuery={setShopSearchQuery} />

          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
            {activeShopTab === 'catalog' && <ShopCatalog searchQuery={shopSearchQuery} />}
            {activeShopTab === 'orders' && <ShopOrders />}
            {activeShopTab === 'favorites' && <ShopFavorites />}
            {activeShopTab === 'profile' && <ShopProfile />}
          </main>

          {/* Student Footer */}
          <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-500 dark:text-slate-400">
            <div className="max-w-7xl mx-auto px-4">
              <p className="font-semibold text-slate-700 dark:text-slate-300">
                Kiosco Escolar Oficial • Colegio San Martín
              </p>
              <p className="mt-1 text-[11px]">
                Pedidos en tiempo real con retiro en recreos y control integral de stock.
              </p>
            </div>
          </footer>

          {/* Student Experience Drawers & Modals */}
          <CartDrawer />
          <CheckoutModal />
          <OrderSuccessModal />
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. ADMINISTRATOR / KIOSK OPERATOR EXPERIENCE             */}
      {/* ========================================================= */}
      {userExperience === 'admin' && (
        <div className="flex min-h-screen">
          <AdminSidebar
            collapsed={sidebarCollapsed}
            setCollapsed={setSidebarCollapsed}
            mobileOpen={adminMobileOpen}
            setMobileOpen={setAdminMobileOpen}
          />

          <div className="flex-1 flex flex-col min-w-0">
            <AdminHeader setMobileOpen={setAdminMobileOpen} />

            <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
              {activeAdminTab === 'dashboard' && <AdminDashboard />}
              {activeAdminTab === 'orders' && <AdminOrders />}
              {activeAdminTab === 'products' && <AdminProducts />}
              {activeAdminTab === 'stock' && <AdminStock />}
              {activeAdminTab === 'finances' && <AdminFinances />}
              {activeAdminTab === 'statistics' && <AdminStatistics />}
              {activeAdminTab === 'suppliers' && <AdminSuppliers />}
              {activeAdminTab === 'purchases' && <AdminPurchases />}
              {activeAdminTab === 'clients' && <AdminClients />}
              {activeAdminTab === 'activity' && <AdminActivity />}
              {activeAdminTab === 'settings' && <AdminSettings />}
            </main>
          </div>
        </div>
      )}

      {/* Shared Modals & Notifications across all modes */}
      <DigitalVoucherModal />
      <AuthModal />
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
