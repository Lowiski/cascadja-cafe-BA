import { Link } from 'react-router-dom';
import SalesLineChart from '../components/charts/SalesLineChart.jsx';
import ProductBarChart from '../components/charts/ProductBarChart.jsx';
import CategoryPieChart from '../components/charts/CategoryPieChart.jsx';
import { getDescriptive, getMenu } from '../services/analyticsService.js';
import { meta as getMeta } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { compactPeso, number, percent, peso } from '../format.js';
import { PALETTE_SOFT, baseOptions, doughnutOptions, horizontalOptions, moneyTick } from '../charts.js';
import Icon from '../components/Icon.jsx';
import { Badge, Callout, ErrorNotice, KpiCard, PageIntro, PageLoader, Panel, StatRow } from '../components/UI.jsx';

const MS_PER_DAY = 86400000;

function shortDate(value) {
  return String(value || '').slice(5);
}

export default function Dashboard() {
  const { data, loading, error, reload } = useFetch(getDescriptive, []);
  const { data: meta } = useFetch(getMeta, []);
  const { data: menuData } = useFetch(getMenu, []);

  if (loading) return <PageLoader />;
  if (error) return <ErrorNotice message={error} onRetry={reload} />;

  const k = data.kpis;
  const recent = data.daily.slice(-60);
  const topItem = data.topItems[0] || { name: '—', revenue: 0 };
  const topCategory = data.byCategory[0] || { category: '—', share: 0 };
  const topAddon = data.addons[0] || { name: '—', count: 0 };

  const trendData = {
    labels: recent.map((d) => shortDate(d.date)),
    datasets: [
      {
        label: 'Daily sales',
        data: recent.map((d) => d.revenue),
        borderColor: '#c08552',
        backgroundColor: 'rgba(192,133,82,.16)',
        borderWidth: 2,
        tension: 0.32,
        fill: true,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const categoryData = {
    labels: data.byCategory.map((c) => c.category),
    datasets: [
      {
        label: 'Revenue',
        data: data.byCategory.map((c) => c.revenue),
        backgroundColor: 'rgba(164,74,63,.78)',
        hoverBackgroundColor: '#a44a3f',
        borderRadius: 5,
        maxBarThickness: 20,
      },
    ],
  };

  const daypartData = {
    labels: data.byDaypart.map((p) => p.daypart),
    datasets: [
      {
        label: 'Revenue',
        data: data.byDaypart.map((p) => p.revenue),
        backgroundColor: PALETTE_SOFT,
        borderRadius: 6,
        maxBarThickness: 38,
      },
    ],
  };

  const channelData = {
    labels: data.byChannel.map((c) => c.channel),
    datasets: [
      {
        data: data.byChannel.map((c) => c.revenue),
        backgroundColor: ['rgba(192,133,82,.86)', 'rgba(79,124,130,.86)'],
        borderColor: '#fffdf9',
        borderWidth: 3,
        hoverOffset: 8,
      },
    ],
  };

  const days = data.period.days || data.daily.length || 1;

  return (
    <div className="page">
      <PageIntro
        eyebrow="Cascadja Foods and Drinks · Kasadya Park & Play, Cordova, Cebu"
        title="Real menu. Real variables. A plan you can act on."
        lead={`Cascadja sells coffee, frappes, milkteas, rice meals, pasta, snacks and desserts to walk-in guests and Foodpanda customers. This dashboard uses the actual menu prices (₱90–₱245), five required variables plus sales channel, and ${number(data.kpis.lines)} generated sample sales lines to show what is selling, when, and what to do next.`}
        actions={
          <>
            <Link to="/analytics" className="btn btn--primary">
              Explore the data <Icon name="arrow" size={16} />
            </Link>
            <Link to="/case-study" className="btn btn--ghost">
              Read the case study
            </Link>
          </>
        }
      />

      <div className="kpi-grid">
        <KpiCard label="Total sales" value={compactPeso(k.totalSales)} hint={`${peso(k.totalSales)} · ${days} days`} icon="wallet" tone="caramel" />
        <KpiCard label="Orders" value={number(k.orders)} hint={`${peso(k.avgOrder)} average order`} icon="cart" tone="sage" />
        <KpiCard label="Items sold" value={number(k.itemsSold)} hint={`${number(k.lines)} sold lines · ${peso(k.avgItemPrice)} average item`} icon="coffee" tone="berry" />
        <KpiCard label="Add-on attach" value={percent(k.addonAttachRate)} hint={`${compactPeso(k.addonRevenue)} from ₱10 / ₱35 add-ons`} icon="target" tone="plum" />
      </div>

      <div className="step-grid">
        <Link to="/analytics" className="step-card">
          <span className="step-card__num">01</span>
          <div>
            <span className="step-card__tag">Descriptive</span>
            <h3>What happened?</h3>
            <p>Sales by item, category, daypart and channel — using the real menu and prices.</p>
          </div>
          <Icon name="arrow" size={18} />
        </Link>
        <Link to="/forecasting" className="step-card">
          <span className="step-card__num">02</span>
          <div>
            <span className="step-card__tag">Predictive</span>
            <h3>What will happen?</h3>
            <p>A transparent daily-sales trend with a seven-day revenue forecast and band.</p>
          </div>
          <Icon name="arrow" size={18} />
        </Link>
        <Link to="/recommendations" className="step-card">
          <span className="step-card__num">03</span>
          <div>
            <span className="step-card__tag">Prescriptive</span>
            <h3>What should we do?</h3>
            <p>Add-on prompts, Foodpanda bundles and daypart staffing — with a live scenario.</p>
          </div>
          <Icon name="arrow" size={18} />
        </Link>
      </div>

      <div className="insight-grid">
        <div className="insight">
          <span className="insight__icon insight__icon--caramel"><Icon name="coffee" size={18} /></span>
          <h4>{topItem.name} leads the menu</h4>
          <p>{compactPeso(topItem.revenue)} in sales. Feature it on the board and at the top of the Foodpanda listing.</p>
        </div>
        <div className="insight">
          <span className="insight__icon insight__icon--sage"><Icon name="chart" size={18} /></span>
          <h4>{topCategory.category} is the biggest group</h4>
          <p>{percent(topCategory.share)} of total sales. The category view shows where demand concentrates.</p>
        </div>
        <div className="insight">
          <span className="insight__icon insight__icon--berry"><Icon name="target" size={18} /></span>
          <h4>{k.busiestDaypart} is the peak</h4>
          <p>{k.busiestDay} is the busiest day. Staff and prep around this window rather than covering all hours equally.</p>
        </div>
        <div className="insight">
          <span className="insight__icon insight__icon--plum"><Icon name="cart" size={18} /></span>
          <h4>Foodpanda is {percent(k.foodpandaShare)} of sales</h4>
          <p>Dine-in is {percent(k.dineInShare)}. Delivery is a real channel, not an afterthought — {topAddon.name} is the leading add-on.</p>
        </div>
      </div>

      <Panel title="Daily sales trend" subtitle={`Last ${recent.length} days · click the Analytics page for the full period`}>
        <div className="chart-box chart-box--tall">
          <SalesLineChart
            type="line"
            data={trendData}
            options={baseOptions({
              scales: {
                x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkipPadding: 14 } },
                y: { beginAtZero: true, grid: { color: 'rgba(59,42,32,.07)' }, ticks: { callback: moneyTick } },
              },
              plugins: { legend: { display: false } },
            })}
          />
        </div>
      </Panel>

      <div className="grid grid--2">
        <Panel title="Revenue by category" subtitle="Real menu groups, real prices">
          <div className="chart-box">
            <ProductBarChart data={categoryData} options={horizontalOptions()} />
          </div>
        </Panel>
        <Panel title="Revenue by daypart" subtitle="Morning · Lunch · Afternoon · Evening · Late Night">
          <div className="chart-box">
            <ProductBarChart
              data={daypartData}
              options={baseOptions({
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true, ticks: { callback: moneyTick }, grid: { color: 'rgba(59,42,32,.07)' } },
                },
              })}
            />
          </div>
        </Panel>
        <Panel title="Dine-in vs Foodpanda" subtitle="Share of total sales">
          <div className="chart-box">
            <CategoryPieChart data={channelData} options={doughnutOptions()} />
          </div>
        </Panel>
        <Panel title="At a glance" subtitle="The numbers behind the charts">
          <div className="pl">
            <StatRow label="Bestseller share" value={percent(k.bestsellerShare)} />
            <StatRow label="Food vs drinks" value={`${percent(k.foodShare)} / ${percent(k.drinkShare)}`} />
            <StatRow label="Sales per day" value={peso(k.salesPerDay)} />
            <StatRow label="Orders per day" value={number(k.ordersPerDay, 1)} />
            <StatRow label="Menu items" value={number(menuData?.menu?.length || 0)} />
          </div>
          <p className="muted small">Prices and ★ bestseller flags come from the owner's menu photos.</p>
        </Panel>
      </div>

      <Callout tone="sage" icon="database" title="Six variables, one clean fact table">
        {meta?.mode === 'neon'
          ? 'Reading live from the Neon Postgres sales_fact table.'
          : 'Running on deterministic SAMPLE transactions generated from the real menu. Replace sales_fact with a POS / Foodpanda export when it is available.'}
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
