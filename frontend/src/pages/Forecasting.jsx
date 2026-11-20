import SalesLineChart from '../components/charts/SalesLineChart.jsx';
import { getPredictive } from '../services/analyticsService.js';
import { useFetch } from '../hooks/useFetch.js';
import { compactPeso, number, percent, peso } from '../format.js';
import { baseOptions, moneyTick } from '../charts.js';
import { Badge, Callout, DataTable, ErrorNotice, KpiCard, PageIntro, PageLoader, Panel, StatRow } from '../components/UI.jsx';

export default function Forecasting() {
  const { data, loading, error, reload } = useFetch(getPredictive, []);
  if (loading) return <PageLoader />;
  if (error) return <ErrorNotice message={error} onRetry={reload} />;

  const m = data.model;
  const chartData = {
    labels: data.forecast.map((f) => f.date.slice(5)),
    datasets: [
      { label: 'Upper band', data: data.forecast.map((f) => f.upper), borderColor: 'rgba(111,127,99,.35)', borderDash: [5, 5], pointRadius: 0, fill: false, tension: 0.3 },
      { label: 'Forecast', data: data.forecast.map((f) => f.forecast), borderColor: '#a44a3f', backgroundColor: 'rgba(164,74,63,.12)', borderWidth: 2.5, tension: 0.3, fill: true, pointRadius: 4, pointBackgroundColor: '#a44a3f' },
      { label: 'Lower band', data: data.forecast.map((f) => f.lower), borderColor: 'rgba(111,127,99,.35)', borderDash: [5, 5], pointRadius: 0, fill: false, tension: 0.3 },
    ],
  };

  return (
    <div className="page">
      <PageIntro
        eyebrow="Predictive analytics · what will happen"
        title="A simple, explainable sales forecast"
        lead="Daily sales are forecast with a weekday seasonal average: each future day is predicted from the average sales of that same weekday. It matches a café's repeating weekly rhythm and produces honest error bands."
        actions={<Badge tone="sage">Trained {data.trainWindow}</Badge>}
      />

      <div className="kpi-grid">
        <KpiCard label="Next 7 days" value={compactPeso(data.nextWeek.revenue)} hint={`±${peso(data.nextWeek.band)} residual band`} icon="trend" tone="caramel" />
        <KpiCard label="R²" value={m.r2.toFixed(3)} hint={`${number(m.n)} daily observations`} icon="chart" tone="sage" />
        <KpiCard label="MAPE" value={`${m.mape.toFixed(1)}%`} hint={`RMSE ${peso(m.rmse)}`} icon="target" tone="berry" />
        <KpiCard label="Weekly band" value={`±${peso(data.nextWeek.band)}`} hint="1.96 × residual standard deviation" icon="wallet" tone="plum" />
      </div>

      <Panel title="Seven-day sales forecast" subtitle="Forecast line with ±1.96 × residual standard deviation band">
        <div className="chart-box chart-box--tall">
          <SalesLineChart
            type="line"
            data={chartData}
            options={baseOptions({
              scales: {
                x: { grid: { display: false } },
                y: { beginAtZero: true, ticks: { callback: moneyTick }, grid: { color: 'rgba(59,42,32,.07)' } },
              },
            })}
          />
        </div>
      </Panel>

      <div className="grid grid--main">
        <Panel title="Forecast detail" subtitle="Date, expected sales and plausible range">
          <DataTable
            compact
            columns={[
              { key: 'date', label: 'Date' },
              { key: 'weekday', label: 'Day' },
              { key: 'forecast', label: 'Forecast', align: 'right', render: (v) => peso(v) },
              { key: 'lower', label: 'Lower', align: 'right', render: (v) => peso(v) },
              { key: 'upper', label: 'Upper', align: 'right', render: (v) => peso(v) },
            ]}
            rows={data.forecast}
          />
        </Panel>

        <div className="stack">
          <Panel title="The model" subtitle="Transparent and reproducible">
            <div className="pl">
              <StatRow label="Equation" value={m.equation} />
              <StatRow label="Linear trend (reference)" value={`${peso(m.slope)} / day`} />
              <StatRow label="Observations" value={number(m.n)} />
            </div>
            <p className="model-note">{m.interpretation}</p>
          </Panel>
          <Callout tone="sage" icon="compass" title="How to use this">
            Treat the band as a planning range, not a promise. Use the daypart view below to turn the expected total into staffing and prep quantities.
          </Callout>
        </div>
      </div>

      <Panel title="Expected sales by daypart" subtitle="Daily average learned from the descriptive stage">
        <DataTable
          columns={[
            { key: 'daypart', label: 'Daypart' },
            { key: 'revenuePerDay', label: 'Sales per day', align: 'right', render: (v) => peso(v) },
            { key: 'ordersPerDay', label: 'Orders per day', align: 'right', render: (v) => number(v, 1) },
          ]}
          rows={data.daypartForecast}
        />
      </Panel>

      <Panel title="Assumptions and next steps" subtitle="Be honest in the defence">
        <ul className="assumption-list">
          <li>Transactions are generated sample rows based on the real menu prices, not a live POS export.</li>
          <li>The model uses time only; daypart, channel, weekday and promotions are not yet regression drivers.</li>
          <li>Next: replace the generated rows with actual daily sales, then test holiday/weekend effects and channel-specific forecasts.</li>
        </ul>
      </Panel>
    </div>
  );
}
