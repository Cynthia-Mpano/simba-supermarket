-- ============================================================
-- Simba Supermarket — Database Schema
-- Run: psql $DATABASE_URL -f schema.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- enables fast ILIKE search

-- ── Categories ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  slug          TEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Products ─────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              INTEGER PRIMARY KEY,
  name            TEXT NOT NULL,
  price           NUMERIC(12,2) NOT NULL,
  category        TEXT NOT NULL,
  subcategory_id  INTEGER NOT NULL,
  in_stock        BOOLEAN NOT NULL DEFAULT TRUE,
  image           TEXT,
  unit            TEXT DEFAULT 'Pcs',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock    ON products(in_stock);
CREATE INDEX IF NOT EXISTS idx_products_name_trgm   ON products USING GIN (name gin_trgm_ops);

-- ── Customers ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS customers (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name   TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(phone)
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- ── Admin Users ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'staff',  -- 'admin' | 'staff'
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Orders ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id              TEXT PRIMARY KEY,          -- e.g. SIM-A1B2C3
  customer_id     UUID REFERENCES customers(id),
  full_name       TEXT NOT NULL,
  phone           TEXT NOT NULL,
  email           TEXT,
  address         TEXT NOT NULL,
  city            TEXT NOT NULL DEFAULT 'Kigali',
  district        TEXT NOT NULL,
  payment_method  TEXT NOT NULL CHECK (payment_method IN ('momo','airtel','cash')),
  payment_status  TEXT NOT NULL DEFAULT 'pending'
                  CHECK (payment_status IN ('pending','paid','failed','refunded')),
  order_status    TEXT NOT NULL DEFAULT 'pending'
                  CHECK (order_status IN ('pending','confirmed','processing','out_for_delivery','delivered','cancelled')),
  subtotal        NUMERIC(12,2) NOT NULL,
  delivery_fee    NUMERIC(12,2) NOT NULL DEFAULT 0,
  total           NUMERIC(12,2) NOT NULL,
  momo_reference  TEXT,                      -- MTN MoMo transaction reference
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_phone        ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_status       ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at   ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id  ON orders(customer_id);

-- ── Order Items ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id          SERIAL PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id  INTEGER NOT NULL REFERENCES products(id),
  product_name TEXT NOT NULL,   -- snapshot at time of order
  unit_price  NUMERIC(12,2) NOT NULL,
  quantity    INTEGER NOT NULL CHECK (quantity > 0),
  line_total  NUMERIC(12,2) GENERATED ALWAYS AS (unit_price * quantity) STORED
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- ── MoMo Payment Logs ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS momo_transactions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id        TEXT NOT NULL REFERENCES orders(id),
  external_id     TEXT NOT NULL,             -- our reference sent to MTN
  financial_txn   TEXT,                      -- MTN's financialTransactionId
  status          TEXT NOT NULL DEFAULT 'PENDING',
  amount          NUMERIC(12,2) NOT NULL,
  currency        TEXT DEFAULT 'RWF',
  payer_msisdn    TEXT NOT NULL,             -- customer phone
  raw_response    JSONB,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Order Status History (audit trail) ──────────────────────────────
CREATE TABLE IF NOT EXISTS order_status_history (
  id          SERIAL PRIMARY KEY,
  order_id    TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  old_status  TEXT,
  new_status  TEXT NOT NULL,
  changed_by  TEXT,   -- admin email or 'system'
  note        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ── Auto-update updated_at ────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_momo_updated_at
  BEFORE UPDATE ON momo_transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
