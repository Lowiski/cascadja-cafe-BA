import { Link } from 'react-router-dom';
import { Chart } from 'react-chartjs-2';
import { api } from '../api.js';
import { useApi } from '../hooks.js';
import { compactPeso, number, percent, peso } from '../format.js';
import { PALETTE, PALETTE_SOFT, baseOptions, comboOptions, doughnutOptions, horizontalOptions } from '../charts.js';
import Icon from '../components/Icon.jsx';
import { Badge, Callout, DataTable, ErrorNotice, KpiCard, PageIntro, PageLoader, Panel } from '../components/UI.jsx';

export default function Descriptive() {
  const { data, loading, error, reload } = useApi(api.descriptive, []);
  if (loading) return <PageLoader />;
  if (error) return <ErrorNotice message={error} onRetry={reload} />;

  const k = data.kpis;

  const revenueData = {
    labels: data.monthly.map((m) => m.label),
    datasets: [
      {
        type: 'bar',
        label: 'Transactions',
        data: data.monthly.map((m) => m.transactions),
        backgroundColor: 'rgba(111,127,99,.55)',
        borderRadius: 5,
        maxBarThickness: 26,
        yAxisID: 'y1',
      },
      {
        type: 'line',
        label: 'Revenue',
        data: data.monthly.map((m) => m.revenue),
        borderColor: '#c08552',
        backgroundColor: 'rgba(192,133,82,.12)',
        borderWidth: 2.5,
        tension: 0.35,
        pointRadius: 3,
        fill: true,
        yAxisID: 'y',
      },
    ],
  };

  const categoryData = {
    labels: data.byCategory.map((c) => c.category),
    datasets: [
      {
        data: data.byCategory.map((c) => c.revenue),
        backgroundColor: PALETTE_SOFT,
        borderColor: '#fffdf9',
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const segmentData = {
    labels: data.bySegment.map((s) => s.segment),
    datasets: [
      {
        label: 'Revenue',
        data: data.bySegment.map((s) => s.revenue),
        backgroundColor: data.bySegment.map((_, i) => PALETTE[i % PALETTE.length] + 'cc'),
        borderRadius: 5,
        maxBarThickness: 28,
      },
    ],
  };

  const productData = {
    labels: data.topProducts.map((p) => p.name),
    datasets: [
      {
        label: 'Revenue',
        data: data.topProducts.map((p) => p.revenue),
        backgroundColor: 'rgba(164,74,63,.8)',
        borderRadius: 5,
        maxBarThickness: 18,
      },
    ],
  };

  const dayData = {
    labels: data.byDayOfWeek.map((d) => d.day),
    datasets: [
      {
        label: 'Transactions',
        data: data.byDayOfWeek.map((d) => d.transactions),
        backgroundColor: 'rgba(217,164,65,.8)',
        borderRadius: 5,
        maxBarThickness: 34,
      },
    ],
  };

  const paymentData = {
    labels: data.byPayment.map((p) => p.method),
    datasets: [
      {
        data: data.byPayment.map((p) => p.revenue),
        backgroundColor: PALETTE_SOFT,
        borderColor: '#fffdf9',
        borderWidth: 3,
      },
    ],
  };

  return (
    <div className="page">
      <PageIntro
        eyebrow={`Descriptive analytics · ${data.period.label}`}
        title="What happened over the last twelve months"
        lead="Descriptive analytics turns the raw customers, sales, transactions, products and marketing tables into a clear picture of performance: who buys, what they buy, how they pay, and which channels actually move the needle."
        actions={
          <Link to="/predictive" className="btn btn--ghost">
            Next: predictive <Icon name="arrow" size={16} />
          </Link>
        }
      />

      <div className="kpi-grid kpi-grid--6">
        <KpiCard label="Gross margin" value={percent(k.grossMargin)} hint={`${compactPeso(k.grossProfit)} gross profit`} icon="wallet" tone="sage" />
        <KpiCard label="Average order" value={peso(k.avgOrder)} hint={`${number(k.transactions)} completed transactions`} icon="cart" tone="caramel" />
        <KpiCard label="Repeat rate" value={percent(k.repeatRate)} hint={`${number(k.repeatCustomers)} of ${number(k.activeCustomers)} loyalty members`} icon="users" tone="berry" />
        <KpiCard label="Room share" value={percent(k.roomShare)} hint={`${compactPeso(k.roomRevenue)} of revenue`} icon="bed" tone="plum" />
        <KpiCard label="ADR" value={peso(k.adr)} hint={`${number(k.roomNights)} room nights sold`} icon="target" tone="caramel" />
        <KpiCard label="Marketing spend" value={compactPeso(k.marketingSpend)} hint={`${number(k.conversions)} conversions · ROI ${k.marketingRoi.toFixed(2)}x`} icon="spark" tone="sage" />
      </div>

      <Panel title="Monthly revenue and transaction volume" subtitle="Revenue tracks order volume; both peak toward the final quarter">
        <div className="chart-box chart-box--tall">
          <Chart type="bar" data={revenueData} options={comboOptions()} />
        </div>
      </Panel>

      <div className="grid grid--2">
        <Panel title="Revenue by category" subtitle="Rooms dwarf the cafe in revenue per transaction">
          <div className="chart-box">
            <Chart type="doughnut" data={categoryData} options={doughnutOptions()} />
          </div>
        </Panel>
        <Panel title="Revenue by customer segment" subtitle="Loyalty members and walk-ins">
          <div className="chart-box">
            <Chart
              type="bar"
              data={segmentData}
              options={baseOptions({
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true, ticks: { callback: (v) => compactPeso(v) }, grid: { color: 'rgba(59,42,32,.07)' } },
                },
                plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx) => peso(ctx.parsed.y) } } },
              })}
            />
          </div>
        </Panel>
        <Panel title="Top ten cafe products" subtitle="Menu items ranked by revenue">
          <div className="chart-box">
            <Chart type="bar" data={productData} options={horizontalOptions()} />
          </div>
        </Panel>
        <Panel title="Transactions by day of week" subtitle="Weekends carry the cafe; room stays peak Friday and Saturday">
          <div className="chart-box">
            <Chart
              type="bar"
              data={dayData}
              options={baseOptions({
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true, grid: { color: 'rgba(59,42,32,.07)' } },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: { callbacks: { label: (ctx) => `${number(ctx.parsed.y)} transactions` } },
                },
              })}
            />
          </div>
        </Panel>
      </div>

      <div className="grid grid--2">
        <Panel title="Payment mix" subtitle="Share of revenue by payment method">
          <div className="chart-box">
            <Chart type="doughnut" data={paymentData} options={doughnutOptions()} />
          </div>
        </Panel>
        <Panel title="Channel performance" subtitle="Revenue and average ticket by sales channel">
          <DataTable
            compact
            columns={[
              { key: 'channel', label: 'Channel' },
              { key: 'revenue', label: 'Revenue', align: 'right', render: (v) => peso(v) },
              { key: 'transactions', label: 'Txns', align: 'right', render: (v) => number(v) },
              { key: 'share', label: 'Share', align: 'right', render: (v) => percent(v) },
              { key: 'avgOrder', label: 'Avg order', align: 'right', render: (v) => peso(v) },
            ]}
            rows={data.byChannel}
          />
        </Panel>
      </div>

      <Panel
        title="Marketing efficiency by channel"
        subtitle="Spend, conversions, cost per acquisition and attributed return"
        action={<Badge tone="sage">Top: {data.marketingByChannel[0].channel}</Badge>}
      >
        <DataTable
          columns={[
            { key: 'channel', label: 'Channel' },
            { key: 'spend', label: 'Spend', align: 'right', render: (v) => peso(v) },
            { key: 'conversions', label: 'Conversions', align: 'right', render: (v) => number(v) },
            { key: 'cpa', label: 'CPA', align: 'right', render: (v) => peso(v) },
            { key: 'ctr', label: 'CTR', align: 'right', render: (v) => percent(v, 2) },
            { key: 'cvr', label: 'CVR', align: 'right', render: (v) => percent(v, 2) },
            { key: 'roi', label: 'ROI', align: 'right', render: (v) => <Badge tone={v >= 4 ? 'sage' : v >= 2 ? 'gold' : 'berry'}>{v.toFixed(2)}x</Badge> },
          ]}
          rows={data.marketingByChannel}
        />
      </Panel>

      <Panel title="Room product mix" subtitle="Four room types; ADR is revenue divided by room-nights sold">
        <DataTable
          compact
          columns={[
            { key: 'name', label: 'Room type' },
            { key: 'units', label: 'Room nights', align: 'right', render: (v) => number(v) },
            { key: 'revenue', label: 'Revenue', align: 'right', render: (v) => peso(v) },
            { key: 'adr', label: 'Avg nightly rate', align: 'right', render: (v) => peso(v) },
          ]}
          rows={data.roomMix.map((r) => ({ ...r, adr: r.units ? r.revenue / r.units : 0 }))}
        />
      </Panel>

      <Callout tone="caramel" icon="arrow" title="The descriptive picture in one sentence">
        Cascadja earns most of its money from a small number of high-ticket room stays, while marketing returns vary by more
        than 10x across channels. That combination is exactly what the predictive and prescriptive steps need to act on.
      </Callout>
    </div>
  );
}
