import SalesLineChart from '../components/charts/SalesLineChart.jsx';
import ProductBarChart from '../components/charts/ProductBarChart.jsx';
import { getDescriptive } from '../services/analyticsService.js';
import { useFetch } from '../hooks/useFetch.js';
import { compactPeso, number, percent, peso } from '../format.js';
import { PALETTE_SOFT, baseOptions, moneyTick } from '../charts.js';
import { Badge, Callout, DataTable, ErrorNotice, KpiCard, PageIntro, PageLoader, Panel, StatRow } from '../components/UI.jsx';

export default function Analytics() {
  const { data, loading, error, reload } = useFetch(getDescriptive, []);
  if (loading) return <PageLoader />;
  if (error) return <ErrorNotice message={error} onRetry={reload} />;

  const k = data.kpis;
  const daily = data.daily.slice(-90);

  const trendData = {
    labels: daily.map((d) => d.date.slice(5)),
    datasets: [
      { label: 'Sales', data: daily.map((d) => d.revenue), borderColor: '#c08552', backgroundColor: 'rgba(192,133,82,.15)', fill: true, tension: 0.3, pointRadius: 0, borderWidth: 2 },
      { label: 'Orders', data: daily.map((d) => d.orders), borderColor: '#6f7f63', backgroundColor: 'rgba(111,127,99,.08)', fill: false, tension: 0.3, pointRadius: 0, borderWidth: 2, yAxisID: 'y1' },
    ],
  };

  const itemData = {
    labels: data.topItems.slice(0, 10).map((i) => i.name),
    datasets: [
      { label: 'Revenue', data: data.topItems.slice(0, 10).map((i) => i.revenue), backgroundColor: 'rgba(164,74,63,.78)', borderRadius: 5, maxBarThickness: 18 },
    ],
  };

  const daypartData = {
    labels: data.byDaypart.map((p) => p.daypart),
    datasets: [
      { label: 'Orders', data: data.byDaypart.map((p) => p.orders), backgroundColor: PALETTE_SOFT, borderRadius: 6, maxBarThickness: 42 },
    ],
  };

  return (
    <div className="page">
      <PageIntro
        eyebrow="Descriptive analytics · what happened"
        title="The real menu tells a clear story"
        lead={`From ${data.period.from} to ${data.period.to}, Cascadja recorded ${number(k.orders)} orders across ${number(k.lines)} sold lines. These are the five required variables plus channel, aggregated from the same rows you can inspect in the Data Explorer.`}
        actions={<Badge tone={data.source === 'neon' ? 'sage' : 'gold'}>{data.source === 'neon' ? 'Neon Postgres' : 'Generated sample data'}</Badge>}
      />

      <div className="kpi-grid">
        <KpiCard label="Total sales" value={compactPeso(k.totalSales)} hint={`${peso(k.salesPerDay)} per day`} icon="wallet" tone="caramel" />
        <KpiCard label="Average order" value={peso(k.avgOrder)} hint={`${number(k.ordersPerDay, 1)} orders per day`} icon="cart" tone="sage" />
        <KpiCard label="Average item" value={peso(k.avgItemPrice)} hint={`${number(k.itemsSold)} units sold`} icon="coffee" tone="berry" />
        <KpiCard label="Bestseller share" value={percent(k.bestsellerShare)} hint="Revenue from ★ menu items" icon="target" tone="plum" />
      </div>

      <Panel
        title="Sales and order volume"
        subtitle={`Last ${daily.length} days · left axis sales, right axis orders`}
        action={<span className="muted small">{data.period.label}</span>}
      >
        <div className="chart-box chart-box--tall">
          <SalesLineChart
            type="bar"
            data={trendData}
            options={baseOptions({
              scales: {
                x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 14 } },
                y: { beginAtZero: true, ticks: { callback: moneyTick }, grid: { color: 'rgba(59,42,32,.07)' } },
                y1: { beginAtZero: true, position: 'right', grid: { display: false } },
              },
            })}
          />
        </div>
      </Panel>

      <div className="grid grid--2">
        <Panel title="Top 10 menu items" subtitle="Revenue by exact item name and price">
          <div className="chart-box chart-box--tall">
            <ProductBarChart data={itemData} options={baseOptions({ indexAxis: 'y', plugins: { legend: { display: false } }, scales: { x: { beginAtZero: true, ticks: { callback: moneyTick } }, y: { grid: { display: false } } } })} />
          </div>
        </Panel>
        <div className="stack">
          <Panel title="Category mix" subtitle="Revenue share by product category">
            <DataTable
              compact
              columns={[
                { key: 'category', label: 'Category', render: (v) => <Badge tone="caramel">{v}</Badge> },
                { key: 'revenue', label: 'Sales', align: 'right', render: (v) => peso(v) },
                { key: 'share', label: 'Share', align: 'right', render: (v) => percent(v) },
                { key: 'units', label: 'Units', align: 'right', render: (v) => number(v) },
              ]}
              rows={data.byCategory}
            />
          </Panel>
          <Panel title="Channel mix" subtitle="Walk-in vs online delivery">
            <div className="pl">
              {data.byChannel.map((c) => (
                <StatRow key={c.channel} label={c.channel} value={`${peso(c.revenue)} · ${percent(c.share)}`} />
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <div className="grid grid--2">
        <Panel title="Orders by daypart" subtitle="When the orders actually happen">
          <div className="chart-box">
            <ProductBarChart data={daypartData} options={baseOptions({ plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } })} />
          </div>
        </Panel>
        <Panel title="Daypart detail" subtitle="Revenue, orders and average ticket">
          <DataTable
            compact
            columns={[
              { key: 'daypart', label: 'Daypart' },
              { key: 'revenue', label: 'Sales', align: 'right', render: (v) => peso(v) },
              { key: 'orders', label: 'Orders', align: 'right', render: (v) => number(v) },
              { key: 'avgOrder', label: 'Avg order', align: 'right', render: (v) => peso(v) },
            ]}
            rows={data.byDaypart}
          />
        </Panel>
      </div>

      <Panel title="Add-on performance" subtitle="₱10 pearls and jellies, ₱35 creamcheese, cheesecake and cake">
        <DataTable
          columns={[
            { key: 'name', label: 'Add-on', render: (v) => <Badge tone="plum">{v}</Badge> },
            { key: 'count', label: 'Lines with add-on', align: 'right', render: (v) => number(v) },
            { key: 'revenue', label: 'Add-on revenue', align: 'right', render: (v) => peso(v) },
          ]}
          rows={data.addons}
        />
      </Panel>

      <Callout tone="caramel" icon="coffee" title="Food and drinks belong together">
        Food is {percent(k.foodShare)} of sales and drinks {percent(k.drinkShare)}. {k.busiestDaypart} is the busiest daypart and {k.busiestDay} the busiest day. The next step is not more data — it is using these patterns to staff, bundle and forecast.
      </Callout>
    </div>
  );
}
