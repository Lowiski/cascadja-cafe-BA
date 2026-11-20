# Business Analytics Process

The project follows a step-wise BA process: the outputs of each stage become the inputs of the next. The full narrative is in [`CASE_STUDY.md`](../CASE_STUDY.md), sections 1 and 3.

## 1. Problem background

Decisions at Cascadja were made by habit: marketing was split across seven channels "because that is how it has always been done", and room rates were set annually without checking occupancy. Observed marketing returns range from about **₱1.02 to ₱10.77 per ₱1 spent**, and only about **58.8%** of room stays include a cafe purchase even though rooms produce **55.6%** of revenue.

**Central question:** how should the business allocate marketing budget and price rooms, and what revenue can it expect next quarter?

**Objectives:** integrate five variables into one database, describe performance, forecast revenue and occupancy, and turn the findings into actionable recommendations with estimated impact.

## 2. Data collection and integration

Five variables (customers, products, marketing campaigns, transactions, sales line items) were designed as a single PostgreSQL schema with foreign keys, then loaded into Neon. The same generator powers the offline demo, so switching data sources never changes the numbers.

## 3. Descriptive — what happened?

Computed in `backend/src/analytics.js` and served by `/api/descriptive`:

- monthly revenue, transactions, average order, margin and marketing spend;
- channel, category and product revenue mixes;
- customer segment, city, payment method and day-of-week behaviour;
- room nights, occupancy, ADR, RevPAR, room share and room-to-cafe attach rate;
- marketing ROI, CTR, CVR, CPA and revenue per conversion by channel.

## 4. Predictive — what will happen?

Served by `/api/predictive`:

- ordinary least-squares regression: `Revenue = intercept + slope × Marketing spend`;
- reported model diagnostics: R², n, MAPE, RMSE and residual standard deviation;
- actual vs fitted values, a 3-month forecast with a ±1.96σ band, and a damped 3-month moving-average occupancy forecast;
- correlations between revenue and spend, conversions, transactions, room nights, new customers and occupancy.

## 5. Prescriptive — what should be done?

Served by `/api/prescriptive` (GET with query parameters or POST with a JSON body):

- ROI-weighted budget allocation with per-channel minimums and maximums and diminishing-returns adjustment;
- room-rate recommendation driven by an occupancy rule and assumed elasticity of −1.1;
- whole-business scenario: projected revenue, COGS, fixed cost, estimated profit and margin, occupancy and ADR;
- five recommendations covering marketing mix, room pricing, cafe cross-sell, staffing and menu focus.

## 6. Step-wise connections

1. The **descriptive** marketing ROI table identifies which channels deserve more spend.
2. Those ROI/CPA figures feed the **prescriptive** allocator; the regression from the **predictive** stage supplies the total-revenue baseline for the scenario.
3. Descriptive occupancy and attach rate drive the pricing and cross-sell rules.
4. The dashboard exposes the chain as three linked pages, with the data explorer beneath them so every number can be traced to a row.
