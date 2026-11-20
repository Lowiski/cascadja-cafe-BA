# Database ERD

Source of truth: [`database/schema.sql`](../database/schema.sql). Reporting views: [`database/views.sql`](../database/views.sql). Deterministic seed: [`database/seed.sql`](../database/seed.sql).

## Entity relationships

```
customers (1) ─────< (0..n) transactions >───── (1..n) sales >───── (1) products
                                  ^
                                  | (independent)
                          marketing_campaigns
```

`marketing_campaigns` is not directly joined to transactions; attribution is recorded in `revenue_attributed` and aggregated by month/channel, matching a last-click style assumption documented in the case study.

## Tables

### customers (250 rows)
`id` PK · `first_name` · `last_name` · `email` UNIQUE · `city` · `segment` · `joined_at` DATE · `loyalty_points`

### products (60 rows)
`id` PK · `name` · `category` (Coffee / Food / Pastry / Beverage / Room) · `unit_price` · `unit_cost` · `is_room` BOOLEAN

### marketing_campaigns (84 rows)
`id` PK · `campaign_name` · `channel` · `start_date` · `end_date` · `spend` · `impressions` · `clicks` · `conversions` · `revenue_attributed`

### transactions (2,769 rows)
`id` PK · `customer_id` FK → customers (`ON DELETE SET NULL`) · `txn_date` · `channel` (Dine-in / Takeout / Delivery / Room Stay) · `payment_method` · `status` · `total_amount`

### sales (5,105 rows)
`id` PK · `transaction_id` FK → transactions (`ON DELETE CASCADE`) · `product_id` FK → products · `sale_date` · `quantity` · `unit_price` · `line_total`

Indexes exist on transaction date/channel, sales transaction/product and marketing channel.

## Important implementation note

`pg` parses PostgreSQL `DATE` columns into JavaScript `Date` objects at local midnight, which shifts dates across timezones and breaks date-only analytics. `backend/src/config/database.js` registers a type parser for OID 1082 so `DATE` values stay as `YYYY-MM-DD` strings, matching the demo dataset exactly.

## Reporting views

- `v_monthly_performance` — revenue, transactions, spend, attributed revenue, room nights and COGS per month.
- `v_product_performance` — units, revenue and gross profit per product.
- `v_customer_segments` — customers, transactions, revenue and average spend per segment.
- `v_marketing_channel_roi` — spend, conversions, attributed revenue, ROI, CTR and CPA per channel.
- `v_transaction_detail` — transaction headers with customer name, segment and city.
