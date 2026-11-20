import { getDescriptive, getPredictive } from '../services/analyticsService.js';
import { useFetch } from '../hooks/useFetch.js';
import { compactPeso, number, percent, peso } from '../format.js';
import Icon from '../components/Icon.jsx';
import { Badge, Callout, DataTable, ErrorNotice, KpiCard, PageIntro, PageLoader, Panel, StatRow } from '../components/UI.jsx';

export default function CaseStudy() {
  const d = useFetch(getDescriptive, []);
  const p = useFetch(getPredictive, []);

  if (d.loading || p.loading) return <PageLoader />;
  if (d.error) return <ErrorNotice message={d.error} onRetry={d.reload} />;
  if (p.error) return <ErrorNotice message={p.error} onRetry={p.reload} />;

  const k = d.data.kpis;
  const m = p.data.model;
  const top = d.data.topItems[0] || { name: '—', revenue: 0 };

  return (
    <div className="page">
      <PageIntro
        eyebrow="Printable capstone · Cascadja Foods and Drinks"
        title="From gut feel to a data-backed café plan"
        lead="Kasadya Park & Play, Calan Road, Cordova, Cebu · a real casual café and food-and-beverage house serving walk-in guests and Foodpanda customers."
        actions={
          <button className="btn btn--primary" onClick={() => window.print()}>
            <Icon name="download" size={16} /> Print / save PDF
          </button>
        }
      />

      <Callout tone="gold" icon="alert" title="Data honesty statement">
        Menu items, categories, prices and bestseller flags are real, transcribed from the owner's photos. The {number(k.lines)} transaction lines are deterministic <strong>generated sample data</strong> (seed 20261120), used because no POS/Foodpanda export was supplied. Every conclusion must be re-run after real transaction data is loaded.
      </Callout>

      <div className="kpi-grid">
        <KpiCard label="Sales analysed" value={compactPeso(k.totalSales)} hint={`${d.data.period.label}`} icon="wallet" tone="caramel" />
        <KpiCard label="Orders" value={number(k.orders)} hint={`${number(k.ordersPerDay, 1)} per day`} icon="cart" tone="sage" />
        <KpiCard label="Bestseller share" value={percent(k.bestsellerShare)} hint={`${top.name} leads at ${compactPeso(top.revenue)}`} icon="coffee" tone="berry" />
        <KpiCard label="Add-on attach" value={percent(k.addonAttachRate)} hint={`${compactPeso(k.addonRevenue)} add-on sales`} icon="target" tone="plum" />
      </div>

      <Panel title="01 · Problem and objectives" subtitle="The business question">
        <p className="lead">
          How should Cascadja use what it sells — coffee, frappes, milkteas, rice meals, pasta, snacks, desserts and add-ons — to grow sales from both walk-in and Foodpanda customers?
        </p>
        <ul className="assumption-list">
          <li>Integrate at least 50 records across five variables: order date/daypart, product category, item price, quantity sold and total sales.</li>
          <li>Describe what sells, when it sells, and through which channel.</li>
          <li>Forecast near-term daily sales from the observed pattern.</li>
          <li>Recommend concrete actions on add-ons, delivery and daypart staffing.</li>
        </ul>
      </Panel>

      <Panel title="02 · Data and integration" subtitle="One fact table, one price master">
        <div className="grid grid--2">
          <div>
            <StatRow label="Sales fact rows" value={number(k.lines)} />
            <StatRow label="Distinct orders" value={number(k.orders)} />
            <StatRow label="Menu items" value="59" />
            <StatRow label="Categories" value={number(d.data.byCategory.length)} />
            <StatRow label="Dayparts" value={number(d.data.byDaypart.length)} />
          </div>
          <div>
            <StatRow label="Dine-in share" value={percent(k.dineInShare)} />
            <StatRow label="Foodpanda share" value={percent(k.foodpandaShare)} />
            <StatRow label="Food share" value={percent(k.foodShare)} />
            <StatRow label="Drink share" value={percent(k.drinkShare)} />
            <StatRow label="Busiest daypart" value={k.busiestDaypart} />
          </div>
        </div>
        <p className="muted small">
          The extra channel variable is included because it reflects how Cascadja really operates. Rooms, loyalty points and marketing campaigns from the earlier fictional version are not part of this real business.
        </p>
      </Panel>

      <Panel title="03 · Descriptive findings" subtitle="What happened">
        <DataTable
          compact
          columns={[
            { key: 'category', label: 'Category' },
            { key: 'revenue', label: 'Sales', align: 'right', render: (v) => peso(v) },
            { key: 'share', label: 'Share', align: 'right', render: (v) => percent(v) },
            { key: 'units', label: 'Units', align: 'right', render: (v) => number(v) },
          ]}
          rows={d.data.byCategory}
        />
        <p className="lead">
          {d.data.byCategory[0]?.category} is the largest category at {percent(d.data.byCategory[0]?.share)} of sales. {k.busiestDaypart} is the strongest daypart and {k.busiestDay} the busiest weekday. The starred menu items account for {percent(k.bestsellerShare)} of sales, so the bestseller list is commercially meaningful, not decorative.
        </p>
      </Panel>

      <Panel title="04 · Predictive finding" subtitle="What will happen">
        <div className="pl">
          <StatRow label="Model" value={m.name} />
          <StatRow label="Equation" value={m.equation} />
          <StatRow label="R²" value={m.r2.toFixed(3)} />
          <StatRow label="MAPE" value={`${m.mape.toFixed(1)}%`} />
          <StatRow label="Next 7 days" value={`${compactPeso(p.data.nextWeek.revenue)} ± ${peso(p.data.nextWeek.band)}`} />
        </div>
        <p className="model-note">{m.interpretation}</p>
      </Panel>

      <Panel title="05 · Prescriptive actions" subtitle="What to do on Monday">
        <ul className="assumption-list">
          <li><strong>Feature the winners.</strong> Put {top.name} and the other ★ items first on the board and on Foodpanda; build lunch and afternoon combos around them.</li>
          <li><strong>Prompt add-ons.</strong> Current attach is {percent(k.addonAttachRate)}; a counter script and delivery note can move it toward 25% with almost no ingredient cost.</li>
          <li><strong>Grow delivery deliberately.</strong> Foodpanda is {percent(k.foodpandaShare)} of sales — use photos, bundles and slow-day promos instead of menu-wide discounts.</li>
          <li><strong>Staff the peaks.</strong> Move people into {k.busiestDaypart} and reduce coverage in the quietest daypart.</li>
          <li><strong>Replace sample data.</strong> Export real POS and Foodpanda rows into sales_fact, then re-run every page before presenting final numbers.</li>
        </ul>
      </Panel>

      <Panel title="06 · Limitations and next steps" subtitle="What a marker should hear">
        <ul className="assumption-list">
          <li>Transactions are generated, not observed; conclusions are demonstrations of the method.</li>
          <li>Marketing-spend ROI and room metrics were removed because they do not describe this business.</li>
          <li>The forecast uses weekday averages; holiday, weather and promotion effects are not modelled yet.</li>
          <li>Next: collect daily POS/Foodpanda exports, add cost data per item, then build a category-level forecast and a true gross-margin optimiser.</li>
        </ul>
      </Panel>

      <div className="action-row">
        <Badge tone="sage">Integrated database</Badge>
        <Badge tone="caramel">Descriptive → predictive → prescriptive</Badge>
        <Badge tone="berry">Real menu · honest sample data</Badge>
      </div>
    </div>
  );
}
