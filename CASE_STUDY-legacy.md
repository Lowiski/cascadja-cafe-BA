# Cascadja Cafe: From Gut Feel to a Data-Backed Plan

**Business Analytics Capstone — Case Study**

| | |
| --- | --- |
| **Company** | Cascadja Cafe (coffee shop, restaurant, four-room inn) |
| **Period analysed** | November 2025 – October 2026 (12 months, 365 days) |
| **System** | React 18 dashboard · Express 4 API · Neon Postgres · Chart.js |
| **Dataset** | 5 variables, 8,268 records, deterministic seed `20261106` |
| **Currency** | Philippine peso (₱) |

> **How to use this document.** It is the standalone written capstone. The same content is built into the app on the **Case study** page, which can be printed to PDF. The numbers below come from the seeded database and are reproduced live by the dashboard and API.

---

## Executive summary

Cascadja Cafe earned **₱2,461,610** from **2,674 completed transactions** in the twelve months to October 2026, at a **59.8% gross margin**. The business is healthy but unbalanced:

- **Rooms are the economic engine.** Lodging is **55.6%** of revenue (₱1,369,800) from only **272 room-stay transactions** — about one in ten visits. ADR is ₱2,504, but occupancy averages only **37.5%**, leaving more than half of the four rooms empty.
- **Marketing is uneven.** ₱345,300 of spend produced ₱1,058,916 of attributed revenue (**3.07x** overall), but returns range from **₱10.77 per ₱1** for Email to **₱1.02** for Walk-in Promo — a tenfold gap.
- **The cafe is under-attached.** Only **58.8%** of room stays include a cafe item, even though the guest is already on site.
- **Revenue is predictable.** Monthly revenue is explained (R² = **0.803**) by a simple regression on marketing spend: every extra ₱1,000 is associated with **₱3,731** more revenue. Next-quarter revenue is forecast at **₱226.0k → ₱233.8k** per month.

**The recommendation is not a bigger budget — it is a better mix.** Reallocate the existing budget (worth roughly **+18–20%** attributed revenue at the same spend), fill weekday rooms with targeted packages, and convert room guests into cafe customers. Base-case scenario at a ₱30,000 monthly budget: **₱209,705** projected revenue and **₱37,403** estimated monthly profit (17.8% margin).

---

## 1. Problem background

### 1.1 The company

Cascadja Cafe is a small hospitality business that combines:

- a **coffee shop and restaurant** selling coffee, meals, pastries and beverages throughout the day;
- a **four-room inn** (Budget Single, Garden View, Deluxe King, Family Suite) that captures overnight guests who also spend in the cafe.

The two sides share one location, one brand and one customer base, but they are managed as separate businesses.

### 1.2 The symptoms

The business has grown, but its decisions are still made by intuition:

1. **Marketing is allocated by habit.** Budget is split across seven channels — Email, Google Ads, Facebook, Instagram, Influencer, Local Events and Walk-in Promo — without measuring the return of each peso.
2. **Room rates are set once a year.** There is no link between rate, occupancy and revenue per available room (RevPAR). In the analysed year occupancy averaged 37.5%, so pricing is leaving demand on the table on weekdays while peak weekends may be underpriced.
3. **The cafe and inn behave like two companies.** Rooms generate 55.6% of revenue, yet only 58.8% of room stays include a cafe purchase.

### 1.3 Central question

> **How should Cascadja Cafe allocate its marketing budget and price its rooms to maximise revenue — and how much revenue can be expected next quarter if it follows the recommendation?**

### 1.4 Objectives

1. **Describe** what happened across customers, sales, transactions, products and marketing.
2. **Predict** monthly revenue from marketing investment and project the next quarter.
3. **Prescribe** a budget mix, a room-rate rule and a cross-sell action that improve on the current plan.

### 1.5 Scope

The analysis covers all transactions, customers, products and campaigns recorded between **1 November 2025 and 31 October 2026**. It excludes taxes, financing costs and capital expenditure. All amounts are in PHP.

---

## 2. Data collection and database design

### 2.1 The five variables

The capstone requires at least 50 records for each of five variables. The seeded database exceeds every minimum:

| # | Variable | Table | Records | Key fields | Role in the analysis |
| --- | --- | --- | ---: | --- | --- |
| 1 | Customers | `customers` | **250** | `segment`, `city`, `joined_at`, `loyalty_points` | Segmentation, repeat rate, lifetime value |
| 2 | Sales (line items) | `sales` | **5,105** | `transaction_id`, `product_id`, `quantity`, `unit_price`, `line_total` | Product, category and menu revenue |
| 3 | Transactions | `transactions` | **2,769** | `customer_id`, `txn_date`, `channel`, `payment_method`, `status`, `total_amount` | Order volume, channel mix, average ticket |
| 4 | Products | `products` | **60** | `category`, `unit_price`, `unit_cost`, `is_room` | Rooms vs cafe, margins, product ranking |
| 5 | Marketing campaigns | `marketing_campaigns` | **84** | `channel`, `start_date`, `end_date`, `spend`, `impressions`, `clicks`, `conversions`, `revenue_attributed` | Channel ROI, CPA, budget optimisation |

### 2.2 Relationships

```
customers 1 ───< transactions 1 ───< sales >─── 1 products
                                  sales.product_id → products.id
marketing_campaigns  (standalone; joined to revenue by month + channel)
```

- One customer has many transactions; a walk-in guest has `customer_id = NULL`.
- One transaction has many sales line items; each line references one product.
- Products are either **cafe items** (`is_room = false`) or one of the four **room types** (`is_room = true`).
- Campaigns are independent records, compared to monthly revenue and conversions.

### 2.3 Schema notes

- `transactions.status` distinguishes `Completed` from `Cancelled`; every revenue metric filters to completed transactions.
- `sales.sale_date` is denormalised from the transaction so product trends can be aggregated without a join.
- Indexes cover `txn_date`, `channel`, `transaction_id`, `product_id`, and marketing `channel`.
- Monetary columns use `NUMERIC(12,2)`; the API converts them to numbers.

### 2.4 System architecture

```
┌─────────────────────┐      REST /api      ┌──────────────────────┐      SQL      ┌─────────────────┐
│  React dashboard     │ ──────────────────▶ │  Express analytics   │ ────────────▶ │  Neon Postgres  │
│  Vite · Chart.js     │ ◀────────────────── │  engine + REST API   │ ◀──────────── │  5 tables       │
└─────────────────────┘      JSON            └──────────────────────┘   rows        └─────────────────┘
```

- **React** renders six pages: Overview, Descriptive, Predictive, Prescriptive, Data explorer, Case study.
- **Express** exposes the analytics API and serves the production build.
- **Neon Postgres** stores the five tables.
- If `DATABASE_URL` is absent, the API generates the **same** dataset in memory (demo mode), so the app is fully functional before the database is connected. The analytics code is identical in both modes.

### 2.5 Reproducibility

The dataset is generated by `server/src/data/generate.js` with a fixed seed (`20261106`). It simulates realistic behaviour: segment-weighted customer choice, weekend peaks, room-stay add-ons, channel-specific campaign economics, and a 3.5% cancellation rate. Re-running `npm run db:setup` produces exactly the same rows, so the dashboard, API responses and this document always agree.

---

## 3. The business analytics process

The capstone follows the standard chain. Each stage consumes the previous stage's output:

```
DESCRIPTIVE ──▶ PREDICTIVE ──▶ PRESCRIPTIVE
What happened?   What will happen?   What should we do?
```

### 3.1 Descriptive — what happened?

#### Headline indicators

| Metric | Value |
| --- | ---: |
| Total revenue | **₱2,461,610** |
| Gross profit / margin | ₱1,471,378 / **59.8%** |
| Completed transactions | **2,674** |
| Average order value | **₱921** |
| Active loyalty customers | 234 of 250 |
| Repeat customers / repeat rate | 202 / **86.3%** |
| Marketing spend | ₱345,300 |
| Attributed revenue / ROI | ₱1,058,916 / **3.07x** |
| Conversions | 1,056 |
| Room nights sold | 547 |
| Occupancy / ADR / RevPAR | **37.5%** / ₱2,504 / ₱938 |
| Room revenue (product) / share | ₱1,369,800 / **55.6%** |
| Cafe revenue | ₱1,091,810 |
| Room-to-cafe attach rate | **58.8%** |
| Top cafe product | Chicken Adobo Rice Bowl (₱54,780) |
| Busiest day | Saturday (506 transactions) |
| Transactions per day | 7.3 |

#### Revenue mix by category

| Category | Revenue | Share | Units |
| --- | ---: | ---: | ---: |
| Room | ₱1,369,800 | 55.6% | 547 room-nights |
| Food | ₱530,070 | 21.5% | 2,204 |
| Coffee | ₱293,380 | 11.9% | 1,589 |
| Beverage | ₱140,670 | 5.7% | 905 |
| Pastry | ₱127,690 | 5.2% | 1,030 |

#### Revenue by transaction channel

| Channel | Revenue | Share | Transactions | Avg order |
| --- | ---: | ---: | ---: | ---: |
| Room Stay | ₱1,421,980 | 57.8% | 272 | ₱5,228 |
| Dine-in | ₱606,955 | 24.7% | 1,326 | ₱458 |
| Takeout | ₱296,180 | 12.0% | 670 | ₱442 |
| Delivery | ₱136,495 | 5.5% | 406 | ₱336 |

*Room-stay channel revenue includes cafe items charged to room transactions; the product-category figure above counts only the room line itself.*

#### Who buys

| Segment | Revenue | Share | Transactions | Avg spend |
| --- | ---: | ---: | ---: | ---: |
| Walk-in | ₱1,765,090 | 71.7% | 1,932 | ₱914 |
| Tourist | ₱262,980 | 10.7% | 123 | ₱2,138 |
| Young Professional | ₱149,205 | 6.1% | 233 | ₱640 |
| Family | ₱123,275 | 5.0% | 121 | ₱1,019 |
| Student | ₱118,955 | 4.8% | 199 | ₱598 |
| Corporate | ₱42,105 | 1.7% | 66 | ₱638 |

Walk-ins dominate volume and revenue, which is expected for a cafe beside a road. The loyalty base is small but engaged: **86.3%** of active members have more than one visit. Tourists have by far the highest average spend (₱2,138) because they book rooms.

#### Payment and demand patterns

| Payment | Revenue | Transactions |
| --- | ---: | ---: |
| Credit Card | ₱1,009,745 | 585 |
| GCash | ₱659,780 | 824 |
| Cash | ₱656,195 | 946 |
| Maya | ₱135,890 | 319 |

Saturday is the busiest day (506 transactions, ₱506,970), followed by Sunday (477) and Friday (343). Tuesday and Wednesday are the weakest (342 and 314). Room stays peak on Friday and Saturday nights.

#### Marketing efficiency

| Channel | Spend | Attributed revenue | ROI | CPA | Conversions |
| --- | ---: | ---: | ---: | ---: | ---: |
| Email | ₱34,200 | ₱368,287 | **10.77x** | ₱102 | 336 |
| Google Ads | ₱74,100 | ₱260,380 | 3.51x | ₱313 | 237 |
| Facebook Ads | ₱69,500 | ₱163,561 | 2.35x | ₱409 | 170 |
| Instagram Ads | ₱47,300 | ₱94,035 | 1.99x | ₱455 | 104 |
| Influencer | ₱34,500 | ₱66,708 | 1.93x | ₱523 | 66 |
| Local Events | ₱45,400 | ₱64,767 | 1.43x | ₱568 | 80 |
| Walk-in Promo | ₱40,300 | ₱41,178 | **1.02x** | ₱630 | 64 |
| **Total** | **₱345,300** | **₱1,058,916** | **3.07x** | | **1,056** |

#### What the descriptive step establishes

1. A small number of high-ticket room stays carry the P&L, so occupancy and room rate matter more than another menu item.
2. Marketing returns vary by **more than 10x**, so the channel mix is the clearest source of wasted spend.
3. The cafe is under-attached to rooms, which is the cheapest available revenue.
4. Demand has a strong weekly rhythm (weekends) and month-to-month variation that a predictive model must respect.

### 3.2 Predictive — what will happen?

#### Model choice

Monthly revenue is modelled with a **simple linear regression** on monthly marketing spend. The choice is deliberate: with only twelve observations, a transparent one-driver model is more defensible than a black box, and its slope is directly actionable by the budget optimizer.

#### Fitted model

```
Revenue = 97,773 + 3.73 × Marketing spend
```

| Statistic | Value | Meaning |
| --- | ---: | --- |
| Slope | **3.73** | Each extra ₱1 of spend → ₱3.73 revenue |
| Intercept | ₱97,773 | Revenue with zero marketing spend |
| R² | **0.803** | 80.3% of monthly revenue variation explained |
| MAPE | **6.2%** | Average forecast error |
| RMSE | ₱13,626 | Root mean squared error |
| Residual std. dev. | ₱14,927 | Used for the 95% band |
| Observations | 12 | Monthly totals |

**Interpretation.** Every additional ₱1,000 of monthly marketing spend is associated with about **₱3,731** of monthly revenue. Marketing spend explains roughly **80%** of the month-to-month revenue variation. The intercept (₱97,773) represents the baseline revenue that arrives without campaign support — walk-in and repeat demand.

#### Next-quarter forecast

Assumption: spend continues to grow **3% per month** from the recent three-month average (₱33,367), and the 95% band is ±1.96 × residual standard deviation.

| Month | Spend | Forecast revenue | 95% range |
| --- | ---: | ---: | --- |
| Nov 2026 | ₱34,368 | **₱226,002** | ₱196,746 – ₱255,258 |
| Dec 2026 | ₱35,399 | **₱229,849** | ₱200,593 – ₱259,105 |
| Jan 2027 | ₱36,461 | **₱233,811** | ₱204,555 – ₱263,067 |

#### Occupancy forecast

A three-month moving average with a **damped trend** avoids extrapolating one strong quarter into unrealistic occupancy:

| Month | Projected occupancy |
| --- | ---: |
| Nov 2026 | 48.9% |
| Dec 2026 | 54.4% |
| Jan 2027 | 59.9% |

The recent quarter averaged 43.4% (Aug 45.2%, Sep 35.8%, Oct 49.2%), against 32.4% in the prior quarter. The damped trend captures the recovery without promising a straight line.

#### What actually moves revenue?

| Driver | Correlation with monthly revenue |
| --- | ---: |
| Room nights | **0.96** |
| Transactions | 0.94 |
| Occupancy % | 0.94 |
| Marketing spend | 0.90 |
| Conversions | 0.89 |
| New customers | 0.20 |

Room nights, transaction volume and occupancy are the strongest correlates. Marketing spend is strongly correlated too, but it is a **lever**, not a cause of demand by itself. New-customer count is weak because most revenue comes from existing and walk-in guests.

#### What the predictive step establishes

- A defensible revenue baseline for any marketing budget: `97,773 + 3.73 × spend`.
- An explicit error range (6.2% MAPE), so the prescriptive recommendations are presented honestly.
- Confirmation that demand-side variables (rooms, occupancy, transactions) dominate — which is why room pricing is treated as a first-class lever alongside marketing.

### 3.3 Prescriptive — what should be done?

The prescriptive layer turns the model into decisions through four rules.

#### Rule 1 — Budget optimizer

The optimizer keeps the **total budget fixed** and reallocates it toward channels with stronger measured returns, subject to realistic minimum and maximum spends (40%–220% of each channel's historical monthly average). It also applies **diminishing returns**: scaling a channel far above its historical level makes each additional peso slightly less productive.

Base scenario: **₱30,000 per month**, no room-rate change.

| Channel | Current/month | Recommended | Change | ROI | Projected revenue |
| --- | ---: | ---: | ---: | ---: | ---: |
| Email | ₱2,850 | **₱6,270** | +₱3,420 (+120%) | 10.77x | ₱52,964 |
| Google Ads | ₱6,175 | **₱9,172** | +₱2,997 (+48.5%) | 3.51x | ₱29,391 |
| Instagram Ads | ₱3,942 | ₱4,775 | +₱833 (+21.1%) | 1.99x | ₱9,126 |
| Influencer | ₱2,875 | ₱4,610 | +₱1,735 (+60.3%) | 1.93x | ₱7,943 |
| Facebook Ads | ₱5,792 | ₱2,317 | −₱3,475 (−60%) | 2.35x | ₱5,450 |
| Local Events | ₱3,783 | ₱1,513 | −₱2,270 (−60%) | 1.43x | ₱2,158 |
| Walk-in Promo | ₱3,358 | ₱1,343 | −₱2,015 (−60%) | 1.02x | ₱1,371 |
| **Total** | **₱28,775** | **₱30,000** | **+₱1,225** | **3.61x** | **₱108,403** |

- **Projected attributed revenue:** ₱108,403 vs **₱91,964** for the current mix at the same total spend → **+17.9% lift**.
- **Projected blended ROI:** **3.61x** vs 3.07x today.
- At the current average spend of ₱28,775 (the dashboard's default), the lift is **+20.1%**.

The biggest move is into **Email** (highest ROI, low CPA), followed by **Google Ads** for scale. Facebook, Local Events and Walk-in Promo are trimmed to their minimum because their returns are weakest. Caps prevent over-concentration in a single channel.

#### Rule 2 — Room-rate rule

The rule reads occupancy and applies an elasticity of **−1.1**:

| Occupancy band | Action |
| --- | --- |
| ≥ 70% | Raise rate ~8% |
| 55–69% | Raise rate ~4% |
| 40–54% | Hold rate, push packages |
| < 40% | Cut rate ~7% and bundle cafe credits |

Current occupancy is **37.5%**, so the recommendation is:

- **Current ADR:** ₱2,504
- **Suggested ADR:** **₱2,329 (−7%)**
- **Rationale:** a weekday rate cut plus bundled cafe credits should fill rooms faster than a price increase. Because elasticity is −1.1, the rate cut is almost revenue-neutral on existing demand (≈ +₱184/month) while occupancy rises toward **40%** and the cafe captures more guests.

This is a **weekday** action. Weekend rates should remain where they are.

#### Rule 3 — Cafe cross-sell

Only **58.8%** of room stays include a cafe item. A check-in coffee or breakfast bundle targets the remaining 41.2% at near-zero acquisition cost.

- Room stays per month: ~22.7
- +15 percentage points of attach → ~3.4 extra cafe tickets/month
- At the ₱455 cafe average ticket → **≈ ₱1,547 extra cafe revenue per month**

#### Rule 4 — Operations and menu

- **Staffing:** 7.3 transactions/day and Saturday peaks imply **2 service staff at peak**, 1 on slow weekdays.
- **Menu:** feature **Chicken Adobo Rice Bowl** (₱54,780, the top cafe product) in a bundle with a pastry or coffee to lift the cafe average ticket.
- **Cafe contribution:** the cafe is 44.4% of revenue, so small ticket gains are material even though rooms dominate the top line.

#### Scenario P&L (₱30,000 budget, no rate change)

| Line | Monthly amount |
| --- | ---: |
| Projected revenue | **₱209,705** |
| Cost of goods sold (40.2%) | −₱84,301 |
| Marketing | −₱30,000 |
| Fixed operating cost | −₱58,000 |
| **Estimated profit** | **₱37,403** |
| **Net margin** | **17.8%** |
| — Cafe revenue | ₱93,109 |
| — Room revenue | ₱116,596 |

Revenue is split between cafe and rooms using the historical mix (44.4% / 55.6%). The regression supplies the revenue baseline for the chosen budget; the optimizer decides how efficiently that budget is spent. Moving the sliders on the Prescriptive page recomputes this P&L through the same API.

### 3.4 Step-wise connections in the BA process

The three stages are not separate reports. Each finding becomes an input to the next stage:

| Descriptive finding | Predictive use | Prescriptive decision | Measured outcome |
| --- | --- | --- | --- |
| Rooms are 55.6% of revenue from ~10% of transactions | Room revenue is embedded in the total-revenue baseline | Room-rate rule adjusts ADR from occupancy | Suggested ₱2,329 ADR with occupancy toward 40% |
| Marketing spend varies ₱19.6k–₱39.7k and revenue follows it | Slope 3.73 · R² 0.803 · MAPE 6.2% | Budget optimizer reallocates within the same total | +17.9% attributed revenue at ₱30k; +20.1% at current spend |
| Email returns 10.77x vs Walk-in Promo 1.02x | Spend assumption sets the scenario baseline | Shift budget from Walk-in Promo into Email and Google Ads | Higher return per peso, same budget |
| Occupancy 37.5% · ADR ₱2,504 | Occupancy forecast 48.9% next month | Weekday packages and a targeted rate change | Occupancy recovers without discounting weekends |
| Cafe attach rate 58.8% | Cafe revenue retained in the scenario baseline | Check-in coffee / breakfast bundle | ≈ ₱1,547 extra cafe revenue per month at +15 pp |
| Chicken Adobo Rice Bowl is the top cafe product | Menu mix supports the revenue baseline | Feature and bundle the top product | Higher average cafe ticket |

---

## 4. Dashboard and system overview

### 4.1 Pages

| Page | Purpose | What it displays |
| --- | --- | --- |
| **Overview** | Executive dashboard | Four headline KPIs, revenue vs spend, channel doughnut, top products, channel ROI, occupancy trend, variable counts |
| **Descriptive** | What happened | Six KPIs, monthly revenue/volume, category and segment mix, top products, day-of-week, payments, channel and marketing tables, room mix |
| **Predictive** | What will happen | Regression equation and stats, actual vs fitted, 3-month forecast, scatter with trend line, driver correlations, occupancy forecast |
| **Prescriptive** | What to do | Budget and rate sliders, allocation chart, allocation table, scenario P&L, room pricing, five generated recommendations, assumptions |
| **Data explorer** | Database integration | Searchable, sortable, paginated tables for all five variables; working add-customer form |
| **Case study** | Written capstone | This document, printable to PDF |

### 4.2 Interactivity

- **Budget slider** (₱8,000–₱80,000) and **room-rate slider** (−20% to +20%) recalculate revenue, profit, margin, occupancy, allocations and recommendations after a 350 ms debounce.
- **Search, sort and paginate** any of the five tables; row counts update live.
- **Add customer** writes a real row (to Neon when connected) and refreshes counts and analytics.
- **Refresh** reloads the current data; the demo/Neon badge always shows the active source.

### 4.3 API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| GET | `/api/health` | Status, mode, database ping |
| GET | `/api/meta` | Mode, company, currency, record counts |
| GET | `/api/descriptive` | All descriptive metrics |
| GET | `/api/predictive` | Regression, forecast, drivers |
| GET/POST | `/api/prescriptive` | Scenario analysis (query or JSON body) |
| GET | `/api/data/:table` | Paged/searchable/sortable rows |
| POST | `/api/customers` | Insert a loyalty customer |

---

## 5. Recommendations and expected impact

| # | Action | Evidence | Expected impact |
| --- | --- | --- | --- |
| 1 | **Move budget into Email and Google Ads**, trim Walk-in Promo, Local Events and Facebook | Email 10.77x vs Walk-in 1.02x | +17.9% attributed revenue at ₱30k; +20.1% at current spend |
| 2 | **Use weekday packages and a targeted −7% rate** | Occupancy 37.5%, below the 40–55% comfort zone | Occupancy toward 40% and higher RevPAR; weekends untouched |
| 3 | **Add a check-in coffee / breakfast bundle** | 58.8% attach leaves 41.2% of room guests unmonetised | ≈ ₱1,547 extra cafe revenue per month at +15 pp |
| 4 | **Feature Chicken Adobo Rice Bowl in a bundle** | Top cafe product at ₱54,780 | Higher average cafe ticket |
| 5 | **Schedule 2 staff at the weekend peak** | 7.3 transactions/day, Saturday busiest | Faster service with controlled labour cost |

**Bottom line.** Cascadja does not need a bigger marketing budget first — it needs a better mix. Reallocating the existing budget, filling weekday rooms, and converting room guests into cafe customers address the three biggest gaps the data exposes. At a ₱30,000 budget the combined plan projects **₱209,705** monthly revenue and **₱37,403** profit, with a clear measurement path for each action.

---

## 6. Limitations and next steps

1. **Simulated data.** The dataset is a realistic simulation built for the capstone, not audited financial data. The schema and analytics are ready for real exports.
2. **Attribution.** Marketing revenue uses the last-click style attribution recorded in the campaign table. A production system should add multi-touch attribution.
3. **Sample size.** Twelve monthly observations are enough for a simple regression but limit statistical power. More history would allow seasonality, confidence intervals and holdout validation.
4. **Assumptions.** The prescriptive model assumes a fixed room-rate elasticity of −1.1 and a fixed monthly operating cost of ₱58,000; both should be replaced with finance data.
5. **Next steps.** Connect real POS and booking exports; add a customer-lifetime-value model; run a small controlled experiment on the proposed bundles and weekday package; add a proper demand forecast with seasonality.

---

## 7. Conclusion

The capstone shows the full analytics chain in one working system: a normalised five-variable database, a React dashboard, a transparent predictive model, and a prescriptive simulator that turns the model into budget and pricing decisions. The analysis answers the original question with a clear plan: **protect the room business, rebalance marketing toward the channels that return the most per peso, and bring the cafe into the guest journey.** The same system recalculates every figure when the database is re-seeded or the sliders move, so the recommendations remain testable rather than static.

---

## Appendix A — Monthly performance

| Month | Revenue | Marketing spend | Occupancy | Conversions |
| --- | ---: | ---: | ---: | ---: |
| Nov 2025 | ₱224,495 | ₱32,200 | 43.3% | 103 |
| Dec 2025 | ₱232,825 | ₱32,800 | 41.1% | 94 |
| Jan 2026 | ₱160,465 | ₱21,400 | 30.6% | 68 |
| Feb 2026 | ₱188,300 | ₱19,600 | 38.4% | 57 |
| Mar 2026 | ₱218,655 | ₱39,600 | 38.7% | 112 |
| Apr 2026 | ₱188,410 | ₱23,400 | 30.0% | 69 |
| May 2026 | ₱161,320 | ₱20,600 | 29.0% | 64 |
| Jun 2026 | ₱207,815 | ₱31,600 | 36.7% | 102 |
| Jul 2026 | ₱178,750 | ₱24,000 | 31.5% | 73 |
| Aug 2026 | ₱249,605 | ₱37,900 | 45.2% | 120 |
| Sep 2026 | ₱193,900 | ₱22,500 | 35.8% | 73 |
| Oct 2026 | ₱257,070 | ₱39,700 | 49.2% | 121 |
| **Total** | **₱2,461,610** | **₱345,300** | **37.5% avg** | **1,056** |

## Appendix B — Room mix

| Room type | Room-nights | Revenue | ADR |
| --- | ---: | ---: | ---: |
| Garden View Room | 189 | ₱453,600 | ₱2,400 |
| Deluxe King Room | 122 | ₱390,400 | ₱3,200 |
| Budget Single Room | 179 | ₱286,400 | ₱1,600 |
| Family Suite | 57 | ₱239,400 | ₱4,200 |
| **Total** | **547** | **₱1,369,800** | **₱2,504** |

## Appendix C — Top cafe products

| Product | Category | Units | Revenue |
| --- | --- | ---: | ---: |
| Chicken Adobo Rice Bowl | Food | 249 | ₱54,780 |
| Club Sandwich | Food | 170 | ₱44,200 |
| Spanish Latte | Coffee | 220 | ₱42,900 |
| Cappuccino | Coffee | 207 | ₱36,225 |
| Latte | Coffee | 189 | ₱34,020 |
| Fish & Chips | Food | 106 | ₱33,920 |
| Chicken Pesto Pasta | Food | 119 | ₱33,320 |
| Chicken Wings | Food | 114 | ₱33,060 |
| Pork Sisig | Food | 127 | ₱33,020 |
| Carbonara | Food | 119 | ₱32,130 |

## Appendix D — Reproducing the results

```bash
# Demo mode (no database required)
npm install
npm run dev            # dashboard at http://localhost:5173

# Neon Postgres
copy server\.env.example server\.env    # paste your Neon connection string
npm run db:setup       # creates the 5 tables and seeds 8,268 rows
npm run dev            # badge switches to "Neon Postgres"

# Production
npm run build
npm start              # dashboard + API at http://localhost:4000
```

The dataset seed is **`20261106`**. All figures in this document come from that seed and are recomputed live by `/api/descriptive`, `/api/predictive` and `/api/prescriptive`.

---

*Prepared for the Database Systems / Business Analytics capstone · Cascadja Cafe · 2026*
