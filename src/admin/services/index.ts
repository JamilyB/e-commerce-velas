import { supabase } from '../../lib/supabase';
import type {
  AdminProduct,
  AdminCategory,
  AdminCustomer,
  AdminOrder,
  AdminOrderItem,
  AdminDelivery,
  AdminReturn,
  AdminCoupon,
  AdminReview,
  AdminSetting,
  AdminUser,
  AdminActivityLog,
  DashboardStats,
} from '../types';

// ============================================================
// PRODUCTS
// ============================================================
export const productsService = {
  async list(): Promise<AdminProduct[]> {
    const { data, error } = await supabase
      .from('admin_products')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as unknown as AdminProduct[];
  },

  async create(product: Partial<AdminProduct>): Promise<AdminProduct> {
    const { data, error } = await supabase
      .from('admin_products')
      .insert(product)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as AdminProduct;
  },

  async update(id: string, updates: Partial<AdminProduct>): Promise<AdminProduct> {
    const { data, error } = await supabase
      .from('admin_products')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as AdminProduct;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('admin_products').delete().eq('id', id);
    if (error) throw error;
  },

  async toggleActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from('admin_products')
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async updateStock(id: string, stock: number): Promise<void> {
    const { error } = await supabase
      .from('admin_products')
      .update({ stock, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// CATEGORIES
// ============================================================
export const categoriesService = {
  async list(): Promise<AdminCategory[]> {
    const { data, error } = await supabase
      .from('admin_categories')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return data as unknown as AdminCategory[];
  },

  async create(cat: Partial<AdminCategory>): Promise<AdminCategory> {
    const { data, error } = await supabase
      .from('admin_categories')
      .insert(cat)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as AdminCategory;
  },

  async update(id: string, updates: Partial<AdminCategory>): Promise<void> {
    const { error } = await supabase
      .from('admin_categories')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('admin_categories').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// CUSTOMERS
// ============================================================
export const customersService = {
  async list(): Promise<AdminCustomer[]> {
    const { data, error } = await supabase
      .from('admin_customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as unknown as AdminCustomer[];
  },

  async update(id: string, updates: Partial<AdminCustomer>): Promise<void> {
    const { error } = await supabase
      .from('admin_customers')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async setStatus(id: string, status: 'active' | 'blocked' | 'inactive'): Promise<void> {
    const { error } = await supabase
      .from('admin_customers')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('admin_customers').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// ORDERS
// ============================================================
export const ordersService = {
  async list(): Promise<AdminOrder[]> {
    const { data, error } = await supabase
      .from('admin_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as unknown as AdminOrder[];
  },

  async getItems(orderId: string): Promise<AdminOrderItem[]> {
    const { data, error } = await supabase
      .from('admin_order_items')
      .select('*')
      .eq('order_id', orderId);
    if (error) throw error;
    return data as unknown as AdminOrderItem[];
  },

  async update(id: string, updates: Partial<AdminOrder>): Promise<void> {
    const { error } = await supabase
      .from('admin_orders')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// DELIVERIES
// ============================================================
export const deliveriesService = {
  async list(): Promise<AdminDelivery[]> {
    const { data, error } = await supabase
      .from('admin_deliveries')
      .select('*, admin_orders(order_number, customer_name)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as unknown as AdminDelivery[];
  },

  async update(id: string, updates: Partial<AdminDelivery>): Promise<void> {
    const { error } = await supabase
      .from('admin_deliveries')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// RETURNS
// ============================================================
export const returnsService = {
  async list(): Promise<AdminReturn[]> {
    const { data, error } = await supabase
      .from('admin_returns')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as unknown as AdminReturn[];
  },

  async update(id: string, updates: Partial<AdminReturn>): Promise<void> {
    const { error } = await supabase
      .from('admin_returns')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// COUPONS
// ============================================================
export const couponsService = {
  async list(): Promise<AdminCoupon[]> {
    const { data, error } = await supabase
      .from('admin_coupons')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as unknown as AdminCoupon[];
  },

  async create(coupon: Partial<AdminCoupon>): Promise<AdminCoupon> {
    const { data, error } = await supabase
      .from('admin_coupons')
      .insert(coupon)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as AdminCoupon;
  },

  async update(id: string, updates: Partial<AdminCoupon>): Promise<void> {
    const { error } = await supabase
      .from('admin_coupons')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('admin_coupons').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// REVIEWS
// ============================================================
export const reviewsService = {
  async list(): Promise<AdminReview[]> {
    const { data, error } = await supabase
      .from('admin_reviews')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as unknown as AdminReview[];
  },

  async update(id: string, updates: Partial<AdminReview>): Promise<void> {
    const { error } = await supabase
      .from('admin_reviews')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('admin_reviews').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// ADMINS
// ============================================================
export const adminsService = {
  async list(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('admin_admins')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as unknown as AdminUser[];
  },

  async create(admin: Partial<AdminUser>): Promise<AdminUser> {
    const { data, error } = await supabase
      .from('admin_admins')
      .insert(admin)
      .select()
      .single();
    if (error) throw error;
    return data as unknown as AdminUser;
  },

  async update(id: string, updates: Partial<AdminUser>): Promise<void> {
    const { error } = await supabase
      .from('admin_admins')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
  },

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from('admin_admins').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============================================================
// SETTINGS
// ============================================================
export const settingsService = {
  async list(): Promise<AdminSetting[]> {
    const { data, error } = await supabase.from('admin_settings').select('*');
    if (error) throw error;
    return data as unknown as AdminSetting[];
  },

  async upsert(key: string, value: unknown, category: string): Promise<void> {
    const { error } = await supabase
      .from('admin_settings')
      .upsert({ key, value, category, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (error) throw error;
  },
};

// ============================================================
// ACTIVITY LOG
// ============================================================
export const activityLogService = {
  async log(admin: AdminUser | null, action: string, entity?: string, entity_id?: string, details?: Record<string, unknown>): Promise<void> {
    const { error } = await supabase.from('admin_activity_log').insert({
      admin_id: admin?.id ?? null,
      admin_name: admin?.full_name ?? 'System',
      action,
      entity: entity ?? null,
      entity_id: entity_id ?? null,
      details: details ?? null,
    });
    if (error) console.error('Failed to log activity:', error);
  },

  async list(limit = 20): Promise<AdminActivityLog[]> {
    const { data, error } = await supabase
      .from('admin_activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data as unknown as AdminActivityLog[];
  },
};

// ============================================================
// DASHBOARD STATS
// ============================================================
export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const [orders, customers, products] = await Promise.all([
      ordersService.list(),
      customersService.list(),
      productsService.list(),
    ]);

    const totalRevenue = orders
      .filter((o) => o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.total, 0);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const recentRevenue = orders
      .filter((o) => new Date(o.created_at) >= thirtyDaysAgo && o.payment_status === 'paid')
      .reduce((sum, o) => sum + o.total, 0);

    const prevRevenue = orders
      .filter((o) => {
        const d = new Date(o.created_at);
        return d >= sixtyDaysAgo && d < thirtyDaysAgo && o.payment_status === 'paid';
      })
      .reduce((sum, o) => sum + o.total, 0);

    const revenueChange = prevRevenue > 0 ? ((recentRevenue - prevRevenue) / prevRevenue) * 100 : 0;

    const recentOrdersCount = orders.filter((o) => new Date(o.created_at) >= thirtyDaysAgo).length;
    const prevOrdersCount = orders.filter((o) => {
      const d = new Date(o.created_at);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    }).length;
    const ordersChange = prevOrdersCount > 0 ? ((recentOrdersCount - prevOrdersCount) / prevOrdersCount) * 100 : 0;

    const recentCustomers = customers.filter((c) => new Date(c.created_at) >= thirtyDaysAgo).length;
    const prevCustomers = customers.filter((c) => {
      const d = new Date(c.created_at);
      return d >= sixtyDaysAgo && d < thirtyDaysAgo;
    }).length;
    const customersChange = prevCustomers > 0 ? ((recentCustomers - prevCustomers) / prevCustomers) * 100 : 0;

    const lowStockProducts = products.filter((p) => p.stock <= p.low_stock_threshold && p.is_active);

    const salesByDay: Array<{ date: string; revenue: number }> = [];
    for (let i = 6; i >= 0; i--) {
      const day = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStr = day.toISOString().slice(0, 10);
      const dayRevenue = orders
        .filter((o) => o.created_at.slice(0, 10) === dayStr && o.payment_status === 'paid')
        .reduce((sum, o) => sum + o.total, 0);
      salesByDay.push({ date: dayStr, revenue: dayRevenue });
    }

    const statusCounts: Record<string, number> = {};
    orders.forEach((o) => {
      statusCounts[o.status] = (statusCounts[o.status] ?? 0) + 1;
    });
    const ordersByStatus = Object.entries(statusCounts).map(([status, count]) => ({ status, count }));

    const productSales: Record<string, { name: string; sales: number; revenue: number }> = {};
    for (const o of orders) {
      if (o.payment_status !== 'paid') continue;
      const items = await ordersService.getItems(o.id);
      items.forEach((item) => {
        if (!productSales[item.product_name]) {
          productSales[item.product_name] = { name: item.product_name, sales: 0, revenue: 0 };
        }
        productSales[item.product_name].sales += item.quantity;
        productSales[item.product_name].revenue += item.quantity * item.unit_price;
      });
    }
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders: orders.length,
      totalCustomers: customers.length,
      totalProducts: products.length,
      revenueChange,
      ordersChange,
      customersChange,
      productsChange: 0,
      recentOrders: orders.slice(0, 5),
      lowStockProducts,
      topProducts,
      salesByDay,
      ordersByStatus,
    };
  },
};
