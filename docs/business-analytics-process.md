# Business Analytics Process

The project follows the step-wise chain **describe → predict → prescribe**. Every number in the app is recomputed from the active `sales_fact` rows or the deterministic sample dataset.

## 1. Problem background

Cascadja is a real café in Cordova with a broad menu and two very different sales channels. The decision problem is practical: which items, dayparts and channels deserve attention, and what small operational changes can raise sales?

**Objectives**

1. Integrate at least 50 records across the five required variables.
2. Describe what sells, when, and through which channel.
3. Forecast near-term daily sales.
4. Recommend concrete actions on add-ons, delivery and staffing.

## 2. Data collection and integration

The real menu supplies item names, categories, hot/iced prices and bestseller flags. Because no transaction export was available, 3,083 deterministic sample lines were generated with the same prices, realistic daypart/channel behaviour, quantities and add-on rules. The same generator powers the app, `database/seed.sql`, and the docs.

Channel was added as a sixth field because dine-in and Foodpanda really are different operations. Rooms, loyalty points and marketing campaigns were removed from the active app because they do not describe this business.

## 3. Descriptive — what happened?

Served by `/api/descriptive`:

- KPIs: ₱693,155 sales, 1,988 orders, ₱349 average order, 4,086 units, 28% add-on attach.
- Sales by real menu category: **Rice Meal 20.7%**, Snacks, then the coffee/frappe groups.
- Top items: **Garlic Pepper Beef** leads; ★ bestsellers produce **39.9%** of sales.
- Dayparts: **Morning** is largest (27.9%); Sunday is the busiest weekday.
- Channels: **Dine-in 68.4%**, **Foodpanda 31.6%**.
- Mix: food **59.5%**, drinks **40.5%**; add-ons contribute **₱19,090**.

## 4. Predictive — what will happen?

Served by `/api/predictive`.

The forecast uses a **weekday seasonal average**: each future day is predicted from the average sales of that same weekday. Weekend days average ₱2,284 versus ₱1,744 on weekdays, so the weekly rhythm is more useful than a straight calendar-day line.

- Model R² **0.157**, MAPE **30.7%**, RMSE **₱618** over 365 daily observations.
- Next seven days: **₱13,287**, with a ±**₱1,224** residual band.
- A linear trend is reported only as a reference; it explains very little (R² ≈ 0.003) and is not the forecast basis.

The low R² is reported honestly: no promotions, holidays, weather or campaign data are in the dataset yet.

## 5. Prescriptive — what should be done?

Served by `/api/prescriptive` (GET with query parameters or POST with a JSON body). The live dashboard uses sliders for `attachTargetPct` and `foodpandaGrowthPct`.

- **Bestseller combos:** feature Garlic Pepper Beef and other ★ items on the board and Foodpanda.
- **Add-on prompts:** move attach from 28% toward the target with counter scripts and delivery notes.
- **Delivery growth:** grow Foodpanda from its ₱218,725 base with photos, bundles and slow-day promos.
- **Menu balance:** protect the 59.5% food / 40.5% drink mix with lunch pairings.
- **Daypart staffing:** move people into Morning and trim the quietest period.

At the default scenario (30% attach, +15% delivery), projected monthly sales are **₱89,891**. With assumed 36% variable cost and ₱28,000 fixed cost, estimated profit is **₱29,530** at a **32.9%** margin. These cost assumptions are explicitly labelled and must be replaced with the owner's real numbers.

## 6. Step-wise connections

1. Descriptive add-on attach and the leading add-on feed the upsell recommendation.
2. Descriptive channel revenue feeds the Foodpanda growth scenario.
3. Descriptive daypart orders feed the staffing rule.
4. The predictive weekday pattern tells the owner what a normal week looks like before any action.
5. The Data Explorer exposes the exact rows behind all three stages.
