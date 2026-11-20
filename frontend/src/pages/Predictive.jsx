import { Link } from 'react-router-dom';
import { Chart } from 'react-chartjs-2';
import { api } from '../api.js';
import { useApi } from '../hooks.js';
import { compactPeso, number, percent, peso } from '../format.js';
import { baseOptions, PALETTE } from '../charts.js';
import Icon from '../components/Icon.jsx';
import { Badge, Callout, DataTable, ErrorNotice, KpiCard, PageIntro, PageLoader, Panel } from '../components/UI.jsx';

export default function Predictive() {
  const { data, loading, error, reload } = useApi(api.predictive, []);
  if (loading) return <PageLoader />;
  if (error) return <ErrorNotice message={error} onRetry={reload} />;

  const { model, actualVsFitted, forecast, occupancyForecast, drivers, nextMonth } = data;
  const months = data.descriptive.monthly;
  const pad = months.length;
  const labels = [...months.map((m) => m.label), ...forecast.map((f) => f.label)];

  const forecastData = {
    labels,
    datasets: [
      {
        label: 'Actual revenue',
        data: [...months.map((m) => m.revenue), ...forecast.map(() => null)],
        borderColor: '#3b2a20',
        backgroundColor: 'rgba(59,42,32,.08)',
        borderWidth: 2.5,
        tension: 0.3,
        pointRadius: 3,
        fill: true,
      },
      {
        label: 'Model fit',
        data: [...actualVsFitted.map((f) => f.fitted), ...forecast.map(() => null)],
        borderColor: '#c08552',
        borderDash: [5, 4],
        borderWidth: 2,
        tension: 0.3,
        pointRadius: 0,
        fill: false,
      },
      {
        label: 'Forecast',
        data: [...Array(pad - 1).fill(null), months[pad - 1].revenue, ...forecast.map((f) => f.revenue)],
        borderColor: '#6f7f63',
        backgroundColor: 'rgba(111,127,99,.1)',
        borderWidth: 2.5,
        borderDash: [2, 4],
        pointRadius: 4,
        pointBackgroundColor: '#6f7f63',
        tension: 0.3,
        fill: false,
      },
    ],
  };

  const scatterData = {
    datasets: [
      {
        label: 'Months',
        data: actualVsFitted.map((m) => ({ x: m.spend, y: m.actual, label: m.label })),
        backgroundColor: '#c08552',
        pointRadius: 6,
        pointHoverRadius: 8,
      },
      {
        type: 'line',
        label: 'Regression line',
        data: [
          { x: Math.min(...actualVsFitted.map((m) => m.spend)), y: model.intercept + model.slope * Math.min(...actualVsFitted.map((m) => m.spend)) },
          { x: Math.max(...actualVsFitted.map((m) => m.spend)), y: model.intercept + model.slope * Math.max(...actualVsFitted.map((m) => m.spend)) },
        ],
        borderColor: '#6f7f63',
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
      },
    ],
  };

  const driverData = {
    labels: drivers.map((d) => d.driver),
    datasets: [
      {
        label: 'Correlation with revenue',
        data: drivers.map((d) => d.correlation),
        backgroundColor: drivers.map((d) => (d.correlation >= 0 ? 'rgba(111,127,99,.85)' : 'rgba(164,74,63,.8)')),
        borderRadius: 5,
        maxBarThickness: 22,
      },
    ],
  };

  const occData = {
    labels,
    datasets: [
      {
        label: 'Actual occupancy',
        data: [...months.map((m) => m.occupancy), ...occupancyForecast.map(() => null)],
        borderColor: '#7d6b8f',
        backgroundColor: 'rgba(125,107,143,.12)',
        borderWidth: 2,
        tension: 0.35,
        pointRadius: 3,
        fill: true,
      },
      {
        label: 'Forecast',
        data: [...Array(pad - 1).fill(null), months[pad - 1].occupancy, ...occupancyForecast.map((o) => o.occupancy)],
        borderColor: '#a44a3f',
        borderDash: [4, 4],
        borderWidth: 2,
        pointRadius: 4,
        tension: 0.3,
        fill: false,
      },
    ],
  };

  return (
    <div className="page">
      <PageIntro
        eyebrow={`Predictive analytics · trained ${data.trainWindow}`}
        title="Forecast revenue from the marketing budget"
        lead="The predictive step takes the descriptive history and fits a simple linear regression of monthly revenue on monthly marketing spend. The model is intentionally transparent: one driver, one equation, and an honest error range that the prescriptive step can act on."
        actions={
          <Link to="/prescriptive" className="btn btn--ghost">
            Next: prescriptive <Icon name="arrow" size={16} />
          </Link>
        }
      />

      <div className="kpi-grid">
        <KpiCard label="Model R²" value={model.r2.toFixed(3)} hint={`${model.n} monthly observations`} icon="trend" tone="sage" />
        <KpiCard label="Forecast next month" value={compactPeso(nextMonth.revenue)} hint={`${nextMonth.label} · range ${compactPeso(nextMonth.lower)} – ${compactPeso(nextMonth.upper)}`} icon="wallet" tone="caramel" />
        <KpiCard label="Forecast error" value={percent(model.mape)} hint={`MAPE · RMSE ${compactPeso(model.rmse)}`} icon="target" tone="berry" />
        <KpiCard label="Revenue per +₱1k spend" value={peso(model.slope * 1000)} hint="Estimated marginal revenue" icon="spark" tone="plum" />
      </div>

      <div className="grid grid--main">
        <Panel title="Revenue forecast" subtitle="Actual, fitted and next-quarter forecast">
          <div className="chart-box chart-box--tall">
            <Chart
              type="line"
              data={forecastData}
              options={baseOptions({
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true, ticks: { callback: (v) => compactPeso(v) }, grid: { color: 'rgba(59,42,32,.07)' } },
                },
                plugins: {
                  legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 16 } },
                  tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y == null ? '—' : peso(ctx.parsed.y)}` } },
                },
              })}
            />
          </div>
        </Panel>

        <div className="stack">
          <Panel title="The model" subtitle={model.name}>
            <div className="equation">{model.equation}</div>
            <p className="model-note">{model.interpretation}</p>
            <div className="model-stats">
              <div><span>Slope</span><strong>{model.slope.toFixed(2)}</strong></div>
              <div><span>Intercept</span><strong>{compactPeso(model.intercept)}</strong></div>
              <div><span>R²</span><strong>{model.r2.toFixed(3)}</strong></div>
              <div><span>MAPE</span><strong>{percent(model.mape)}</strong></div>
            </div>
          </Panel>

          <Panel title="Forecast detail" subtitle="Assumes spend grows 3% per month">
            <DataTable
              compact
              columns={[
                { key: 'label', label: 'Month' },
                { key: 'spend', label: 'Spend', align: 'right', render: (v) => compactPeso(v) },
                { key: 'revenue', label: 'Forecast', align: 'right', render: (v) => compactPeso(v) },
                { key: 'range', label: 'Range', align: 'right', render: (_, row) => `${compactPeso(row.lower)} – ${compactPeso(row.upper)}` },
              ]}
              rows={forecast}
            />
          </Panel>
        </div>
      </div>

      <div className="grid grid--2">
        <Panel title="Marketing spend vs revenue" subtitle="Each point is one month; the line is the fitted regression">
          <div className="chart-box">
            <Chart
              type="scatter"
              data={scatterData}
              options={baseOptions({
                scales: {
                  x: {
                    title: { display: true, text: 'Monthly marketing spend', color: '#6d5a4c' },
                    ticks: { callback: (v) => compactPeso(v) },
                    grid: { color: 'rgba(59,42,32,.06)' },
                  },
                  y: {
                    title: { display: true, text: 'Monthly revenue', color: '#6d5a4c' },
                    beginAtZero: true,
                    ticks: { callback: (v) => compactPeso(v) },
                    grid: { color: 'rgba(59,42,32,.07)' },
                  },
                },
                plugins: {
                  legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 16 } },
                  tooltip: {
                    callbacks: {
                      label: (ctx) =>
                        ctx.dataset.type === 'line'
                          ? `Trend line`
                          : `${ctx.raw.label}: ${peso(ctx.raw.y)} revenue at ${peso(ctx.raw.x)} spend`,
                    },
                  },
                },
              })}
            />
          </div>
        </Panel>

        <Panel title="What moves revenue?" subtitle="Correlation of monthly revenue with each variable">
          <div className="chart-box">
            <Chart
              type="bar"
              data={driverData}
              options={baseOptions({
                indexAxis: 'y',
                scales: {
                  x: { min: -1, max: 1, grid: { color: 'rgba(59,42,32,.07)' }, ticks: { callback: (v) => v.toFixed(1) } },
                  y: { grid: { display: false } },
                },
                plugins: {
                  legend: { display: false },
                  tooltip: { callbacks: { label: (ctx) => `${ctx.parsed.x.toFixed(2)} correlation` } },
                },
              })}
            />
          </div>
        </Panel>
      </div>

      <div className="grid grid--2">
        <Panel title="Occupancy forecast" subtitle="Three-month moving average with a damped trend">
          <div className="chart-box">
            <Chart
              type="line"
              data={occData}
              options={baseOptions({
                scales: {
                  x: { grid: { display: false } },
                  y: { beginAtZero: true, max: 100, ticks: { callback: (v) => `${v}%` }, grid: { color: 'rgba(59,42,32,.07)' } },
                },
                plugins: {
                  legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 16 } },
                  tooltip: { callbacks: { label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y == null ? '—' : `${ctx.parsed.y}%`}` } },
                },
              })}
            />
          </div>
        </Panel>

        <Panel title="Drivers ranked by strength" subtitle="Absolute correlation with monthly revenue">
          <ul className="rank-list">
            {drivers.map((d) => (
              <li key={d.driver}>
                <span className="rank-list__name">{d.driver}</span>
                <span className="rank-list__bar">
                  <span style={{ width: `${Math.abs(d.correlation) * 100}%`, background: d.correlation >= 0 ? '#6f7f63' : '#a44a3f' }} />
                </span>
                <Badge tone={d.correlation >= 0 ? 'sage' : 'berry'}>{d.correlation.toFixed(2)}</Badge>
              </li>
            ))}
          </ul>
          <p className="muted small">
            Room nights and occupancy are the strongest correlates, which is why the prescriptive step treats room pricing and
            marketing spend as the two levers that matter most.
          </p>
        </Panel>
      </div>

      <Callout tone="sage" icon="trend" title="How this prediction is used">
        At the current spend trajectory, revenue is forecast at {compactPeso(forecast[0].revenue)} for {forecast[0].label} and{' '}
        {compactPeso(forecast[2].revenue)} for {forecast[2].label}. The model explains {percent(model.r2 * 100)} of monthly
        revenue variation, so the prescriptive page uses it as the revenue baseline while the budget optimizer decides how to
        split spend across channels.
        <Link to="/prescriptive" className="inline-link">
          Open the prescriptive simulator <Icon name="arrow" size={14} />
        </Link>
      </Callout>
    </div>
  );
}
