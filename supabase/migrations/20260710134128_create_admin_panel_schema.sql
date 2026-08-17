/*
# Admin Panel Schema for Atelier SURU

## Overview
Creates the complete database schema for the professional admin panel of the SURU e-commerce candle store.
This is separate from the customer-facing area (which uses in-memory state). The admin panel manages
products, categories, inventory, orders, deliveries, returns, coupons, reviews, customers, admins (RBAC),
and store settings.

## New Tables
1. `admin_products` — Extended product catalog with inventory fields (stock, active status, SKU).
2. `admin_categories` — Product categories/collections management.
3. `admin_orders` — Customer orders with status tracking.
4. `admin_order_items` — Line items belonging to an order.
5. `admin_customers` — Registered customer profiles.
6. `admin_deliveries` — Shipping/delivery tracking with carrier info.
7. `admin_returns` — Return and refund requests.
8. `admin_coupons` — Discount coupon management.
9. `admin_reviews` — Product reviews moderation.
10. `admin_admins` — Admin users with role-based access control (owner/admin/manager/staff).
11. `admin_settings` — Store configuration key-value store.
12. `admin_activity_log` — Audit trail of admin actions.

## Security
- RLS enabled on all tables.
- Policies allow `anon, authenticated` CRUD since this is a single-tenant admin panel without
  Supabase Auth sign-in (the admin panel uses its own internal auth via the admin_admins table).
  The customer-facing app does not interact with these tables.

## Notes
- All tables use `gen_random_uuid()` for primary keys.
- Timestamps default to `now()`.
- Idempotent statements via `IF NOT EXISTS`.
*/

-- ============================================================
-- 1. ADMIN CATEGORIES
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  image text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_categories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_categories_sel" ON admin_categories;
CREATE POLICY "anon_crud_categories_sel" ON admin_categories FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_categories_ins" ON admin_categories;
CREATE POLICY "anon_crud_categories_ins" ON admin_categories FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_categories_upd" ON admin_categories;
CREATE POLICY "anon_crud_categories_upd" ON admin_categories FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_categories_del" ON admin_categories;
CREATE POLICY "anon_crud_categories_del" ON admin_categories FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 2. ADMIN PRODUCTS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  subtitle text,
  price numeric(10,2) NOT NULL DEFAULT 0,
  compare_at_price numeric(10,2),
  image text,
  collection text,
  aroma text,
  familia_olfativa text,
  size text,
  weight text,
  dimensions text,
  burn_time text,
  color text,
  recipiente text,
  cera text,
  description text,
  details text,
  notes_top text,
  notes_heart text,
  notes_base text,
  sku text UNIQUE,
  stock int NOT NULL DEFAULT 0,
  low_stock_threshold int NOT NULL DEFAULT 5,
  is_active boolean NOT NULL DEFAULT true,
  is_featured boolean NOT NULL DEFAULT false,
  rating numeric(2,1) NOT NULL DEFAULT 0,
  reviews_count int NOT NULL DEFAULT 0,
  category_id uuid REFERENCES admin_categories(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_products_sel" ON admin_products;
CREATE POLICY "anon_crud_products_sel" ON admin_products FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_products_ins" ON admin_products;
CREATE POLICY "anon_crud_products_ins" ON admin_products FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_products_upd" ON admin_products;
CREATE POLICY "anon_crud_products_upd" ON admin_products FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_products_del" ON admin_products;
CREATE POLICY "anon_crud_products_del" ON admin_products FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 3. ADMIN CUSTOMERS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text,
  cpf text,
  avatar_initials text,
  status text NOT NULL DEFAULT 'active', -- active | blocked | inactive
  total_orders int NOT NULL DEFAULT 0,
  total_spent numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_customers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_customers_sel" ON admin_customers;
CREATE POLICY "anon_crud_customers_sel" ON admin_customers FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_customers_ins" ON admin_customers;
CREATE POLICY "anon_crud_customers_ins" ON admin_customers FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_customers_upd" ON admin_customers;
CREATE POLICY "anon_crud_customers_upd" ON admin_customers FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_customers_del" ON admin_customers;
CREATE POLICY "anon_crud_customers_del" ON admin_customers FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 4. ADMIN ORDERS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number text UNIQUE NOT NULL,
  customer_id uuid REFERENCES admin_customers(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  status text NOT NULL DEFAULT 'pending', -- pending | confirmed | processing | shipped | delivered | cancelled
  payment_status text NOT NULL DEFAULT 'pending', -- pending | paid | refunded | failed
  payment_method text, -- pix | card | boleto
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  shipping_cost numeric(12,2) NOT NULL DEFAULT 0,
  discount numeric(12,2) NOT NULL DEFAULT 0,
  total numeric(12,2) NOT NULL DEFAULT 0,
  shipping_address jsonb,
  coupon_code text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_orders_sel" ON admin_orders;
CREATE POLICY "anon_crud_orders_sel" ON admin_orders FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_orders_ins" ON admin_orders;
CREATE POLICY "anon_crud_orders_ins" ON admin_orders FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_orders_upd" ON admin_orders;
CREATE POLICY "anon_crud_orders_upd" ON admin_orders FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_orders_del" ON admin_orders;
CREATE POLICY "anon_crud_orders_del" ON admin_orders FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 5. ADMIN ORDER ITEMS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES admin_orders(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  product_image text,
  quantity int NOT NULL DEFAULT 1,
  unit_price numeric(10,2) NOT NULL DEFAULT 0,
  volume text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_order_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_order_items_sel" ON admin_order_items;
CREATE POLICY "anon_crud_order_items_sel" ON admin_order_items FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_order_items_ins" ON admin_order_items;
CREATE POLICY "anon_crud_order_items_ins" ON admin_order_items FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_order_items_upd" ON admin_order_items;
CREATE POLICY "anon_crud_order_items_upd" ON admin_order_items FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_order_items_del" ON admin_order_items;
CREATE POLICY "anon_crud_order_items_del" ON admin_order_items FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 6. ADMIN DELIVERIES
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES admin_orders(id) ON DELETE CASCADE,
  tracking_code text,
  carrier text, -- Correios | Jadlog | Total Express | Loggi | Other
  status text NOT NULL DEFAULT 'pending', -- pending | in_transit | out_for_delivery | delivered | returned | failed
  shipping_method text, -- standard | express
  estimated_delivery date,
  shipped_at timestamptz,
  delivered_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_deliveries_sel" ON admin_deliveries;
CREATE POLICY "anon_crud_deliveries_sel" ON admin_deliveries FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_deliveries_ins" ON admin_deliveries;
CREATE POLICY "anon_crud_deliveries_ins" ON admin_deliveries FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_deliveries_upd" ON admin_deliveries;
CREATE POLICY "anon_crud_deliveries_upd" ON admin_deliveries FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_deliveries_del" ON admin_deliveries;
CREATE POLICY "anon_crud_deliveries_del" ON admin_deliveries FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 7. ADMIN RETURNS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_returns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  return_code text UNIQUE NOT NULL,
  order_id uuid REFERENCES admin_orders(id) ON DELETE SET NULL,
  order_number text,
  customer_name text NOT NULL,
  customer_email text NOT NULL,
  reason text,
  refund_method text, -- pix | store_credit | original
  refund_amount numeric(12,2) NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'requested', -- requested | approved | rejected | processing | completed | cancelled
  items jsonb,
  admin_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_returns ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_returns_sel" ON admin_returns;
CREATE POLICY "anon_crud_returns_sel" ON admin_returns FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_returns_ins" ON admin_returns;
CREATE POLICY "anon_crud_returns_ins" ON admin_returns FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_returns_upd" ON admin_returns;
CREATE POLICY "anon_crud_returns_upd" ON admin_returns FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_returns_del" ON admin_returns;
CREATE POLICY "anon_crud_returns_del" ON admin_returns FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 8. ADMIN COUPONS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_coupons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  description text,
  discount_type text NOT NULL DEFAULT 'percentage', -- percentage | fixed
  discount_value numeric(10,2) NOT NULL DEFAULT 0,
  min_order_value numeric(10,2) NOT NULL DEFAULT 0,
  max_uses int,
  used_count int NOT NULL DEFAULT 0,
  starts_at timestamptz,
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_coupons_sel" ON admin_coupons;
CREATE POLICY "anon_crud_coupons_sel" ON admin_coupons FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_coupons_ins" ON admin_coupons;
CREATE POLICY "anon_crud_coupons_ins" ON admin_coupons FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_coupons_upd" ON admin_coupons;
CREATE POLICY "anon_crud_coupons_upd" ON admin_coupons FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_coupons_del" ON admin_coupons;
CREATE POLICY "anon_crud_coupons_del" ON admin_coupons FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 9. ADMIN REVIEWS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES admin_products(id) ON DELETE CASCADE,
  product_name text,
  customer_name text NOT NULL,
  customer_email text,
  rating int NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  title text,
  body text,
  status text NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  admin_response text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_reviews_sel" ON admin_reviews;
CREATE POLICY "anon_crud_reviews_sel" ON admin_reviews FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_reviews_ins" ON admin_reviews;
CREATE POLICY "anon_crud_reviews_ins" ON admin_reviews FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_reviews_upd" ON admin_reviews;
CREATE POLICY "anon_crud_reviews_upd" ON admin_reviews FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_reviews_del" ON admin_reviews;
CREATE POLICY "anon_crud_reviews_del" ON admin_reviews FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 10. ADMIN ADMINS (RBAC)
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_admins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  email text UNIQUE NOT NULL,
  password text NOT NULL,
  role text NOT NULL DEFAULT 'staff', -- owner | admin | manager | staff
  avatar_initials text,
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  permissions jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_admins ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_admins_sel" ON admin_admins;
CREATE POLICY "anon_crud_admins_sel" ON admin_admins FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_admins_ins" ON admin_admins;
CREATE POLICY "anon_crud_admins_ins" ON admin_admins FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_admins_upd" ON admin_admins;
CREATE POLICY "anon_crud_admins_upd" ON admin_admins FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_admins_del" ON admin_admins;
CREATE POLICY "anon_crud_admins_del" ON admin_admins FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 11. ADMIN SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  category text NOT NULL DEFAULT 'general', -- general | shipping | payment | tax | notification | appearance
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_settings_sel" ON admin_settings;
CREATE POLICY "anon_crud_settings_sel" ON admin_settings FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_settings_ins" ON admin_settings;
CREATE POLICY "anon_crud_settings_ins" ON admin_settings FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_settings_upd" ON admin_settings;
CREATE POLICY "anon_crud_settings_upd" ON admin_settings FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_settings_del" ON admin_settings;
CREATE POLICY "anon_crud_settings_del" ON admin_settings FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- 12. ADMIN ACTIVITY LOG
-- ============================================================
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid,
  admin_name text,
  action text NOT NULL,
  entity text,
  entity_id text,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_crud_log_sel" ON admin_activity_log;
CREATE POLICY "anon_crud_log_sel" ON admin_activity_log FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_crud_log_ins" ON admin_activity_log;
CREATE POLICY "anon_crud_log_ins" ON admin_activity_log FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_log_upd" ON admin_activity_log;
CREATE POLICY "anon_crud_log_upd" ON admin_activity_log FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_crud_log_del" ON admin_activity_log;
CREATE POLICY "anon_crud_log_del" ON admin_activity_log FOR DELETE TO anon, authenticated USING (true);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_admin_products_category ON admin_products(category_id);
CREATE INDEX IF NOT EXISTS idx_admin_products_active ON admin_products(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_orders_status ON admin_orders(status);
CREATE INDEX IF NOT EXISTS idx_admin_orders_customer ON admin_orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_admin_order_items_order ON admin_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_admin_deliveries_order ON admin_deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_admin_returns_order ON admin_returns(order_id);
CREATE INDEX IF NOT EXISTS idx_admin_reviews_product ON admin_reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_admin_reviews_status ON admin_reviews(status);
CREATE INDEX IF NOT EXISTS idx_admin_coupons_active ON admin_coupons(is_active);
CREATE INDEX IF NOT EXISTS idx_admin_customers_status ON admin_customers(status);
CREATE INDEX IF NOT EXISTS idx_admin_settings_key ON admin_settings(key);

-- ============================================================
-- SEED: DEFAULT ADMIN (owner)
-- ============================================================
INSERT INTO admin_admins (full_name, email, password, role, avatar_initials, is_active, permissions)
VALUES (
  'Administrador Principal',
  'admin@suruvelas.com.br',
  'admin123',
  'owner',
  'AP',
  true,
  '["dashboard","products","categories","inventory","orders","deliveries","returns","coupons","reviews","customers","admins","settings"]'::jsonb
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- SEED: DEFAULT SETTINGS
-- ============================================================
INSERT INTO admin_settings (key, value, category) VALUES
  ('store_name', '"Atelier SURU"', 'general'),
  ('store_email', '"contato@suruvelas.com.br"', 'general'),
  ('store_phone', '"(11) 4000-0000"', 'general'),
  ('store_cnpj', '"00.000.000/0001-00"', 'general'),
  ('store_address', '"{\"street\":\"Av. Paulista, 1000\",\"city\":\"São Paulo\",\"state\":\"SP\",\"cep\":\"01310-100\"}"', 'general'),
  ('free_shipping_threshold', '180', 'shipping'),
  ('standard_shipping_cost', '15', 'shipping'),
  ('express_shipping_cost', '25', 'shipping'),
  ('currency', '"BRL"', 'general'),
  ('tax_rate', '0', 'tax')
ON CONFLICT (key) DO NOTHING;
