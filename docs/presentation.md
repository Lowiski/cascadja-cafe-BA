# Presentation Outline

A 10–12 slide walkthrough for the Cascadja Foods and Drinks capstone defence. Each slide maps to a page in the app.

## Slide 1 — Title
**From gut feel to a data-backed café plan** — Cascadja Foods and Drinks, Kasadya Park & Play, Cordova, Cebu. Presenter, date, course.

## Slide 2 — The real business
Walk-in students, study groups and local visitors plus Foodpanda delivery. Espresso, frappes, milkteas, rice meals, pasta, snacks, desserts and ₱10/₱35 add-ons. Prices ₱90–₱245. *Source: `docs/project-overview.md`.*

## Slide 3 — Question and objectives
Central question, four objectives, and the data-honesty statement: real menu, generated sample transactions. Promise: every chart recalculates from the rows.

## Slide 4 — Data and architecture
Five required variables plus channel; 3,083 lines / 1,988 orders. ERD from `docs/database-erd.md`. React → Express → Neon Postgres with deterministic fallback.

## Slide 5 — Descriptive highlights
₱693,155 sales · ₱349 average order · 28% add-on attach · ★ bestsellers 39.9% of sales. *Open: Overview.*

## Slide 6 — What sells, when
Rice Meal leads at 20.7%; Garlic Pepper Beef is the top item; Morning is the largest daypart; Sunday is busiest. *Open: Analytics, Menu, Sales records.*

## Slide 7 — Channel reality
Dine-in 68.4% vs Foodpanda 31.6%. Explain why channel was added as a sixth variable and why it changes the recommendations.

## Slide 8 — Predictive model
Weekday seasonal average; weekend ₱2,284/day vs weekday ₱1,744/day. R² 0.157, MAPE 30.7%, next week ₱13,287 ± ₱1,224. Be honest about the modest fit. *Open: Forecasting.*

## Slide 9 — Prescriptive actions
Bestseller combos, add-on prompts toward 30%, Foodpanda growth, balanced menu pairing, and daypart staffing. *Open: Recommendations.*

## Slide 10 — Live scenario
Move the attach and delivery sliders. Show projected sales (₱89,891 at the default scenario), assumed 36% variable cost, ₱28,000 fixed cost, and estimated profit ₱29,530.

## Slide 11 — Limitations and next steps
Sample transactions, no real costs yet, no promotions/holidays/weather. Next: POS + Foodpanda exports, real COGS, category-level forecast, experiments.

## Slide 12 — Conclusion and demo
Integrate → describe → predict → prescribe → act. Keep the Data Explorer open for ad-hoc verification.

---

Print the in-app **Case study** page (`/case-study`) to PDF as a handout, or use [`CASE_STUDY.md`](../CASE_STUDY.md) for the full write-up.
