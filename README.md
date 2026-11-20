# Cascadja Foods and Drinks — Business Analytics Capstone

A working React + Express + Neon Postgres dashboard built around the **real Cascadja menu** at Kasadya Park & Play, Cordova, Cebu — with a clearly labelled generated sample transaction set.

> **Data honesty:** item names, categories, prices and ★ bestseller flags are real, transcribed from the owner's menu photos. The 3,083 transaction lines are deterministic **generated sample data** (seed `20261120`) because no POS/Foodpanda export was supplied. Replace `sales_fact` with real exports before presenting final numbers.

Short reference documents live in [`docs/`](./docs/): [project overview](./docs/project-overview.md), [analytics process](./docs/business-analytics-process.md), [database ERD](./docs/database-erd.md) and [presentation outline](./docs/presentation.md). The full write-up is [`CASE_STUDY.md`](./CASE_STUDY.md).

## 1. The business question

How should Cascadja use what it actually sells — at real prices of ₱90–₱245 — to grow sales from both walk-in and Foodpanda customers?

The dashboard follows **descriptive → predictive → prescriptive**:

- **Descriptive:** sales by item, category, daypart and channel; bestsellers; add-on attach.
- **Predictive:** weekday seasonal forecast with an honest residual band.
- **Prescriptive:** add-on prompts, Foodpanda bundles and daypart staffing, with a live scenario simulator.

## 2. Variables

| Required variable | Field |
| --- | --- |
| Time | `order_date` + `daypart` |
| Product | `product_category` |
| Price | `item_price` |
| Volume | `quantity_sold` |
| Revenue | `total_sales` |
| Added because it is real | `channel` (Dine-in / Foodpanda) |

Rooms, loyalty customers and marketing campaigns from the earlier fictional version are **not active**. Their files are kept as `*-legacy` references.

## 3. Stack

- **Frontend:** React 18, Vite 6, React Router 6, Chart.js 4
- **Backend:** Node.js, Express 4, `pg`, Neon Postgres
- **Repo:** npm workspaces (`frontend`, `backend`) with `concurrently`

## 4. Run locally

```bash
npm install
npm run dev        # API :4000, dashboard :5173
npm run build      # production bundle into frontend/dist
npm start          # Express serves API + built dashboard on :4000
```

On Windows PowerShell, use `npm.cmd` if `npm.ps1` is blocked by the execution policy.

### Admin access (local)

The whole dashboard is behind a sign-in page at `/login`. Only the admin account can add menu items and sales.

```bash
# backend/.env (defaults for local capstone use — change before deploying)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=cascadja2026
AUTH_SECRET=replace-with-a-long-random-string
```

`POST /api/auth/login` returns an HMAC-signed token valid for 8 hours. The browser keeps it in `localStorage` and sends it as `Authorization: Bearer <token>` on every request. Wrong credentials, expired tokens and missing tokens get `401`; the UI clears the token and returns to `/login`. Use **Sign out** in the sidebar to end the session.

Read-only analytics endpoints are public to the signed-in app. The two write endpoints require the admin token and always persist to Neon; they never pretend a generated sample row was saved. If `DATABASE_URL` is missing, writes return `503`.

### Database setup (optional)

The app runs without a database. To use Neon:

```bash
cp backend/.env.example backend/.env   # macOS / Linux
copy backend\.env.example backend\.env  # Windows
# paste your Neon DATABASE_URL into backend/.env
npm run db:setup   # creates active schema then seeds 59 menu items, 6 add-ons, 3,083 sales rows
```

`db:setup` drops/recreates only the active tables (`menu_items`, `addons`, `sales_fact`). The old legacy tables are untouched. `backend/.env` is git-ignored — never commit a real connection string.

## 5. Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start API and Vite dev server together |
| `npm run build` | Build React into `frontend/dist` |
| `npm start` | Serve API + built dashboard on port 4000 |
| `npm run db:init` | Create active database schema |
| `npm run db:seed` | Seed active tables from the real-menu generator |
| `npm run db:setup` | `db:init` + `db:seed` |

From `backend/`, `node scripts/generate-seed-sql.mjs` regenerates `database/seed.sql`.

## 6. API

| Endpoint | Purpose | Auth |
| --- | --- | --- |
| `GET /api/health` | API + database status | — |
| `GET /api/meta` | data mode, counts and variable list | — |
| `GET /api/descriptive` | all descriptive aggregates | — |
| `GET /api/predictive` | weekday forecast + model diagnostics | — |
| `GET|POST /api/prescriptive` | scenarios, recommendations, staffing | — |
| `GET /api/menu` | full real menu + add-ons | — |
| `GET /api/sales-data` | paginated sales fact table | — |
| `GET /api/data/menu` | paginated menu table | — |
| `POST /api/auth/login` | exchange admin username/password for an 8-hour token | — |
| `GET /api/auth/me` | verify the current token | Bearer |
| `POST /api/menu` | insert a new menu item into Neon | Bearer (admin) |
| `POST /api/sales` | insert a new sold line into Neon | Bearer (admin) |

Sample scenario:

```bash
curl -X POST http://localhost:4000/api/prescriptive \
  -H "Content-Type: application/json" \
  -d '{"attachTargetPct":30,"foodpandaGrowthPct":15}'
```

Admin write example:

```bash
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"cascadja2026"}' | node -pe "JSON.parse(require('fs').readFileSync(0)).token")

curl -X POST http://localhost:4000/api/sales \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"order_date":"2026-11-20","daypart":"Morning","channel":"Dine-in","item_name":"Americano","product_category":"Coffee","item_price":140,"quantity_sold":2,"addon_name":"","addon_amount":0}'
```

## 7. Project structure

```
cascadja-cafe/
├── package.json                 # workspaces: frontend + backend
├── README.md
├── CASE_STUDY.md                # standalone written capstone
├── docs/                        # overview, BA process, ERD, presentation
├── database/                    # schema.sql, seed.sql, views.sql (+ legacy copies)
├── frontend/
│   ├── index.html
│   ├── vite.config.js
│   ├── public/logo.png
│   └── src/
│       ├── main.jsx  App.jsx
│       ├── index.css  assets/styles/
│       ├── components/          # common/, charts/, forms/, RequireAuth.jsx
│       │                        # forms/ includes MenuForm.jsx + SaleForm.jsx
│       ├── layouts/             # DashboardLayout.jsx
│       ├── hooks/               # useFetch.js
│       ├── services/            # api, authService, analytics, product, order
│       └── pages/               # Login, Dashboard, Analytics, Forecasting,
│                                # Recommendations, Products, Orders,
│                                # DataExplorer, CaseStudy (+ legacy pages)
└── backend/
    ├── .env.example
    ├── scripts/                 # init-db, seed, generate-seed-sql (+ legacy)
    └── src/
        ├── app.js  server.js
        ├── config/database.js   # pg pool, Neon SSL, DATE parser
        ├── store.js             # real-menu sample data + Neon sales_fact loader
        ├── analytics.js         # previous engine, kept as reference
        ├── services/            # cafeAnalytics, data query + writeService
        ├── controllers/         # request handlers
        ├── routes/              # auth + one router per resource
        ├── middleware/          # async wrap, error handler, requireAdmin
        ├── utils/               # calculations + auth token helpers
        └── data/                # generateRealData.js (+ legacy generator)
```

## 8. Troubleshooting

| Problem | Fix |
| --- | --- |
| Port 4000 already in use | Stop the other process (`Get-NetTCPConnection -LocalPort 4000`) or set `PORT` in `backend/.env` |
| API dies after 2 minutes / 1 hour in an IDE or agent | The tool kills long-running background tasks on a timeout. Run `npm start` in your own terminal and leave it open, or use PM2: `npm i -g pm2 && pm2 start backend/src/server.js --name cascadja-api`. On Windows you can also launch it detached with `Start-Process node -ArgumentList 'src/server.js' -WorkingDirectory backend -WindowStyle Hidden` after setting `PORT`. |
| Badge says "Sample data" | Expected until a Neon `sales_fact` table exists; run `npm run db:setup` |
| `db:setup` fails | Confirm `DATABASE_URL` includes `sslmode=require` and that `backend/.env` exists |
| Redirected to `/login` | Token missing/expired, or wrong credentials; check `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `backend/.env` |
| Write returns `503` | `DATABASE_URL` is missing — add it and run `npm run db:setup` |
| Add form shows a stale count | Hard-refresh the page; API responses use `no-store` and cache-busting query keys |
| Old inn/campaign pages missing | Intentional — they are preserved as `*-legacy` files, not active routes |
