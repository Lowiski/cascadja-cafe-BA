import { api } from '../api.js';
import { useApi } from '../hooks.js';
import { compactPeso, number, percent, peso } from '../format.js';
import Icon from '../components/Icon.jsx';
import { Callout, DataTable, ErrorNotice, PageIntro, PageLoader } from '../components/UI.jsx';

function Section({ num, title, children }) {
  return (
    <section className="case-section">
      <div className="case-section__head">
        <span>{num}</span>
        <h3>{title}</h3>
      </div>
      <div className="case-section__body">{children}</div>
    </section>
  );
}

export default function CaseStudy() {
  const descriptive = useApi(api.descriptive, []);
  const predictive = useApi(api.predictive, []);
  const meta = useApi(api.meta, []);

  if (descriptive.loading || predictive.loading) return <PageLoader rows={2} />;
  if (descriptive.error) return <ErrorNotice message={descriptive.error} onRetry={descriptive.reload} />;
  if (predictive.error) return <ErrorNotice message={predictive.error} onRetry={predictive.reload} />;

  const d = descriptive.data;
  const p = predictive.data;
  const k = d.kpis;
  const m = p.model;
  const counts = meta.data?.counts || {};
  const topChannel = d.marketingByChannel[0];
  const lowChannel = d.marketingByChannel[d.marketingByChannel.length - 1];
  const topDriver = p.drivers[0];

  return (
    <div className="page case">
      <PageIntro
        eyebrow="Capstone business analytics overview"
        title="Cascadja Cafe: from gut feel to a data-backed plan"
        lead="A complete case study covering the problem background, the five-variable database, the descriptive → predictive → prescriptive process, and the decisions the dashboard supports."
        actions={
          <button className="btn btn--primary" onClick={() => window.print()}>
            <Icon name="download" size={16} /> Print / save PDF
          </button>
        }
      />

      <div className="case-summary">
        <div>
          <span>Revenue analysed</span>
          <strong>{compactPeso(k.totalRevenue)}</strong>
          <small>{number(k.transactions)} transactions · 12 months</small>
        </div>
        <div>
          <span>Marketing ROI</span>
          <strong>{k.marketingRoi.toFixed(2)}x</strong>
          <small>{compactPeso(k.marketingSpend)} spend</small>
        </div>
        <div>
          <span>Predictive fit</span>
          <strong>R² {m.r2.toFixed(3)}</strong>
          <small>{percent(m.mape)} MAPE</small>
        </div>
        <div>
          <span>Room occupancy</span>
          <strong>{percent(k.occupancy)}</strong>
          <small>ADR {peso(k.adr)}</small>
        </div>
      </div>

      <Section num="01" title="Problem background">
        <p>
          Cascadja Cafe is a small hospitality business that combines a coffee shop and restaurant with a four-room inn. The
          cafe sells coffee, meals and pastries throughout the day, while the inn captures overnight guests who also spend in
          the cafe. The business has grown, but its decisions are still made by intuition: marketing budgets are split across
          channels because “that is how it has always been done”, and room rates are set once a year without checking
          occupancy.
        </p>
        <p>
          Two problems make this risky. First, marketing returns are uneven. The business spends roughly{' '}
          {compactPeso(k.marketingSpend)} a year across seven channels, but the measured return ranges from ₱
          {lowChannel.roi.toFixed(2)} to ₱{topChannel.roi.toFixed(2)} per peso. Second, the cafe and the inn behave like two
          separate businesses: rooms generate {percent(k.roomShare)} of revenue, yet only {percent(k.roomAttachRate)} of room
          stays include a cafe purchase.
        </p>
        <div className="problem-box">
          <Icon name="target" size={22} />
          <div>
            <strong>Central question</strong>
            <p>
              How should Cascadja Cafe allocate its marketing budget and price its rooms to maximise revenue — and how much
              revenue can be expected next quarter if it follows the recommendation?
            </p>
          </div>
        </div>
        <p>
          The analysis has three objectives: (1) describe what happened across customers, sales, transactions, products and
          marketing; (2) predict monthly revenue from marketing investment; and (3) prescribe a budget mix, room rate and
          cross-sell action that improve on the current plan.
        </p>
      </Section>

      <Section num="02" title="Data collection and database design">
        <p>
          The capstone uses a relational database with five core variables. The dataset covers twelve complete months, from
          November 2025 to October 2026. It is a realistic simulated dataset generated with a fixed seed, which keeps the
          figures reproducible for the presentation and lets the database be re-seeded at any time.
        </p>

        <DataTable
          columns={[
            { key: 'variable', label: 'Variable' },
            { key: 'table', label: 'Table' },
            { key: 'records', label: 'Records', align: 'right' },
            { key: 'fields', label: 'Key fields' },
            { key: 'role', label: 'Role in the analysis' },
          ]}
          rows={[
            { variable: 'Customers', table: 'customers', records: number(counts.customers ?? k.customers), fields: 'segment, city, joined_at, loyalty_points', role: 'Segmentation, repeat rate, lifetime value' },
            { variable: 'Sales', table: 'sales', records: number(counts.sales ?? 0), fields: 'transaction_id, product_id, quantity, line_total', role: 'Product, category and menu revenue' },
            { variable: 'Transactions', table: 'transactions', records: number(counts.transactions ?? k.transactions), fields: 'customer_id, channel, payment, total_amount', role: 'Order volume, channel mix, average ticket' },
            { variable: 'Products', table: 'products', records: number(counts.products ?? 60), fields: 'category, unit_price, unit_cost, is_room', role: 'Rooms vs cafe, margins, product ranking' },
            { variable: 'Marketing', table: 'marketing_campaigns', records: number(counts.marketing ?? 0), fields: 'channel, spend, clicks, conversions, revenue_attributed', role: 'Channel ROI, CPA, budget optimization' },
          ]}
        />

        <div className="arch">
          <div className="arch__node">
            <span className="arch__icon"><Icon name="chart" size={20} /></span>
            <strong>React dashboard</strong>
            <p>Vite SPA · Chart.js · six pages</p>
          </div>
          <span className="arch__arrow">→</span>
          <div className="arch__node">
            <span className="arch__icon"><Icon name="database" size={20} /></span>
            <strong>Express API</strong>
            <p>REST endpoints · analytics engine</p>
          </div>
          <span className="arch__arrow">→</span>
          <div className="arch__node">
            <span className="arch__icon"><Icon name="wallet" size={20} /></span>
            <strong>Neon Postgres</strong>
            <p>5 tables · customers → transactions → sales</p>
          </div>
        </div>
        <p className="muted small">
          Relationships: one customer has many transactions; one transaction has many sales line items; each sale references
          one product; marketing campaigns stand alone and are joined to revenue by month and channel. The API can also run in
          demo mode with the same dataset in memory when <code>DATABASE_URL</code> is not configured.
        </p>
      </Section>

      <Section num="03" title="The business analytics process">
        <h4 className="case-sub">3.1 Descriptive — what happened?</h4>
        <p>
          Across the year Cascadja recorded {number(k.transactions)} completed transactions and {peso(k.totalRevenue)} in
          revenue, with an average order of {peso(k.avgOrder)} and a gross margin of {percent(k.grossMargin)}. Room stays are
          the economic engine: {percent(k.roomShare)} of revenue comes from a small share of transactions, at an average daily
          rate of {peso(k.adr)}. The cafe's top product is {k.topProduct}, and {k.busiestDay} is the busiest day.
        </p>
        <p>
          Marketing is the weakest link. Spend of {compactPeso(k.marketingSpend)} produced {compactPeso(k.attributedRevenue)}
          of attributed revenue ({k.marketingRoi.toFixed(2)}x overall), but performance is uneven: {topChannel.channel} returns{' '}
          {topChannel.roi.toFixed(2)}x while {lowChannel.channel} returns only {lowChannel.roi.toFixed(2)}x. Room occupancy
          averaged {percent(k.occupancy)}, leaving more than half of the four rooms empty. The loyalty base is engaged —
          {percent(k.repeatRate)} of active members have more than one visit — but walk-ins dominate transaction volume.
        </p>

        <h4 className="case-sub">3.2 Predictive — what will happen?</h4>
        <p>
          The predictive step uses a simple linear regression of monthly revenue on monthly marketing spend, trained on the
          twelve months of history. The fitted model is:
        </p>
        <div className="formula">{m.equation}</div>
        <p>
          The slope of {m.slope.toFixed(2)} means that an additional ₱1,000 of monthly marketing spend is associated with
          about {peso(m.slope * 1000)} of additional monthly revenue. The model explains {percent(m.r2 * 100)} of the
          month-to-month variation (R² = {m.r2.toFixed(3)}) with a mean absolute percentage error of {percent(m.mape)}. The
          strongest correlate of revenue is {topDriver.driver.toLowerCase()} ({topDriver.correlation.toFixed(2)}), which
          confirms that demand, not price alone, drives the top line.
        </p>
        <p>
          Assuming spend continues to grow about 3% per month, the forecast is {compactPeso(p.forecast[0].revenue)} for{' '}
          {p.forecast[0].label}, {compactPeso(p.forecast[1].revenue)} for {p.forecast[1].label}, and{' '}
          {compactPeso(p.forecast[2].revenue)} for {p.forecast[2].label}, with an approximate 95% range of{' '}
          {compactPeso(p.forecast[0].lower)} to {compactPeso(p.forecast[0].upper)} in the first month. Occupancy is projected
          at {percent(p.occupancyForecast[0].occupancy)} next month using a damped three-month trend.
        </p>

        <h4 className="case-sub">3.3 Prescriptive — what should be done?</h4>
        <p>
          The prescriptive step converts the model into decisions. The budget optimizer keeps the total budget fixed but
          reallocates it toward channels with stronger measured returns, subject to realistic caps on how far any channel can
          scale. In the base scenario, the recommended mix lifts attributed revenue by roughly 18–20% against spending the same
          money the old way. The largest moves are into {topChannel.channel} and the strongest secondary channel, funded by
          trimming {lowChannel.channel}.
        </p>
        <p>
          On the room side, occupancy of {percent(k.occupancy)} is below the comfortable range, so the pricing rule recommends
          a weekday rate adjustment and packages rather than a blanket increase. The cafe opportunity is equally clear: only{' '}
          {percent(k.roomAttachRate)} of room stays include a cafe item, so a check-in coffee or breakfast bundle is the
          lowest-cost way to grow cafe revenue. Finally, the operations rule sizes service staffing from the{' '}
          {number(k.transactionsPerDay, 1)} transactions per day and the {k.busiestDay} peak.
        </p>
        <p className="muted small">
          The prescriptive page is a live simulator: the budget and room-rate sliders recalculate the projected revenue,
          profit, occupancy and channel allocations through the same API.
        </p>
      </Section>

      <Section num="04" title="Step-wise connections in the BA process">
        <p>
          The three steps are not separate reports. Each descriptive finding becomes an input to the predictive model, and
          each prediction becomes a constraint or baseline for a prescriptive decision.
        </p>
        <DataTable
          columns={[
            { key: 'descriptive', label: 'Descriptive finding' },
            { key: 'predictive', label: 'Predictive use' },
            { key: 'prescriptive', label: 'Prescriptive decision' },
            { key: 'outcome', label: 'Measured outcome' },
          ]}
          rows={[
            {
              descriptive: `Rooms are ${percent(k.roomShare)} of revenue but only ~10% of transactions`,
              predictive: 'Room revenue is part of the total-revenue baseline in the regression',
              prescriptive: 'Room-rate rule adjusts ADR based on occupancy',
              outcome: `Suggested rate ${peso(Math.round(k.adr * 0.93))} with higher occupancy`,
            },
            {
              descriptive: `Marketing spend varies month to month and revenue follows it`,
              predictive: `Slope ${m.slope.toFixed(2)} · R² ${m.r2.toFixed(3)} · MAPE ${percent(m.mape)}`,
              prescriptive: 'Budget optimizer reallocates within the same total',
              outcome: '≈18–20% lift in attributed revenue',
            },
            {
              descriptive: `${topChannel.channel} returns ${topChannel.roi.toFixed(2)}x vs ${lowChannel.channel} ${lowChannel.roi.toFixed(2)}x`,
              predictive: 'Spend assumption sets the revenue baseline for the scenario',
              prescriptive: `Shift budget from ${lowChannel.channel} into ${topChannel.channel}`,
              outcome: 'Higher return per peso, same budget',
            },
            {
              descriptive: `Occupancy ${percent(k.occupancy)} · ADR ${peso(k.adr)}`,
              predictive: `Occupancy forecast ${percent(p.occupancyForecast[0].occupancy)} next month`,
              prescriptive: 'Weekday packages and a targeted rate change',
              outcome: `Projected occupancy ${percent(p.occupancyForecast[0].occupancy)}`,
            },
            {
              descriptive: `Cafe attach rate ${percent(k.roomAttachRate)}`,
              predictive: 'Cafe revenue retained in the scenario baseline',
              prescriptive: 'Check-in coffee / breakfast bundle',
              outcome: 'Additional cafe revenue at near-zero acquisition cost',
            },
            {
              descriptive: `${k.topProduct} is the top cafe product`,
              predictive: 'Menu mix supports the revenue baseline',
              prescriptive: 'Feature and bundle the top product',
              outcome: 'Higher average cafe ticket',
            },
          ]}
        />
      </Section>

      <Section num="05" title="Dashboard and system overview">
        <p>
          The program is a full-stack application. React renders the dashboard and simulator, Express exposes the analytics
          API, and Neon Postgres stores the five tables. The same analytics code runs whether the data comes from Neon or the
          built-in demo dataset, so the numbers stay consistent.
        </p>
        <DataTable
          columns={[
            { key: 'page', label: 'Page' },
            { key: 'purpose', label: 'Purpose' },
            { key: 'content', label: 'What is displayed' },
          ]}
          rows={[
            { page: 'Overview', purpose: 'Executive dashboard', content: 'KPIs, revenue vs spend, channel mix, top products, ROI, occupancy, variable counts' },
            { page: 'Descriptive', purpose: 'What happened', content: 'Monthly trend, category/segment mix, top products, day-of-week, payments, channel and marketing tables' },
            { page: 'Predictive', purpose: 'What will happen', content: 'Regression equation, actual vs fitted, 3-month forecast, scatter, drivers, occupancy forecast' },
            { page: 'Prescriptive', purpose: 'What to do', content: 'Budget optimizer, allocation table, room-rate rule, scenario P&L, recommendations' },
            { page: 'Data explorer', purpose: 'Database integration', content: 'Searchable, sortable tables for all five variables plus a working add-customer form' },
            { page: 'Case study', purpose: 'Written capstone', content: 'This document, printable to PDF' },
          ]}
        />
        <p className="muted small">
          API endpoints: <code>GET /api/descriptive</code>, <code>GET /api/predictive</code>,{' '}
          <code>POST /api/prescriptive</code>, <code>GET /api/data/:table</code>, <code>POST /api/customers</code>, plus{' '}
          <code>GET /api/meta</code> and <code>GET /api/health</code>.
        </p>
      </Section>

      <Section num="06" title="Recommendations and expected impact">
        <DataTable
          columns={[
            { key: 'action', label: 'Action' },
            { key: 'why', label: 'Evidence' },
            { key: 'impact', label: 'Expected impact' },
          ]}
          rows={[
            {
              action: `Move budget into ${topChannel.channel} and Google Ads`,
              why: `Top measured ROI ${topChannel.roi.toFixed(2)}x vs ${lowChannel.roi.toFixed(2)}x for ${lowChannel.channel}`,
              impact: '≈18–20% more attributed revenue at the same total spend',
            },
            {
              action: 'Use weekday packages and a targeted rate adjustment',
              why: `Occupancy ${percent(k.occupancy)} is below the 45–55% comfort zone`,
              impact: 'Higher occupancy and RevPAR without discounting peak weekends',
            },
            {
              action: 'Add a check-in coffee / breakfast bundle',
              why: `${percent(k.roomAttachRate)} attach rate leaves cafe revenue on the table`,
              impact: 'Incremental cafe revenue from guests already on site',
            },
            {
              action: `Feature ${k.topProduct} in a bundle`,
              why: 'Highest-revenue cafe product',
              impact: 'Higher average cafe ticket',
            },
            {
              action: 'Schedule service staff to the weekend peak',
              why: `${k.busiestDay} is the busiest day; ${number(k.transactionsPerDay, 1)} transactions per day on average`,
              impact: 'Faster service with controlled labor cost',
            },
          ]}
        />
        <Callout tone="sage" icon="check" title="Bottom line">
          Cascadja does not need a bigger marketing budget first — it needs a better mix. Reallocating the existing budget,
          filling empty rooms on weekdays, and converting room guests into cafe customers together address the three biggest
          gaps the data exposes.
        </Callout>
      </Section>

      <Section num="07" title="Limitations and next steps">
        <ul className="case-list">
          <li>The dataset is a realistic simulation built for the capstone, not audited financial data. The schema and analytics are ready for real exports.</li>
          <li>Marketing revenue uses last-click attribution recorded in the campaign table; a real business should add multi-touch attribution.</li>
          <li>Twelve monthly observations are enough for a simple regression but limit statistical power. More history would allow seasonality and confidence intervals to be modelled properly.</li>
          <li>The prescriptive model assumes a fixed room-rate elasticity of −1.1 and estimates fixed monthly operating cost at ₱58,000. Both should be replaced with actual finance data.</li>
          <li>Next steps: connect real point-of-sale and booking exports, add a customer-lifetime-value model, and test the recommended bundles with a small controlled experiment.</li>
        </ul>
      </Section>

      <Section num="08" title="Conclusion">
        <p>
          The capstone shows the full analytics chain in one working system: a normalized five-variable database, a React
          dashboard, a transparent predictive model, and a prescriptive simulator that turns the model into budget and pricing
          decisions. The analysis answers the original question with a clear plan: protect the room business, rebalance
          marketing toward the channels that return the most per peso, and bring the cafe into the guest journey.
        </p>
      </Section>

      <p className="case-foot">Prepared for the Database Systems / Business Analytics capstone · Cascadja Cafe · 2026</p>
    </div>
  );
}
