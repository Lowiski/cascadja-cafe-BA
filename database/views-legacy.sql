-- Cascadja Cafe - reporting views used by the dashboard and case study.
-- Run after database/schema.sql (and optionally database/seed.sql).
-- These views mirror the calculations in backend/src/analytics.js.

CREATE OR REPLACE VIEW v_monthly_performance AS
WITH txn AS (
  SELECT date_trunc('month', txn_date)::date AS month,
         SUM(total_amount) AS revenue,
         COUNT(*) AS transactions
  FROM transactions
  WHERE status <> 'Cancelled'
  GROUP BY 1
),
spend AS (
  SELECT date_trunc('month', start_date)::date AS month,
         SUM(spend) AS marketing_spend,
         SUM(revenue_attributed) AS attributed_revenue,
         SUM(conversions) AS conversions
  FROM marketing_campaigns
  GROUP BY 1
),
rooms AS (
  SELECT date_trunc('month', s.sale_date)::date AS month,
         SUM(s.quantity) FILTER (WHERE p.is_room) AS room_nights,
         SUM(s.line_total) FILTER (WHERE p.is_room) AS room_revenue,
         SUM(p.unit_cost * s.quantity) AS cogs
  FROM sales s
  JOIN products p ON p.id = s.product_id
  JOIN transactions t ON t.id = s.transaction_id
  WHERE t.status <> 'Cancelled'
  GROUP BY 1
),
months AS (
  SELECT month FROM txn UNION SELECT month FROM spend
)
SELECT m.month,
       COALESCE(t.revenue, 0) AS revenue,
       COALESCE(t.transactions, 0) AS transactions,
       CASE WHEN COALESCE(t.transactions, 0) = 0 THEN 0
            ELSE COALESCE(t.revenue, 0) / t.transactions END AS avg_order,
       COALESCE(s.marketing_spend, 0) AS marketing_spend,
       COALESCE(s.attributed_revenue, 0) AS attributed_revenue,
       COALESCE(s.conversions, 0) AS conversions,
       COALESCE(r.room_nights, 0) AS room_nights,
       COALESCE(r.room_revenue, 0) AS room_revenue,
       COALESCE(r.cogs, 0) AS cogs
FROM months m
LEFT JOIN txn t ON t.month = m.month
LEFT JOIN spend s ON s.month = m.month
LEFT JOIN rooms r ON r.month = m.month;

CREATE OR REPLACE VIEW v_product_performance AS
SELECT p.id,
       p.name,
       p.category,
       p.is_room,
       p.unit_price,
       p.unit_cost,
       SUM(s.quantity) AS units_sold,
       SUM(s.line_total) AS revenue,
       SUM((p.unit_price - p.unit_cost) * s.quantity) AS gross_profit
FROM sales s
JOIN products p ON p.id = s.product_id
JOIN transactions t ON t.id = s.transaction_id
WHERE t.status <> 'Cancelled'
GROUP BY p.id, p.name, p.category, p.is_room, p.unit_price, p.unit_cost;

CREATE OR REPLACE VIEW v_customer_segments AS
SELECT c.segment,
       COUNT(DISTINCT c.id) AS customers,
       COUNT(t.id) AS transactions,
       COALESCE(SUM(t.total_amount), 0) AS revenue,
       CASE WHEN COUNT(t.id) = 0 THEN 0
            ELSE COALESCE(SUM(t.total_amount), 0) / COUNT(t.id) END AS avg_spend
FROM customers c
LEFT JOIN transactions t ON t.customer_id = c.id AND t.status <> 'Cancelled'
GROUP BY c.segment;

CREATE OR REPLACE VIEW v_marketing_channel_roi AS
SELECT channel,
       COUNT(*) AS campaigns,
       SUM(spend) AS spend,
       SUM(impressions) AS impressions,
       SUM(clicks) AS clicks,
       SUM(conversions) AS conversions,
       SUM(revenue_attributed) AS attributed_revenue,
       CASE WHEN SUM(spend) = 0 THEN 0
            ELSE ROUND(SUM(revenue_attributed) / SUM(spend), 2) END AS roi,
       CASE WHEN SUM(impressions) = 0 THEN 0
            ELSE ROUND(100.0 * SUM(clicks) / SUM(impressions), 2) END AS ctr_pct,
       CASE WHEN SUM(conversions) = 0 THEN 0
            ELSE ROUND(SUM(spend) / SUM(conversions), 2) END AS cpa
FROM marketing_campaigns
GROUP BY channel;

CREATE OR REPLACE VIEW v_transaction_detail AS
SELECT t.id,
       t.txn_date,
       COALESCE(c.first_name || ' ' || c.last_name, 'Walk-in') AS customer,
       c.segment,
       c.city,
       t.channel,
       t.payment_method,
       t.status,
       t.total_amount
FROM transactions t
LEFT JOIN customers c ON c.id = t.customer_id;
