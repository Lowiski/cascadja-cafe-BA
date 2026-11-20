-- Cascadja Foods and Drinks - reporting views for the active dashboard.
-- Run after database/schema.sql and database/seed.sql.
-- The old inn/campaign views are preserved as database/views-legacy.sql.

CREATE OR REPLACE VIEW v_daily_sales AS
SELECT order_date,
       SUM(total_sales) AS revenue,
       COUNT(DISTINCT order_id) AS orders,
       SUM(quantity_sold) AS items_sold,
       COUNT(*) AS sold_lines
FROM sales_fact
GROUP BY order_date
ORDER BY order_date;

CREATE OR REPLACE VIEW v_category_performance AS
SELECT product_category,
       SUM(total_sales) AS revenue,
       SUM(quantity_sold) AS units,
       COUNT(*) AS sold_lines,
       ROUND(100.0 * SUM(total_sales) / NULLIF((SELECT SUM(total_sales) FROM sales_fact), 0), 1) AS share_pct,
       ROUND(SUM(total_sales) / NULLIF(COUNT(DISTINCT order_id), 0), 2) AS avg_order
FROM sales_fact
GROUP BY product_category
ORDER BY revenue DESC;

CREATE OR REPLACE VIEW v_daypart_performance AS
SELECT daypart,
       SUM(total_sales) AS revenue,
       COUNT(DISTINCT order_id) AS orders,
       SUM(quantity_sold) AS units,
       ROUND(SUM(total_sales) / NULLIF(COUNT(DISTINCT order_id), 0), 2) AS avg_order
FROM sales_fact
GROUP BY daypart
ORDER BY CASE daypart WHEN 'Morning' THEN 1 WHEN 'Lunch' THEN 2 WHEN 'Afternoon' THEN 3
                      WHEN 'Evening' THEN 4 ELSE 5 END;

CREATE OR REPLACE VIEW v_channel_performance AS
SELECT channel,
       SUM(total_sales) AS revenue,
       COUNT(DISTINCT order_id) AS orders,
       ROUND(SUM(total_sales) / NULLIF(COUNT(DISTINCT order_id), 0), 2) AS avg_order,
       ROUND(100.0 * SUM(total_sales) / NULLIF((SELECT SUM(total_sales) FROM sales_fact), 0), 1) AS share_pct
FROM sales_fact
GROUP BY channel
ORDER BY revenue DESC;

CREATE OR REPLACE VIEW v_top_items AS
SELECT item_name,
       product_category,
       SUM(total_sales) AS revenue,
       SUM(quantity_sold) AS units,
       COUNT(*) AS sold_lines
FROM sales_fact
GROUP BY item_name, product_category
ORDER BY revenue DESC;

CREATE OR REPLACE VIEW v_addon_performance AS
SELECT COALESCE(addon_name, 'No add-on') AS addon_name,
       COUNT(*) AS sold_lines,
       SUM(addon_amount) AS revenue
FROM sales_fact
GROUP BY COALESCE(addon_name, 'No add-on')
ORDER BY revenue DESC;
