import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
  User,
  Product,
  Category,
  Order,
  CartItem,
  KioskSettings,
  Supplier,
} from '../types';
import { playChime } from '../utils/formatters';

export type AdminTab =
  | 'dashboard'
  | 'orders'
  | 'products'
  | 'stock'
  | 'finances'
  | 'statistics'
  | 'suppliers'
  | 'purchases'
  | 'clients'
  | 'activity'
  | 'settings';

export type ShopTab = 'catalog' | 'orders' | 'favorites' | 'profile';

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  title: string;
  message?: string;
}

interface AppContextType {
  currentUser: User | null;
  token: string | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  userExperience: 'admin' | 'shop';
  setUserExperience: (exp: 'admin' | 'shop') => void;
  activeAdminTab: AdminTab;
  setActiveAdminTab: (tab: AdminTab) => void;
  activeShopTab: ShopTab;
  setActiveShopTab: (tab: ShopTab) => void;
  products: Product[];
  categories: Category[];
  suppliers: Supplier[];
  orders: Order[];
  settings: KioskSettings | null;
  cart: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  checkoutOpen: boolean;
  setCheckoutOpen: (open: boolean) => void;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  authModalTab: 'login' | 'register';
  setAuthModalTab: (tab: 'login' | 'register') => void;
  activeVoucherOrder: Order | null;
  setActiveVoucherOrder: (order: Order | null) => void;
  lastOrderPlaced: Order | null;
  setLastOrderPlaced: (order: Order | null) => void;
  pendingOrdersCount: number;
  toasts: ToastMessage[];
  addToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;
  login: (email: string, pass: string) => Promise<boolean>;
  register: (data: { nombre: string; apellido: string; nombreVisible: string; email: string; password: string }) => Promise<boolean>;
  logout: () => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleFavorite: (productId: string) => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme initialization (detect system or local preference)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kiosco_theme') as 'light' | 'dark';
      if (stored) return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('kiosco_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Auth State
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('kiosco_token'));
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('kiosco_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Views & Tabs
  const [userExperience, setUserExperience] = useState<'admin' | 'shop'>('shop');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('dashboard');
  const [activeShopTab, setActiveShopTab] = useState<ShopTab>('catalog');

  // Modals & Drawers
  const [cartOpen, setCartOpen] = useState<boolean>(false);
  const [checkoutOpen, setCheckoutOpen] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [activeVoucherOrder, setActiveVoucherOrder] = useState<Order | null>(null);
  const [lastOrderPlaced, setLastOrderPlaced] = useState<Order | null>(null);

  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('kiosco_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('kiosco_cart', JSON.stringify(cart));
  }, [cart]);

  // Data Store
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<KioskSettings | null>(null);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Fetch initial core data
  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?includeDeactivated=true');
      const data = await res.json();
      if (data.products) setProducts(data.products);
    } catch (e) {
      console.error('Error fetching products', e);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (data.categories) setCategories(data.categories);
    } catch (e) {
      console.error('Error fetching categories', e);
    }
  }, []);

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
    } catch (e) {
      console.error('Error fetching settings', e);
    }
  }, []);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      if (data.suppliers) setSuppliers(data.suppliers);
    } catch (e) {
      console.error('Error fetching suppliers', e);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.orders) {
          setOrders(data.orders);
          const pending = data.orders.filter((o: Order) => o.estado === 'pendiente').length;
          setPendingOrdersCount(pending);
        }
      }
    } catch (e) {
      console.error('Error fetching orders', e);
    }
  }, [token]);

  const refreshAllData = useCallback(async () => {
    await Promise.all([fetchProducts(), fetchCategories(), fetchSuppliers(), fetchSettings(), fetchOrders()]);
  }, [fetchProducts, fetchCategories, fetchSuppliers, fetchSettings, fetchOrders]);

  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Adjust experience when user logs in or role changes
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      setUserExperience('admin');
    } else {
      setUserExperience('shop');
    }
  }, [currentUser?.role]);

  // Real-time synchronization polling (every 3 seconds)
  const [lastVersion, setLastVersion] = useState<number>(0);
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/events/version');
        if (!res.ok) return;
        const data = await res.json();

        if (data.version && data.version !== lastVersion) {
          setLastVersion(data.version);

          // Check if new pending order arrived for admin
          if (currentUser?.role === 'admin' && data.pendingOrdersCount > pendingOrdersCount) {
            playChime('order');
            addToast('info', '🔔 ¡Nuevo Pedido Recibido!', `Hay ${data.pendingOrdersCount} pedidos pendientes para preparar.`);
          }

          setPendingOrdersCount(data.pendingOrdersCount);
          fetchProducts();
          fetchOrders();
        }
      } catch (err) {
        // network silent
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [lastVersion, pendingOrdersCount, currentUser, addToast, fetchProducts, fetchOrders]);

  // Login
  const login = async (email: string, pass: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', 'Error al iniciar sesión', data.error);
        return false;
      }

      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('kiosco_token', data.token);
      localStorage.setItem('kiosco_user', JSON.stringify(data.user));

      addToast('success', `¡Bienvenido/a ${data.user.nombreVisible}!`, data.user.role === 'admin' ? 'Panel de Administración habilitado.' : 'Tu sesión de compras está activa.');
      setAuthModalOpen(false);

      if (data.user.role === 'admin') {
        setUserExperience('admin');
      } else {
        setUserExperience('shop');
      }

      refreshAllData();
      return true;
    } catch (e: any) {
      addToast('error', 'Error de conexión', e.message);
      return false;
    }
  };

  // Register
  const register = async (formData: {
    nombre: string;
    apellido: string;
    nombreVisible: string;
    email: string;
    password: string;
  }): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) {
        addToast('error', 'Error en el registro', data.error);
        return false;
      }

      setToken(data.token);
      setCurrentUser(data.user);
      localStorage.setItem('kiosco_token', data.token);
      localStorage.setItem('kiosco_user', JSON.stringify(data.user));

      addToast('success', `¡Cuenta creada exitosamente!`, `Bienvenido/a al Kiosco Escolar, ${data.user.nombreVisible}.`);
      setAuthModalOpen(false);
      setUserExperience('shop');

      refreshAllData();
      return true;
    } catch (e: any) {
      addToast('error', 'Error de conexión', e.message);
      return false;
    }
  };

  const logout = () => {
    setToken(null);
    setCurrentUser(null);
    localStorage.removeItem('kiosco_token');
    localStorage.removeItem('kiosco_user');
    setUserExperience('shop');
    setActiveShopTab('catalog');
    addToast('info', 'Sesión cerrada', 'Has salido de tu cuenta de forma segura.');
  };

  // Cart operations with live stock checks
  const addToCart = (product: Product, quantity = 1) => {
    if (product.estado === 'desactivado' || product.estado === 'agotado' || product.stock <= 0) {
      addToast('warning', 'Producto no disponible', `${product.nombre} se encuentra agotado.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      const currentQty = existing ? existing.quantity : 0;
      const targetQty = currentQty + quantity;

      if (targetQty > product.stock) {
        addToast(
          'warning',
          'Stock insuficiente',
          `No podés agregar más de ${product.stock} unidades de ${product.nombre}.`
        );
        return prev;
      }

      playChime('success');
      addToast('success', 'Agregado al carrito', `${quantity}x ${product.nombre}`);

      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: targetQty } : item
        );
      } else {
        return [...prev, { product, quantity }];
      }
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const prod = products.find((p) => p.id === productId);
    if (prod && quantity > prod.stock) {
      addToast(
        'warning',
        'Stock límite alcanzado',
        `Solo quedan ${prod.stock} unidades disponibles de ${prod.nombre}.`
      );
      return;
    }

    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Toggle favorite
  const toggleFavorite = async (productId: string) => {
    if (!currentUser) {
      setAuthModalOpen(true);
      addToast('info', 'Iniciá sesión', 'Iniciá sesión para guardar tus productos favoritos.');
      return;
    }

    try {
      const res = await fetch('/api/auth/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId }),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedFavs = data.favorites;
        const updatedUser = { ...currentUser, favorites: updatedFavs };
        setCurrentUser(updatedUser);
        localStorage.setItem('kiosco_user', JSON.stringify(updatedUser));

        const isFav = updatedFavs.includes(productId);
        addToast(
          isFav ? 'success' : 'info',
          isFav ? '❤️ Agregado a favoritos' : 'Eliminado de favoritos'
        );
      }
    } catch (e) {
      console.error('Error toggling favorite', e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        token,
        theme,
        toggleTheme,
        userExperience,
        setUserExperience,
        activeAdminTab,
        setActiveAdminTab,
        activeShopTab,
        setActiveShopTab,
        products,
        categories,
        suppliers,
        orders,
        settings,
        cart,
        cartOpen,
        setCartOpen,
        checkoutOpen,
        setCheckoutOpen,
        authModalOpen,
        setAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        activeVoucherOrder,
        setActiveVoucherOrder,
        lastOrderPlaced,
        setLastOrderPlaced,
        pendingOrdersCount,
        toasts,
        addToast,
        removeToast,
        login,
        register,
        logout,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        toggleFavorite,
        refreshAllData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
