export type UserRole = 'admin' | 'cliente';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  nombre: string;
  apellido: string;
  nombreVisible: string;
  isBlocked: boolean;
  bloqueado?: boolean;
  createdAt: string;
  totalSpent: number;
  orderCount: number;
  favorites: string[];
}

export interface Category {
  id: string;
  nombre: string;
  icono: string;
  activa: boolean;
  orden: number;
}

export type ProductStatus = 'disponible' | 'stock_bajo' | 'agotado' | 'desactivado' | 'activo';

export interface Product {
  id: string;
  nombre: string;
  marca: string;
  categoriaId: string;
  descripcion: string;
  imagen: string;
  precioCompra: number; // Costo
  precioCosto?: number;  // Alias opcional
  precioVenta: number; // Venta al público
  stock: number;
  stockMinimo: number;
  sku: string;
  estado: ProductStatus;
  destacado: boolean;
  enPromocion: boolean;
  precioPromocional?: number;
  fechaVencimiento?: string;
  proveedorId?: string;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'entrada' | 'salida' | 'ajuste';

export interface StockMovement {
  id: string;
  productoId: string;
  productoNombre: string;
  tipo: MovementType;
  cantidad: number;
  stockPrevio: number;
  stockPosterior: number;
  stockAnterior?: number;
  stockNuevo?: number;
  motivo: string;
  usuarioId: string;
  usuarioNombre: string;
  fecha: string;
}

export type OrderStatus = 'pendiente' | 'preparando' | 'listo' | 'entregado' | 'cancelado';
export type PaymentMethod = 'efectivo' | 'mercadopago' | 'transferencia';
export type PaymentStatus = 'pendiente' | 'confirmado' | 'rechazado';
export type DeliveryType = 'inmediato' | 'recreo';

export interface OrderItem {
  productoId: string;
  productoNombre: string;
  marca: string;
  cantidad: number;
  precioUnitario: number;
  costoUnitario: number;
  subtotal: number;
  imagen: string;
}

export interface Order {
  id: string;
  numeroPedido: number;
  clienteId: string;
  clienteNombre: string;
  clienteVisible: string;
  clienteEmail: string;
  items: OrderItem[];
  total: number;
  costoTotal: number;
  gananciaEstimada: number;
  metodoPago: PaymentMethod;
  estadoPago: PaymentStatus;
  modalidadRetiro: DeliveryType;
  recreoHora?: string;
  estado: OrderStatus;
  fecha: string;
  comprobanteId: string;
  notas?: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  contacto: string;
  rubro?: string;
  diasEntrega?: string;
  productosAsociados: string[];
  totalComprado: number;
  ultimaCompra: string | null;
}

export interface PurchaseItem {
  productoId: string;
  productoNombre: string;
  cantidad: number;
  costoUnitario?: number;
  precioCosto?: number;
  subtotal: number;
}

export interface SupplierPurchase {
  id: string;
  proveedorId: string;
  proveedorNombre: string;
  items: PurchaseItem[];
  total: number;
  fecha: string;
  notas?: string;
}

export type PurchaseOrder = SupplierPurchase;

export interface ActivityLog {
  id: string;
  usuarioId: string;
  usuarioNombre: string;
  accion: string;
  elementoAfectado?: string;
  detalle: string;
  fecha: string;
}

export type AuditLog = ActivityLog;

export interface KioskSettings {
  nombreKiosco: string;
  logoUrl: string;
  aliasMp: string;
  cbuMp: string;
  qrImageUrl: string;
  telefonoContacto: string;
  horarioAtencion: string;
  permitirPedidosRecreo: boolean;
  notificacionesSonido: boolean;
  recreosDisponibles: string[];
}

export interface FinanceStats {
  ventasHoy: number;
  gananciasHoy: number;
  ventasMes: number;
  gananciasMes: number;
  costosMes: number;
  costoMercaderiaMes?: number;
  dineroDisponible: number;
  efectivoTotal?: number;
  mercadopagoTotal?: number;
  gastosMes?: number;
  gastosRecientes?: {
    id: string;
    concepto: string;
    monto: number;
    categoria: string;
    fecha: string;
  }[];
  pedidosPendientes: number;
  pedidosTotales: number;
  productosBajoStock: number;
  productoMasVendido: {
    nombre: string;
    cantidad: number;
    total: number;
  } | null;
  ventasPorDia: { fecha: string; total: number; ganancia: number }[];
  metodosPagoDistribucion: { metodo: string; cantidad: number; total: number }[];
  rankingProductos: { id: string; nombre: string; cantidad: number; total: number; ganancia: number }[];
  horariosVentas: { hora: string; cantidad: number }[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
