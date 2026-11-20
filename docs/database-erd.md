# Database ERD

Source of truth: [`database/schema.sql`](../database/schema.sql). Seed: [`database/seed.sql`](../database/seed.sql). Views: [`database/views.sql`](../database/views.sql). The earlier inn/campaign schema is preserved as `database/schema-legacy.sql`.

## Entity relationships

```
menu_items (1) ─────< (0..n) sales_fact
addons     (1) ─────< (0..n) sales_fact   -- optional, recorded by name + amount on the line

sales_fact.order_id groups lines into one customer visit.
No customer table: the real walk-in business does not capture loyalty profiles.
```

`addons` is a price master only. Each sales line records the chosen add-on name and amount directly, so a single line fully describes what was paid.

## Tables

### menu_items (59 rows)
`id` PK · `name` UNIQUE · `category` · `hot_price` · `iced_price` (nullable) · `bestseller` BOOLEAN

### addons (6 rows)
`id` PK · `name` UNIQUE · `price` · `bestseller` BOOLEAN

### sales_fact (3,083 sample rows)
`id` PK · `order_id` · `order_date` DATE · `daypart` CHECK · `channel` CHECK · `product_category` · `item_name` · `item_price` · `quantity_sold` · `addon_name` (nullable) · `addon_amount` · `total_sales`

Indexes exist on order date, daypart, channel, category, item name and order id.

## Important implementation note

`pg` parses PostgreSQL `DATE` columns into local-midnight JavaScript `Date` objects, which shifts dates across timezones. `backend/src/config/database.js` registers a type parser for OID 1082 so dates remain `YYYY-MM-DD` strings, matching the demo dataset exactly. `backend/src/db.js` re-exports that configured pool.

Admin writes use two signed-token endpoints: `POST /api/menu` inserts a `menu_items` row, and `POST /api/sales` validates the item, channel, daypart and date before inserting a `sales_fact` row. The total is computed server-side as `item_price × quantity_sold + addon_amount`. Both call `invalidateCache()` so the analytics read path reloads from Neon.

## Reporting views

- `v_daily_sales` — revenue, orders, units and lines per day.
- `v_category_performance` — revenue share and average order per real menu category.
- `v_daypart_performance` — revenue and orders by daypart.
- `v_channel_performance` — Dine-in vs Foodpanda revenue and share.
- `v_top_items` — revenue and units by exact menu item.
- `v_addon_performance` — lines and revenue by add-on, including "No add-on".
