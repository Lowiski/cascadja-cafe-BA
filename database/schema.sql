-- Cascadja Foods and Drinks - active database schema.
-- Real business: Kasadya Park & Play, Calan Road, Cordova, Cebu.
-- The old cafe-and-inn schema is preserved as database/schema-legacy.sql.

DROP TABLE IF EXISTS sales_fact CASCADE;
DROP TABLE IF EXISTS addons CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;

CREATE TABLE menu_items (
  id           SERIAL PRIMARY KEY,
  name         TEXT NOT NULL UNIQUE,
  category     TEXT NOT NULL,
  hot_price    NUMERIC(10,2) NOT NULL,
  iced_price   NUMERIC(10,2),
  bestseller   BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE addons (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL UNIQUE,
  price       NUMERIC(10,2) NOT NULL,
  bestseller  BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE sales_fact (
  id                BIGSERIAL PRIMARY KEY,
  order_id          INTEGER NOT NULL,
  order_date        DATE NOT NULL,
  daypart           TEXT NOT NULL CHECK (daypart IN ('Morning','Lunch','Afternoon','Evening','Late Night')),
  channel           TEXT NOT NULL CHECK (channel IN ('Dine-in','Foodpanda')),
  product_category  TEXT NOT NULL,
  item_name         TEXT NOT NULL,
  item_price        NUMERIC(10,2) NOT NULL,
  quantity_sold     INTEGER NOT NULL CHECK (quantity_sold > 0),
  addon_name        TEXT,
  addon_amount      NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_sales       NUMERIC(10,2) NOT NULL
);

CREATE INDEX idx_sales_fact_order_date ON sales_fact (order_date);
CREATE INDEX idx_sales_fact_daypart ON sales_fact (daypart);
CREATE INDEX idx_sales_fact_channel ON sales_fact (channel);
CREATE INDEX idx_sales_fact_category ON sales_fact (product_category);
CREATE INDEX idx_sales_fact_item ON sales_fact (item_name);
CREATE INDEX idx_sales_fact_order ON sales_fact (order_id);
