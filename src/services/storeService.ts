import { supabase } from '../lib/supabase';
import type { Product } from '../types';
import { PRODUCTS } from '../data/products';

/**
 * Store service — single integration point between the storefront and the backend.
 *
 * All Supabase calls for the customer-facing store go through this file.
 * When you swap to a real REST/GraphQL API later, only this file changes;
 * every component keeps the same interfaces and stays unaffected.
 *
 * Every method falls back to local/static data on error so the storefront
 * never breaks, even if the database is unreachable.
 */

interface AdminProductRow {
  id: string;
  name: string;
  subtitle: string | null;
  price: number;
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
  reference_file: string | null;
  sku: string | null;
  stock: number;
  is_active: boolean;
  is_featured: boolean;
  rating: number;
  reviews_count: number;
}

function mapRowToProduct(row: AdminProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle ?? '',
    price: row.price,
    image: row.image ?? '',
    collection: (row.collection as Product['collection']) ?? 'relaxar',
    aroma: row.aroma ?? '',
    familiaOlfativa: (row.familia_olfativa as Product['familiaOlfativa']) ?? 'Floral',
    size: (row.size as Product['size']) ?? 'Médio',
    weight: row.weight ?? '',
    dimensions: row.dimensions ?? '',
    burnTime: row.burn_time ?? '',
    color: (row.color as Product['color']) ?? 'Branco',
    recipiente: (row.recipiente as Product['recipiente']) ?? 'Vidro',
    cera: (row.cera as Product['cera']) ?? 'Soja',
    description: row.description ?? '',
    referenceFile: row.reference_file ?? undefined,
    rating: row.rating ?? 0,
    reviewsCount: row.reviews_count ?? 0,
    notes: {
      top: row.notes_top ?? '',
      heart: row.notes_heart ?? '',
      base: row.notes_base ?? '',
    },
    details: row.details ?? '',
  };
}

export interface CheckoutItemData {
  productName: string;
  productImage: string;
  quantity: number;
  unitPrice: number;
  volume: string;
}

export interface CheckoutData {
  orderNumber: string;
  trackingCode: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCpf: string;
  items: CheckoutItemData[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: Record<string, string>;
  shippingMethod: string;
  couponCode: string | null;
}

export interface ReturnItemData {
  productName: string;
  quantity: number;
  reason: string;
}

export interface ReturnData {
  returnCode: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  reason: string;
  refundMethod: string;
  refundAmount: number;
  items: ReturnItemData[];
}

export interface HistoricOrderSync {
  id: string;
  date: string;
  tracking: string;
  items: Array<{ productName: string; quantity: number; price: number; image: string; volume: string }>;
  total: number;
  status: 'preparation' | 'despatched' | 'delivered';
  shippingMethod: 'Padrão' | 'Expresso';
}

export const storeService = {
  // ─── PRODUCTS ───────────────────────────────────────────────

  async getProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('admin_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) return PRODUCTS;
      return (data as unknown as AdminProductRow[]).map(mapRowToProduct);
    } catch {
      return PRODUCTS;
    }
  },

  // ─── ORDERS ──────────────────────────────────────────────────

  async saveOrder(data: CheckoutData): Promise<void> {
    try {
      // 1. Upsert customer
      const { data: existingCustomer } = await supabase
        .from('admin_customers')
        .select('id, total_orders, total_spent')
        .eq('email', data.customerEmail)
        .maybeSingle();

      let customerId: string | null = null;

      if (existingCustomer) {
        customerId = (existingCustomer as { id: string }).id;
        const prev = existingCustomer as { total_orders: number; total_spent: number };
        await supabase
          .from('admin_customers')
          .update({
            total_orders: prev.total_orders + 1,
            total_spent: prev.total_spent + data.total,
            updated_at: new Date().toISOString(),
          })
          .eq('id', customerId);
      } else {
        const { data: newCustomer } = await supabase
          .from('admin_customers')
          .insert({
            full_name: data.customerName,
            email: data.customerEmail,
            phone: data.customerPhone,
            cpf: data.customerCpf,
            avatar_initials: data.customerName.slice(0, 2).toUpperCase(),
            status: 'active',
            total_orders: 1,
            total_spent: data.total,
          })
          .select('id')
          .single();
        customerId = (newCustomer as { id: string })?.id ?? null;
      }

      // 2. Insert order
      const { data: orderRow, error: orderError } = await supabase
        .from('admin_orders')
        .insert({
          order_number: data.orderNumber,
          customer_id: customerId,
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          status: 'pending',
          payment_status: data.paymentStatus,
          payment_method: data.paymentMethod,
          subtotal: data.subtotal,
          shipping_cost: data.shippingCost,
          discount: data.discount,
          total: data.total,
          shipping_address: data.shippingAddress,
          coupon_code: data.couponCode,
        })
        .select('id')
        .single();

      if (orderError || !orderRow) return;
      const orderId = (orderRow as { id: string }).id;

      // 3. Insert order items
      const itemRows = data.items.map((item) => ({
        order_id: orderId,
        product_name: item.productName,
        product_image: item.productImage,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        volume: item.volume,
      }));
      await supabase.from('admin_order_items').insert(itemRows);

      // 4. Insert delivery record
      await supabase.from('admin_deliveries').insert({
        order_id: orderId,
        tracking_code: data.trackingCode,
        carrier: 'Correios',
        status: 'pending',
        shipping_method: data.shippingMethod,
        estimated_delivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      });
    } catch (e) {
      console.error('saveOrder failed (non-blocking):', e);
    }
  },

  async getHistoricOrders(customerEmail: string): Promise<HistoricOrderSync[] | null> {
    try {
      const { data: orders, error } = await supabase
        .from('admin_orders')
        .select('*')
        .eq('customer_email', customerEmail)
        .order('created_at', { ascending: false });

      if (error || !orders || orders.length === 0) return null;

      const result: HistoricOrderSync[] = [];

      for (const orderRaw of orders) {
        const order = orderRaw as {
          id: string;
          order_number: string;
          created_at: string;
          total: number;
          status: string;
          shipping_address: { method?: string } | null;
        };

        const { data: items } = await supabase
          .from('admin_order_items')
          .select('*')
          .eq('order_id', order.id);

        const { data: delivery } = await supabase
          .from('admin_deliveries')
          .select('tracking_code, shipping_method')
          .eq('order_id', order.id)
          .maybeSingle();

        const statusMap: Record<string, 'preparation' | 'despatched' | 'delivered'> = {
          pending: 'preparation',
          confirmed: 'preparation',
          processing: 'preparation',
          shipped: 'despatched',
          delivered: 'delivered',
          cancelled: 'preparation',
        };

        result.push({
          id: order.order_number,
          date: new Date(order.created_at).toLocaleDateString('pt-BR'),
          tracking: (delivery as { tracking_code?: string } | null)?.tracking_code ?? '',
          items: (items ?? []).map((i) => {
            const item = i as {
              product_name: string;
              quantity: number;
              unit_price: number;
              product_image: string | null;
              volume: string | null;
            };
            return {
              productName: item.product_name,
              quantity: item.quantity,
              price: item.unit_price,
              image: item.product_image ?? '',
              volume: item.volume ?? '',
            };
          }),
          total: order.total,
          status: statusMap[order.status] ?? 'preparation',
          shippingMethod:
            (delivery as { shipping_method?: string } | null)?.shipping_method === 'express'
              ? 'Expresso'
              : 'Padrão',
        });
      }

      return result;
    } catch {
      return null;
    }
  },

  // ─── RETURNS ────────────────────────────────────────────────

  async saveReturn(data: ReturnData): Promise<void> {
    try {
      // Try to find the matching order
      const { data: orderRow } = await supabase
        .from('admin_orders')
        .select('id')
        .eq('order_number', data.orderNumber)
        .maybeSingle();

      await supabase.from('admin_returns').insert({
        return_code: data.returnCode,
        order_id: (orderRow as { id: string } | null)?.id ?? null,
        order_number: data.orderNumber,
        customer_name: data.customerName,
        customer_email: data.customerEmail,
        reason: data.reason,
        refund_method: data.refundMethod,
        refund_amount: data.refundAmount,
        status: 'requested',
        items: data.items,
      });
    } catch (e) {
      console.error('saveReturn failed (non-blocking):', e);
    }
  },
};
