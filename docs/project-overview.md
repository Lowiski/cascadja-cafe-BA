# Cascadja Foods and Drinks — Project Overview

CASCADJA (Foods and Drinks) is a casual café and food-and-beverage house at **Kasadya Park & Play, Calan Road, Cordova, Cebu**. It serves walk-in students, study groups and local hangout visitors, plus online delivery customers through **Foodpanda**. The menu covers espresso drinks, frappes, milkteas, rice meals, pasta, snacks, desserts and add-ons.

> **Data honesty:** item names, categories, prices and ★ bestseller flags are real, transcribed from the owner's menu photos. The 3,083 transaction lines are deterministic **generated sample data** (seed `20261120`) because no POS/Foodpanda export was supplied. The old fictional coffee-shop-and-inn dataset is preserved in `*-legacy` files but is not part of the active app.

## Central question

How should Cascadja use what it actually sells — at real prices of ₱90–₱245 — to grow sales from both walk-in and Foodpanda customers?

## The variables

| Variable | Field | Detail |
| --- | --- | --- |
| Time | `order_date`, `daypart` | 365 days, Nov 2025 – Oct 2026; Morning / Lunch / Afternoon / Evening / Late Night |
| Product | `product_category` | 12 real menu groups, from Coffee to Bread & Salad |
| Price | `item_price` | Exact menu price in PHP, including hot/iced and regular/large variants |
| Volume | `quantity_sold` | Units per sold line |
| Revenue | `total_sales` | `item_price × quantity_sold` plus any ₱10 or ₱35 add-on |
| Channel (added) | `channel` | **Dine-in / Foodpanda** — included because it reflects the real business |

## Current sample-data highlights

- **₱693,155** sales across **1,988 orders** and **3,083 sold lines**; average order **₱349**.
- **59 menu items** and **6 add-ons**; leading item **Garlic Pepper Beef**; leading category **Rice Meal** at **20.7%** of sales.
- **★ bestsellers** produce **39.9%** of sales — the star markers are commercially meaningful.
- **Add-on attach 28%** (₱19,090 add-on sales); **Dine-in 68.4%**, **Foodpanda 31.6%**.
- Busiest daypart **Morning**, busiest weekday **Sunday**; weekend average **₱2,284/day** vs **₱1,744/day** on weekdays.

## Admin entry

The dashboard is gated by a single admin login (`/login`). After signing in, the owner can use **Add menu item** and **Add sale** on the Menu and Sales records pages. Both forms write directly to Neon and invalidate the backend cache, so the next analytics request sees the new row. Credentials and the token-signing secret live in `backend/.env`; the session token lasts 8 hours.

## Repository layout

```
cascadja-cafe/
├── frontend/     React + Vite dashboard
├── backend/      Express API + analytics engine
├── database/     schema.sql, seed.sql, views.sql
├── docs/         overview, BA process, ERD, presentation
├── CASE_STUDY.md full written capstone
└── README.md     setup and usage
```

`*-legacy` files throughout the repo keep the earlier fictional inn/campaign version for reference only.

Full narrative: [`CASE_STUDY.md`](../CASE_STUDY.md).
