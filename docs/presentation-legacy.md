# Presentation Outline

A 10–12 slide walkthrough for the Cascadja Cafe capstone defence. Each slide maps to a page or document in this repository.

## Slide 1 — Title
**From gut feel to a data-backed plan** — Cascadja Cafe Business Analytics Capstone. Presenter, date, course.

## Slide 2 — The problem
Seven marketing channels funded by habit; room rates set once a year. Marketing returns span roughly ₱1.02–₱10.77 per ₱1, while only ~58.8% of room stays include a cafe purchase and rooms supply ~55.6% of revenue. *Source: `docs/business-analytics-process.md`.*

## Slide 3 — Questions and objectives
Central question, four objectives, scope (12-month window, five variables). Live demo promise: everything recalculates from the database.

## Slide 4 — Data and architecture
Five integrated tables and row counts; diagram from `docs/database-erd.md`. Architecture: React → Express → Neon Postgres, with a deterministic demo fallback and reporting views.

## Slide 5 — Descriptive results
Lead KPIs (revenue, ~59.8% gross margin, transactions, active/repeat customers), monthly revenue vs spend chart, channel and category mixes. *Open: Overview + Analytics pages.*

## Slide 6 — Customers and operations
Segment/city/payment/day-of-week charts; busiest day and attach-rate insight. *Open: Customers / Transactions pages.*

## Slide 7 — Predictive model
Regression equation, R²/MAPE/RMSE, actual vs fitted, three-month revenue forecast with confidence band, occupancy forecast, driver correlations. *Open: Forecasting page.*

## Slide 8 — Prescriptive recommendations
Budget reallocation table, suggested room rate and elasticity rationale, attach-rate and staffing actions. *Open: Recommendations page.*

## Slide 9 — Live scenario
Move the monthly-budget and room-rate sliders; show projected revenue, profit and margin changing. Explain the fixed-cost and COGS assumptions.

## Slide 10 — Expected impact
Projected attributed-revenue lift from the optimised mix, estimated monthly profit under the recommended scenario, and the qualitative service benefits.

## Slide 11 — Limitations and next steps
Attribution is last-click; elasticity and fixed costs are assumptions; no seasonality models or experiments yet. Next: campaign-level experiments, rolling retraining, inventory-level forecasting.

## Slide 12 — Conclusion and demo
Recap the chain: integrate → describe → predict → prescribe → act. Invite questions; keep the Data Explorer open for ad-hoc verification.

---

Print the in-app **Case study** page (`/case-study`) to PDF as a handout, or use [`CASE_STUDY.md`](../CASE_STUDY.md) for the full write-up.
