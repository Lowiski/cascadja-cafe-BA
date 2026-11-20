# Cascadja Cafe: from gut feel to a data-backed café plan

**Business Analytics Capstone** · Cascadja Foods and Drinks · Kasadya Park & Play, Calan Road, Cordova, Cebu

> **Data honesty statement.** Menu items, categories, prices and ★ bestseller flags are real and were transcribed from the owner's menu photos. The 3,083 transaction lines analysed below are deterministic **generated sample data** (seed `20261120`), created because no POS or Foodpanda export was provided. The numbers demonstrate the method; they are not observed sales. Every figure must be recalculated after real transaction data is loaded.

---

## 1. Problem background

CASCADJA (Foods and Drinks) is a casual café and food-and-beverage house serving students, study groups and local hangout visitors, plus online delivery customers through Foodpanda. Its menu spans espresso drinks, coffee-based frappes, signature drinks, real fruit smoothies, ade, milktea, rice meals, pasta, snacks, tiramisu, croffles and bread, with add-ons priced at ₱10 or ₱35. Single-item prices run from ₱90 to ₱245.

Decisions were previously made by habit: what to feature, when to staff, and whether delivery deserves attention. This study asks:

> How should Cascadja use what it actually sells — at real prices — to grow sales from both walk-in and Foodpanda customers?

The objectives were to integrate at least 50 records across the five required variables, describe performance, forecast near-term sales, and turn the findings into concrete operational recommendations.

## 2. Data and integration

### 2.1 Variables

| Required variable | Field used | Notes |
| --- | --- | --- |
| Time | `order_date`, `daypart` | 365 days, Nov 2025 – Oct 2026; five dayparts |
| Product | `product_category` | 12 real menu groups |
| Price | `item_price` | Exact menu price, including hot/iced variants |
| Volume | `quantity_sold` | Units per sold line |
| Revenue | `total_sales` | `item_price × quantity_sold` + add-on amount |
| Added | `channel` | Dine-in / Foodpanda — included because it is real |

Channel is deliberately a sixth variable. Rooms, loyalty points and marketing campaigns from an earlier fictional version were removed from the active app because they do not describe this business; those files remain as `*-legacy` references.

### 2.2 Dataset

The active dataset contains **59 menu items**, **6 add-ons** and **3,083 generated sales lines** grouped into **1,988 orders** over 365 days. It is reproducible from `backend/src/data/generateRealData.js` and is also materialised in `database/seed.sql`. The same generator drives the app when no Neon table is available, so the dashboard, database and documentation never disagree.

`order_date` is stored as a PostgreSQL `DATE`. The backend registers a parser for OID 1082 so dates stay `YYYY-MM-DD` strings instead of shifting across timezones.

### 2.3 Admin entry and persistence

The owner signs in at `/login` with an admin-only account defined in `backend/.env`. A signed 8-hour token gates the dashboard and the two write forms. **Add menu item** inserts into `menu_items`; **Add sale** inserts into `sales_fact`, with the line total calculated server-side. Writes go straight to Neon — there is no silent in-memory fallback — and the backend cache is invalidated so the next chart refresh reflects the new row. With no `DATABASE_URL`, the app still demonstrates analytics on the labelled sample data but write endpoints return `503`.

## 3. Descriptive results — what happened?

Across the year, Cascadja recorded **₱693,155** in sales, **1,988 orders**, **4,086 units**, and an average order of **₱349**. The average sold item was **₱165**.

- **Bestsellers matter.** Items marked ★ in the owner's menu produced **39.9%** of all sales. The top item was **Garlic Pepper Beef**. This validates the menu marker as a commercial signal, not decoration.
- **Food leads, drinks follow.** Food categories contributed **59.5%** of sales and drinks **40.5%**. The largest category was **Rice Meal** at **20.7%**, followed by Snacks and the coffee/frappe groups.
- **Add-ons are small but real.** Add-ons attached to **28%** of sold lines and contributed **₱19,090**. The most common was Coffee Jelly.
- **Two channels, one operation.** Dine-in produced **68.4%** of sales; Foodpanda **31.6%** (₱218,725). Delivery is material enough to deserve its own actions.
- **Time has a rhythm.** Morning was the largest daypart (**27.9%** of sales) and Sunday the busiest weekday. Saturday–Sunday averaged **₱2,284** per day against **₱1,744** on weekdays.

These results are served by `/api/descriptive` and exposed visually on the Overview and Analytics pages.

## 4. Predictive result — what will happen?

A straight calendar-day regression was tested first. It produced an R² of roughly 0.003 — essentially no signal — which is unsurprising for generated daily counts with no trend. The reported forecast therefore uses a **weekday seasonal average**: the expected sales for any future date are the historical mean of that weekday, with a band of ±1.96 residual standard deviations.

| Metric | Value |
| --- | --- |
| Model | Weekday seasonal average (day-of-week naive) |
| R² | 0.157 |
| MAPE | 30.7% |
| RMSE | ₱618 |
| Observations | 365 days |
| Next 7 days | ₱13,287 ± ₱1,224 |

The fit is honest but modest. It captures the weekend lift and gives a useful planning range, but it does not know about promotions, holidays, weather or delivery campaigns. A linear trend is still reported as a reference on the Forecasting page, not as the forecast basis.

## 5. Prescriptive recommendations — what should be done?

The Prescriptive page exposes two live levers: add-on attach target and Foodpanda growth.

1. **Feature the winners.** Put Garlic Pepper Beef and the other ★ items first on the board and at the top of the Foodpanda listing. Build lunch and afternoon combos around the bestseller list that already drives 39.9% of sales.
2. **Prompt add-ons.** Current attach is 28%. A counter script ("add pearls or creamcheese?") and a delivery note can move it toward 30% with almost no ingredient cost. The default scenario estimates about ₱112 extra monthly sales from a two-point move — small alone, but cumulative with other actions.
3. **Grow delivery deliberately.** Foodpanda is 31.6% of sales. Better photos, bundles and slow-day promos are preferable to discounting the whole menu. At +15% delivery growth, the model estimates about ₱32,809 additional monthly sales.
4. **Protect the food/drink balance.** With food at 59.5%, pair a rice meal with an iced drink at lunch rather than pushing a single category until it cannibalises the other.
5. **Staff the peaks.** Morning and Sunday are the busiest windows. Move people into those periods and trim the quietest daypart instead of covering all hours equally.

### Default scenario

| Line | Amount |
| --- | --- |
| Projected monthly sales | ₱89,891 |
| Assumed variable cost (36%) | ₱32,361 |
| Assumed fixed cost | ₱28,000 |
| Estimated profit | ₱29,530 |
| Net margin | 32.9% |

The cost figures are explicit assumptions, not owner-supplied financials. They must be replaced before the scenario is used as a budget.

## 6. Step-wise connections

1. Descriptive add-on attach and the leading add-on feed the upsell recommendation.
2. Descriptive channel revenue feeds the Foodpanda scenario.
3. Descriptive daypart orders feed the staffing rule.
4. The weekday forecast sets a "normal week" baseline for judging whether an action worked.
5. The Data Explorer exposes the exact rows behind every stage, so each claim can be traced to a sale.

## 7. Limitations and next steps

- Transactions are generated, not observed. The method is demonstrable; the estimates are not final.
- No real COGS, rent, wages or promotional calendar were supplied.
- The forecast models weekday only; holidays, weather and campaigns are absent.
- Attribution of add-ons is assumed to belong to the line they appear on.

**Next steps:** export daily POS and Foodpanda rows into `sales_fact`, add item-level costs, rebuild the forecast with seasonality/external drivers, then run small experiments on bestseller bundles and add-on prompts.

## 8. Deliverables

- Interactive dashboard with admin login and add-menu/add-sale forms: `frontend/`
- API, analytics services and admin-only write endpoints: `backend/`
- Database schema, real-menu seed and reporting views: `database/`
- Short reference docs and presentation outline: `docs/`
- This written case study: `CASE_STUDY.md`
