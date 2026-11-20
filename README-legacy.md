# Cascadja Cafe — Business Analytics Capstone

A complete, working business-analytics program for **Cascadja Cafe**, a coffee shop + restaurant with a four-room inn. It covers the full analytics chain — **descriptive → predictive → prescriptive** — in an interactive React dashboard backed by an Express API and a Neon Postgres database.

The written capstone is available both in the app (**Case study** page, printable to PDF) and as a standalone document: [`CASE_STUDY.md`](./CASE_STUDY.md). Short reference documents live in [`docs/`](./docs/): [project overview](./docs/project-overview.md), [analytics process](./docs/business-analytics-process.md), [database ERD](./docs/database-erd.md) and [presentation outline](./docs/presentation.md).

---

## 1. Problem in one paragraph

Cascadja Cafe has grown, but its decisions are still made by intuition: marketing is split across seven channels "because that is how it has always been done", and room rates are set once a year without checking occupancy. Marketing returns range from **₱1.02 to ₱10.77 per ₱1 spent**, and only **58.8%** of room stays include a cafe purchase even though rooms produce **55.6%** of revenue. The capstone asks: *how should Cascadja allocate its marketing budget and price its rooms to maximise revenue, and what revenue should it expect next quarter?*

---

## 2. Requirement checklist

| Capstone requirement | Where it is delivered |
| --- | --- |
| Problem background | `README.md` §1, **Overview** page, `CASE_STUDY.md` §1 |
| 5 data variables, ≥50 records each | `customers` **250**, `sales` **5,105**, `transactions` **2,769**, `products` **60**, `marketing_campaigns` **84** |
| Descriptive analytics | **Descriptive** page — revenue, channels, products, segments, payments, day-of-week, marketing efficiency |
| Predictive analytics | **Predictive** page — linear regression, 3-month forecast, occupancy forecast, driver correlations |
| Prescriptive analytics | **Prescriptive** page — budget optimizer, room-rate rule, live scenario P&L, recommendations |
| Step-wise connections | `CASE_STUDY.md` §3.4, **Case study** page section 04 |
| Interactive graphical dashboard | 16 Chart.js charts, two live sliders, searchable/sortable tables, add-customer form |
| Database integration | 5-table PostgreSQL schema, seed scripts, REST API, **Data explorer** page |
| Written capstone / case study | `CASE_STUDY.md` + in-app printable **Case study** page |

---

## 3. Tech stack

- **Frontend:** React 18, Vite 6, React Router 6, Chart.js 4 + react-chartjs-2
- **Backend:** Node.js, Express 4
- **Database:** Neon Postgres (via `pg`)
- **Monorepo:** npm workspaces (`frontend`, `backend`) with `concurrently`

---

## 4. Quick start (no database required)

The API ships with a **deterministic demo dataset** (seed `20261106`) so the whole app runs before Neon is connected. The same generator seeds the real database, so the numbers never change when you switch.

```bash
cd cascadja-cafe
npm install
npm run dev
```

Open **http://localhost:5173**. The API runs on **http://localhost:4000** and Vite proxies `/api` to it. The badge in the top bar reads **Demo data** until `DATABASE_URL` is configured.

> **Windows PowerShell note:** if `npm` is blocked by the execution policy (`npm.ps1 cannot be loaded`), run commands through Command Prompt with `cmd /c "npm run dev"`, or use `npm.cmd run dev`.

### Production build (single service)

```bash
npm run build
npm start
```

Express serves `frontend/dist` and the API together at **http://localhost:4000**.

---

## 5. Connect Neon Postgres

1. Create a free project at [neon.tech](https://neon.tech).
2. In the Neon dashboard choose **Connect** and copy the connection string. It looks like:
   ```
   postgresql://neondb_owner:XXXX@ep-cool-name-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
3. Copy the example environment file and paste the string:
   ```bash
   copy backend\.env.example backend\.env      # Windows
   # cp backend/.env.example backend/.env       # macOS / Linux
   ```
   ```env
   DATABASE_URL=postgresql://...sslmode=require
   PORT=4000
   CLIENT_URL=http://localhost:5173
   ```
4. Create the tables and load the dataset:
   ```bash
   npm run db:setup
   ```
   This **drops and recreates** the five app tables, then inserts every row. It is destructive by design so the demo can be reset at any time.
5. Start the app. The badge switches to **Neon Postgres**, and the Data explorer writes new customers straight to the database.

`backend/.env` is git-ignored. Never commit a real connection string.

---

## 6. Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs Express (`:4000`) and Vite (`:5173`) together with hot reload |
| `npm run build` | Builds the React app into `frontend/dist` |
| `npm start` | Starts Express only; serves the built app if it exists |
| `npm run db:setup` | Creates the schema **and** seeds the dataset |
| `npm run db:init` | Creates the schema only (destructive) |
| `npm run db:seed` | Truncates and re-seeds the tables |

---

## 7. Project structure

```
cascadja-cafe/
├─ package.json                 # workspaces: frontend + backend
├─ README.md
├─ CASE_STUDY.md                # standalone written capstone
├─ docs/                        # overview, BA process, ERD, presentation outline
├─ database/                    # schema.sql, seed.sql, views.sql
├─ frontend/
│  ├─ index.html
│  ├─ vite.config.js            # dev server + /api proxy
│  ├─ public/logo.png
│  └─ src/
│     ├─ main.jsx  App.jsx      # router + entry point
│     ├─ index.css              # imports assets/styles
│     ├─ assets/                # images, global.css, variables.css
│     ├─ components/            # common/, charts/, forms/
│     ├─ layouts/               # DashboardLayout.jsx
│     ├─ hooks/                 # useFetch.js
│     ├─ services/              # api, customer, product, order, analytics
│     └─ pages/                 # Dashboard, Analytics, Forecasting,
│                               # Recommendations, data pages, CaseStudy
└─ backend/
   ├─ .env.example
   ├─ scripts/                  # init-db, seed, generate-seed-sql
   └─ src/
      ├─ app.js  server.js      # Express app + boot
      ├─ config/database.js     # pg pool, Neon SSL, DATE parser
      ├─ store.js               # Neon/demo data loading + add customer
      ├─ analytics.js           # original analytics engine (preserved)
      ├─ services/              # focused analytics + data query services
      ├─ controllers/           # request handlers
      ├─ routes/                # one router per resource
      ├─ middleware/            # async wrap + error handler
      ├─ utils/                 # calculations
      └─ data/generate.js       # deterministic dataset (seed 20261106)
```

---

## 8. Database design

```
customers 1 ───< transactions 1 ───< sales >─── 1 products
                                   sales.product_id = products.id
marketing_campaigns  (joined to revenue by month + channel)
```

| Variable | Table | Key fields |
| --- | --- | --- |
| Customers | `customers` | `segment`, `city`, `joined_at`, `loyalty_points` |
| Sales | `sales` | `transaction_id`, `product_id`, `quantity`, `line_total` |
| Transactions | `transactions` | `customer_id`, `channel`, `payment_method`, `status`, `total_amount` |
| Products | `products` | `category`, `unit_price`, `unit_cost`, `is_room` |
| Marketing | `marketing_campaigns` | `channel`, `spend`, `clicks`, `conversions`, `revenue_attributed` |

Dataset coverage: **12 months, Nov 2025 – Oct 2026**. Walk-in guests have `customer_id = NULL`; 4 rooms give 1,460 available room-nights for the year.

---

## 9. API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/health` | API status, demo/Neon mode, database ping |
| `GET` | `/api/meta` | Mode, company, currency, record counts per variable |
| `GET` | `/api/descriptive` | All descriptive analytics (KPIs, monthly, channel, product, segment, marketing tables) |
| `GET` | `/api/predictive` | Regression model, fit, 3-month forecast, occupancy forecast, drivers |
| `GET` | `/api/prescriptive?monthlyBudget=&rateChangePct=` | Scenario analysis via query string |
| `POST` | `/api/prescriptive` | Same, with JSON body `{ "monthlyBudget": 30000, "rateChangePct": -5 }` |
| `GET` | `/api/data/:table` | Paged, searchable, sortable rows for `customers`, `products`, `marketing`, `transactions`, `sales` |
| `POST` | `/api/customers` | Inserts a loyalty customer (used by the add-customer modal) |

`/api/data/:table` accepts `page`, `pageSize` (5–100), `search`, `sort`, and `dir` (`asc`/`desc`).

---

## 10. Analytics models

### Descriptive
Everything is computed from the five tables, not hard-coded: revenue and gross margin, monthly roll-up, average order value, channel/category/segment/city/payment mix, day-of-week demand, room occupancy and ADR/RevPAR, repeat rate, campaign CTR/CVR/CPA/ROI.

### Predictive
Simple linear regression of **monthly revenue on monthly marketing spend** (12 observations):

```
Revenue = 97,773 + 3.73 × Marketing spend
R² = 0.803   MAPE = 6.2%   RMSE = ₱13,626
```

Every extra ₱1,000 of monthly spend is associated with ~₱3,731 of revenue. Next-quarter forecast: **₱226.0k (Nov)**, **₱229.8k (Dec)**, **₱233.8k (Jan)**; occupancy is projected with a damped three-month trend (**48.9% → 59.9%**).

### Prescriptive
1. **Budget optimizer** — keeps the total budget fixed, weights each channel by measured ROI, applies per-channel minimum/maximum caps, then accounts for diminishing returns as a channel scales.
2. **Room-rate rule** — reads occupancy and applies an elasticity of **−1.1**; at 37.5% occupancy it recommends **₱2,329 ADR (−7%)** with weekday packages.
3. **Scenario P&L** — uses the regression as the revenue baseline and splits revenue by the historical cafe/room mix; COGS 40.2%, fixed cost ₱58,000/month, marketing = selected budget.
4. **Action rules** — cafe attach-rate bundle, staffing from transactions/day, and featuring the top product.

Base scenario (**₱30,000** budget, no rate change): projected revenue **₱209,705**, profit **₱37,403** (17.8% margin), attributed-revenue lift **+17.9%** at the same spend. At the current average spend of ₱28,775 the lift is **+20.1%**.

---

## 11. Demo mode vs Neon

- **No `DATABASE_URL`** → the API generates the dataset in memory with seed `20261106`. Reads and writes work; data resets when the server restarts.
- **`DATABASE_URL` set** → the API reads the five Neon tables. `POST /api/customers` commits to Postgres.
- The analytics engine is identical in both modes, so screenshots and the case study match the seeded database exactly.

To re-seed at any time: `npm run db:setup`.

---

## 12. Assumptions and limitations

- The dataset is a **realistic simulation** built for the capstone, not audited financial data. The schema and analytics are ready for real POS/booking exports.
- Marketing revenue uses the **last-click style** attribution recorded in `marketing_campaigns`.
- Twelve monthly observations support a simple regression but limit statistical power; seasonality is not explicitly modelled.
- Room-rate elasticity is fixed at **−1.1**; fixed monthly operating cost is estimated at **₱58,000**.
- All amounts are in **PHP (₱)**.

---

## 13. Troubleshooting

| Symptom | Fix |
| --- | --- |
| `npm.ps1 cannot be loaded` | Use `cmd /c "npm run dev"` or `npm.cmd run dev` |
| Port 4000 already in use | Stop the other process (`Get-NetTCPConnection -LocalPort 4000`) or set `PORT` in `backend/.env` |
| Dashboard shows "Could not load the analytics" | Start the API: `npm run dev` (or `npm start`) |
| Badge still says "Demo data" | `backend/.env` is missing `DATABASE_URL`, or the server was not restarted |
| `db:setup` fails | Confirm `DATABASE_URL` includes `sslmode=require` and that `backend/.env` exists |
| Blank page at `:4000` after changes | Rebuild with `npm run build` |

For the printable submission, open **Case study → Print / save PDF** (print styles hide the sidebar and top bar).
