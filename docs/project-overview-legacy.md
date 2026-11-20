# Cascadja Cafe — Project Overview

Cascadja Cafe is a coffee shop, restaurant and four-room inn. This capstone replaces intuition-led decisions with a working, data-backed analytics system covering the full chain: **descriptive → predictive → prescriptive**.

The application reads five integrated data variables from Neon Postgres (or from an identical deterministic demo dataset when no database is configured):

| Variable | Rows | Role |
| --- | --- | --- |
| `customers` | 250 | Loyalty profiles, segment, city, join date |
| `products` | 60 | Cafe menu + 4 room types, price and unit cost |
| `transactions` | 2,769 | Visit/stay headers, channel, payment, status |
| `sales` | 5,105 | Line items linking transactions to products |
| `marketing_campaigns` | 84 | Spend, reach, conversions, attributed revenue |

## Central question

How should Cascadja allocate its marketing budget and price its rooms to maximise revenue, and what revenue should it expect next quarter?

## Highlights

- **Descriptive:** revenue, channel mix, product/category mix, segments, payments, day-of-week and marketing efficiency. Gross margin ≈ **59.8%**; rooms contribute ≈ **55.6%** of revenue.
- **Predictive:** simple linear regression of monthly revenue on marketing spend, a 3-month revenue forecast with residual bands, an occupancy forecast and driver correlations.
- **Prescriptive:** ROI-weighted monthly budget optimiser, an elasticity-aware room-rate rule, a live scenario P&L (budget and rate sliders) and five prioritised recommendations.
- **Dashboard:** interactive Chart.js visuals, searchable/sortable/paginated data tables, an add-customer form that writes to the database, and a printable case-study page.

## Repository layout

```
cascadja-cafe/
├── frontend/     React + Vite dashboard (components, pages, services, hooks)
├── backend/      Express API (controllers, routes, services, middleware, utils)
├── database/     schema.sql, seed.sql, views.sql
├── docs/         overview, analytics process, ERD, presentation
├── CASE_STUDY.md full written capstone
└── README.md     setup and usage
```

## Technology

React 18 · Vite 6 · React Router 6 · Chart.js 4 · Node.js · Express 4 · Neon Postgres (`pg`) · npm workspaces.

## Running it

```bash
npm install
npm run dev        # API :4000, dashboard :5173
npm run build      # production bundle into frontend/dist
npm start          # Express serves API + built dashboard on :4000
```

On Windows PowerShell, use `npm.cmd` if `npm.ps1` is blocked by the execution policy.

Full narrative: [`CASE_STUDY.md`](../CASE_STUDY.md).
