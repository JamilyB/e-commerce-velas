export type AdminRole = 'owner' | 'admin' | 'manager' | 'staff';

export type AdminPermission =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'orders'
  | 'deliveries'
  | 'returns'
  | 'coupons'
  | 'reviews'
  | 'customers'
  | 'admins'
  | 'settings';

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  password: string;
  role: AdminRole;
  avatar_initials: string;
  is_active: boolean;
  last_login_at: string | null;
  permissions: AdminPermission[];
  created_at: string;
  updated_at: string;
}

export interface AdminProduct {
  id: string;
  name: string;
  subtitle: string | null;
  price: number;
  compare_at_price: number | null;
  image: string | null;
  collection: string | null;
  aroma: string | null;
  familia_olfativa: string | null;
  size: string | null;
  weight: string | null;
  dimensions: string | null;
  burn_time: string | null;
  color: string | null;
  recipiente: string | null;
  cera: string | null;
  description: string | null;
  details: string | null;
  notes_top: string | null;
  notes_heart: string | null;
  notes_base: string | null;
  sku: string | null;
  stock: number;
  low_stock_threshold: number;
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  reviews_count: number;
  category_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface AdminCustomer {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  avatar_initials: string | null;
  status: 'active' | 'blocked' | 'inactive';
  total_orders: number;
  total_spent: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminOrder {
  id: string;
  order_number: string;
  customer_id: string | null;
  customer_name: string;
  customer_email: string;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
  payment_method: string | null;
  subtotal: number;
  shipping_cost: number;
  discount: number;
  total: number;
  shipping_address: Record<string, string> | null;
  coupon_code: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminOrderItem {
  id: string;
  order_id: string;
  product_name: string;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  volume: string | null;
  created_at: string;
}

export interface AdminDelivery {
  id: string;
  order_id: string;
  tracking_code: string | null;
  carrier: string | null;
  status: 'pending' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'failed';
  shipping_method: string | null;
  estimated_delivery: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminReturn {
  id: string;
  return_code: string;
  order_id: string | null;
  order_number: string | null;
  customer_name: string;
  customer_email: string;
  reason: string | null;
  refund_method: string | null;
  refund_amount: number;
  status: 'requested' | 'approved' | 'rejected' | 'processing' | 'completed' | 'cancelled';
  items: Array<{ productName: string; quantity: number; reason: string }> | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminCoupon {
  id: string;
  code: string;
  description: string | null;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_order_value: number;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminReview {
  id: string;
  product_id: string | null;
  product_name: string | null;
  customer_name: string;
  customer_email: string | null;
  rating: number;
  title: string | null;
  body: string | null;
  status: 'pending' | 'approved' | 'rejected';
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdminSetting {
  id: string;
  key: string;
  value: unknown;
  category: string;
  updated_at: string;
}

export interface AdminActivityLog {
  id: string;
  admin_id: string | null;
  admin_name: string | null;
  action: string;
  entity: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

export type AdminPage =
  | 'dashboard'
  | 'products'
  | 'categories'
  | 'inventory'
  | 'orders'
  | 'deliveries'
  | 'returns'
  | 'coupons'
  | 'reviews'
  | 'customers'
  | 'admins'
  | 'settings';

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  productsChange: number;
  recentOrders: AdminOrder[];
  lowStockProducts: AdminProduct[];
  topProducts: Array<{ name: string; sales: number; revenue: number }>;
  salesByDay: Array<{ date: string; revenue: number }>;
  ordersByStatus: Array<{ status: string; count: number }>;
}
