-- Cascadja Cafe - Business Analytics Capstone
-- PostgreSQL schema (Neon)
-- Run with: npm run db:setup   (or paste into the Neon SQL Editor)

DROP TABLE IF EXISTS sales CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS marketing_campaigns CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Variable 1: CUSTOMERS -------------------------------------------------
CREATE TABLE customers (
  id              SERIAL PRIMARY KEY,
  first_name      VARCHAR(80)  NOT NULL,
  last_name       VARCHAR(80)  NOT NULL,
  email           VARCHAR(160) UNIQUE NOT NULL,
  city            VARCHAR(80)  NOT NULL,
  segment         VARCHAR(40)  NOT NULL,
  joined_at       DATE         NOT NULL,
  loyalty_points  INTEGER      NOT NULL DEFAULT 0
);

-- Variable 2: PRODUCTS --------------------------------------------------
CREATE TABLE products (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(120) NOT NULL,
  category    VARCHAR(40)  NOT NULL,   -- Coffee | Food | Pastry | Beverage | Room
  unit_price  NUMERIC(10,2) NOT NULL,
  unit_cost   NUMERIC(10,2) NOT NULL,
  is_room     BOOLEAN NOT NULL DEFAULT FALSE
);

-- Variable 3: MARKETING -------------------------------------------------
CREATE TABLE marketing_campaigns (
  id                 SERIAL PRIMARY KEY,
  campaign_name      VARCHAR(140) NOT NULL,
  channel            VARCHAR(60)  NOT NULL,
  start_date         DATE         NOT NULL,
  end_date           DATE         NOT NULL,
  spend              NUMERIC(12,2) NOT NULL,
  impressions        INTEGER      NOT NULL,
  clicks             INTEGER      NOT NULL,
  conversions        INTEGER      NOT NULL,
  revenue_attributed NUMERIC(12,2) NOT NULL
);

-- Variable 4: TRANSACTIONS ----------------------------------------------
CREATE TABLE transactions (
  id              SERIAL PRIMARY KEY,
  customer_id     INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  txn_date        DATE         NOT NULL,
  channel         VARCHAR(30)  NOT NULL,   -- Dine-in | Takeout | Delivery | Room Stay
  payment_method  VARCHAR(30)  NOT NULL,
  status          VARCHAR(20)  NOT NULL DEFAULT 'Completed',
  total_amount    NUMERIC(12,2) NOT NULL
);

-- Variable 5: SALES (line items) ----------------------------------------
CREATE TABLE sales (
  id             SERIAL PRIMARY KEY,
  transaction_id INTEGER NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  product_id     INTEGER NOT NULL REFERENCES products(id),
  sale_date      DATE NOT NULL,
  quantity       INTEGER NOT NULL,
  unit_price     NUMERIC(10,2) NOT NULL,
  line_total     NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_transactions_date    ON transactions (txn_date);
CREATE INDEX idx_transactions_channel ON transactions (channel);
CREATE INDEX idx_sales_transaction    ON sales (transaction_id);
CREATE INDEX idx_sales_product        ON sales (product_id);
CREATE INDEX idx_marketing_channel    ON marketing_campaigns (channel);
