import { Link } from 'react-router-dom';
import SalesLineChart from '../components/charts/SalesLineChart.jsx';
import ProductBarChart from '../components/charts/ProductBarChart.jsx';
import CategoryPieChart from '../components/charts/CategoryPieChart.jsx';
import { api } from '../api.js';
import { useApi } from '../hooks.js';
import { compactPeso, number, percent, peso } from '../format.js';
import { PALETTE, PALETTE_SOFT, baseOptions, comboOptions, doughnutOptions, horizontalOptions } from '../charts.js';
import Icon from '../components/Icon.jsx';
import { Callout, ErrorNotice, KpiCard, PageIntro, PageLoader, Panel } from '../components/UI.jsx';

export default function Dashboard() {
  const { data, loading, error, reload } = useApi(api.descriptive, []);
  const { data: meta } = useApi(api.meta, []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorNotice message={error} onRetry={reload} />;

  const k = data.kpis;
  const monthly = data.monthly;
  const topRoi = data.marketingByChannel[0];
  const lowRoi = data.marketingByChannel[data.marketingByChannel.length - 1];
  const cafeProduct = data.topProducts[0];

  const trendData = {
    labels: monthly.map((m) => m.label),
    datasets: [
      {
        type: 'bar',
        label: 'Revenue',
        data: monthly.map((m) => m.revenue),
        backgroundColor: 'rgba(192,133,82,.78)',
        hoverBackgroundColor: '#c08552',
        borderRadius: 6,
        maxBarThickness: 30,
        yAxisID: 'y',
      },
      {
        type: 'line',
        label: 'Marketing spend',
        data: monthly.map((m) => m.marketingSpend),
        borderColor: '#6f7f63',
        backgroundColor: 'rgba(111,127,99,.12)',
        borderWidth: 2,
        tension: 0.36,
        pointRadius: 3,
        pointBackgroundColor: '#6f7f63',
        fill: false,
        yAxisID: 'y1',
      },
    ],
  };

  const channelData = {
    labels: data.byChannel.map((c) => c.channel),
    datasets: [
      {
        data: data.byChannel.map((c) => c.revenue),
        backgroundColor: PALETTE_SOFT,
        borderColor: '#fffdf9',
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const productData = {
    labels: data.topProducts.slice(0, 7).map((p) => p.name),
    datasets: [
      {
        label: 'Revenue',
        data: data.topProducts.slice(0, 7).map((p) => p.revenue),
        backgroundColor: 'rgba(164,74,63,.78)',
        hoverBackgroundColor: '#a44a3f',
        borderRadius: 5,
        maxBarThickness: 20,
      },
    ],
  };

  const roiData = {
    labels: data.marketingByChannel.map((c) => c.channel),
    datasets: [
      {
        label: 'Return per ₱1',
        data: data.marketingByChannel.map((c) => c.roi),
        backgroundColor: data.marketingByChannel.map((c) => (c.roi >= 4 ? 'rgba(111,127,99,.85)' : c.roi >= 2 ? 'rgba(217,164,65,.85)' : 'rgba(164,74,63,.8)')),
        borderRadius: 5,
        maxBarThickness: 20,
      },
    ],
  };

  const occupancyData = {
    labels: monthly.map((m) => m.label),
    datasets: [
      {
        label: 'Occupancy',
        data: monthly.map((m) => m.occupancy),
        borderColor: '#7d6b8f',
        backgroundColor: 'rgba(125,107,143,.14)',
        borderWidth: 2,
        tension: 0.35,
        fill: true,
        pointRadius: 3,
      },
      {
        label: 'Target 55%',
        data: monthly.map(() => 55),
        borderColor: 'rgba(59,42,32,.28)',
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  return (
    <div className="page">
      <PageIntro
        eyebrow="Capstone problem · Cascadja Cafe"
        title="Growth is there. The question is where to spend."
        lead={`Cascadja Cafe is a coffee shop and four-room inn. Rooms deliver ${percent(k.roomShare)} of revenue from roughly one in ten transactions, while the cafe is under-attached to overnight stays. Marketing spend is decided by gut feel. This dashboard asks which channels actually create revenue, what the next quarter looks like, and how the budget and room rates should be set.`}
        actions={
          <>
            <Link to="/descriptive" className="btn btn--primary">
              Start with the data <Icon name="arrow" size={16} />
            </Link>
            <Link to="/case-study" className="btn btn--ghost">
              Read the case study
            </Link>
          </>
        }
      />

      <div className="kpi-grid">
        <KpiCard
          label="Total revenue"
          value={compactPeso(k.totalRevenue)}
          hint={`${peso(k.totalRevenue)} over 12 months`}
          icon="wallet"
          tone="caramel"
        />
        <KpiCard
          label="Transactions"
          value={number(k.transactions)}
          hint={`${peso(k.avgOrder)} average order value`}
          icon="cart"
          tone="sage"
        />
        <KpiCard
          label="Marketing ROI"
          value={`${k.marketingRoi.toFixed(2)}x`}
          hint={`${compactPeso(k.marketingSpend)} spend → ${compactPeso(k.attributedRevenue)} attributed`}
          icon="target"
          tone="berry"
        />
        <KpiCard
          label="Room occupancy"
          value={percent(k.occupancy)}
          hint={`ADR ${peso(k.adr)} · ${number(k.roomNights)} room nights`}
          icon="bed"
          tone="plum"
        />
      </div>

      <div className="step-grid">
        <Link to="/descriptive" className="step-card">
          <span className="step-card__num">01</span>
          <div>
            <span className="step-card__tag">Descriptive</span>
            <h3>What happened?</h3>
            <p>Revenue, channels, products, customers and campaign efficiency across the year.</p>
          </div>
          <Icon name="arrow" size={18} />
        </Link>
        <Link to="/predictive" className="step-card">
          <span className="step-card__num">02</span>
          <div>
            <span className="step-card__tag">Predictive</span>
            <h3>What will happen?</h3>
            <p>A regression model links marketing spend to revenue and forecasts the next quarter.</p>
          </div>
          <Icon name="arrow" size={18} />
        </Link>
        <Link to="/prescriptive" className="step-card">
          <span className="step-card__num">03</span>
          <div>
            <span className="step-card__tag">Prescriptive</span>
            <h3>What should we do?</h3>
            <p>Reallocate the budget, reprice rooms and lift cafe attach — with a live scenario simulator.</p>
          </div>
          <Icon name="arrow" size={18} />
        </Link>
      </div>

      <div className="insight-grid">
        <div className="insight">
          <span className="insight__icon insight__icon--caramel"><Icon name="bed" size={18} /></span>
          <h4>Rooms carry the P&amp;L</h4>
          <p>
            Lodging is {percent(k.roomShare)} of revenue from only 10% of transactions. Protecting occupancy and rate matters
            more than adding another cafe item.
          </p>
        </div>
        <div className="insight">
          <span className="insight__icon insight__icon--sage"><Icon name="target" size={18} /></span>
          <h4>{topRoi.channel} is the efficient channel</h4>
          <p>
            {topRoi.channel} returns ₱{topRoi.roi.toFixed(2)} per ₱1, against ₱{lowRoi.roi.toFixed(2)} for {lowRoi.channel}.
            The gap is the fastest budget win on the board.
          </p>
        </div>
        <div className="insight">
          <span className="insight__icon insight__icon--berry"><Icon name="coffee" size={18} /></span>
          <h4>Cafe attach is the upside</h4>
          <p>
            {percent(k.roomAttachRate)} of room stays include a cafe item. A check-in coffee bundle turns room guests into
            cafe revenue at almost no acquisition cost.
          </p>
        </div>
        <div className="insight">
          <span className="insight__icon insight__icon--plum"><Icon name="users" size={18} /></span>
          <h4>{cafeProduct?.name} leads the menu</h4>
          <p>
            {cafeProduct?.name} is the top cafe product at {compactPeso(cafeProduct?.revenue)}. Feature it in bundles to
            grow the cafe side of the business.
          </p>
        </div>
      </div>

      <Panel
        title="Revenue vs marketing spend"
        subtitle="Monthly revenue (bars) and marketing investment (line, right axis)"
      >
        <div className="chart-box chart-box--tall">
          <SalesLineChart data={trendData} options={comboOptions()} />
        </div>
      </Panel>

      <div className="grid grid--2">
        <Panel title="Revenue by sales channel" subtitle="Where the money comes from">
          <div className="chart-box">
            <CategoryPieChart data={channelData} options={doughnutOptions()} />
          </div>
        </Panel>
        <Panel title="Top cafe products" subtitle="Revenue by menu item, last 12 months">
          <div className="chart-box">
            <ProductBarChart data={productData} options={horizontalOptions()} />
          </div>
        </Panel>
        <Panel title="Marketing channel efficiency" subtitle="Attributed revenue returned per ₱1 of spend">
          <div className="chart-box">
            <ProductBarChart
              data={roiData}
              options={baseOptions({
                indexAxis: 'y',
                scales: {
                  x: { beginAtZero: true, grid: { color: 'rgba(59,42,32,.07)' }, ticks: { callback: (v) => `${v}x` } },
                  y: { grid: { display: false } },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.x.toFixed(2)}x return per ₱1` } },
                },
              })}
            />
          </div>
        </Panel>
        <Panel title="Room occupancy trend" subtitle="Occupied room-nights ÷ available room-nights">
          <div className="chart-box">
            <SalesLineChart
              type="line"
              data={occupancyData}
              options={baseOptions({
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true, max: 100, ticks: { callback: (v) => `${v}%` }, grid: { color: 'rgba(59,42,32,.07)' } },
                },
              })}
            />
          </div>
        </Panel>
      </div>

      <Callout tone="sage" icon="database" title="Five variables, one integrated database">
        This dashboard reads live from {meta?.mode === 'neon' ? 'a Neon Postgres database' : 'the built-in demo dataset'}:
        <div className="var-chips">
          {(meta?.variables || []).map((v) => (
            <span className="var-chip" key={v.key}>
              <strong>{number(v.count)}</strong> {v.label}
            </span>
          ))}
        </div>
      </Callout>
    </div>
  );
}
