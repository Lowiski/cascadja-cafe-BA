import { useEffect, useState } from 'react';
import { Chart } from 'react-chartjs-2';
import { api } from '../api.js';
import { useApi } from '../hooks.js';
import { compactPeso, number, percent, peso, signedPercent, signedPeso } from '../format.js';
import { baseOptions, moneyTooltip } from '../charts.js';
import Icon from '../components/Icon.jsx';
import { Badge, Callout, DataTable, ErrorNotice, KpiCard, PageIntro, PageLoader, Panel, StatRow } from '../components/UI.jsx';

export default function Prescriptive() {
  const initial = useApi(() => api.prescriptive({}), []);
  const [budget, setBudget] = useState(null);
  const [rateChange, setRateChange] = useState(0);
  const [result, setResult] = useState(null);
  const [running, setRunning] = useState(false);
  const [simError, setSimError] = useState(null);

  useEffect(() => {
    if (initial.data && budget === null) setBudget(initial.data.currentMonthlySpend);
  }, [initial.data, budget]);

  useEffect(() => {
    if (budget === null) return undefined;
    const timer = setTimeout(async () => {
      setRunning(true);
      setSimError(null);
      try {
        const res = await api.prescriptive({ monthlyBudget: budget, rateChangePct: rateChange });
        setResult(res);
      } catch (err) {
        setSimError(err.message);
      } finally {
        setRunning(false);
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [budget, rateChange]);

  if (initial.loading || (!result && !initial.error)) return <PageLoader />;
  if (initial.error) return <ErrorNotice message={initial.error} onRetry={initial.reload} />;
  if (!result) return <ErrorNotice message={simError || 'Could not build the scenario.'} onRetry={initial.reload} />;

  const { optimization, scenario, roomPricing, recommendations } = result;
  const rows = optimization.allocation;

  const allocationData = {
    labels: rows.map((r) => r.channel),
    datasets: [
      {
        label: 'Current monthly spend',
        data: rows.map((r) => r.currentSpend),
        backgroundColor: 'rgba(192,133,82,.55)',
        borderRadius: 4,
        maxBarThickness: 18,
      },
      {
        label: 'Recommended spend',
        data: rows.map((r) => r.recommendedSpend),
        backgroundColor: 'rgba(111,127,99,.9)',
        borderRadius: 4,
        maxBarThickness: 18,
      },
    ],
  };

  const profitTone = scenario.estimatedProfit >= 0 ? 'sage' : 'berry';

  return (
    <div className="page">
      <PageIntro
        eyebrow="Prescriptive analytics · scenario simulator"
        title="Set the budget, then let the data allocate it"
        lead="The optimizer reallocates the same marketing budget toward the channels with the strongest measured return, while respecting realistic caps. Move the sliders to test a budget or room-rate decision and watch the projected revenue, occupancy and profit update."
        actions={
          <button
            className="btn btn--ghost"
            onClick={() => {
              setBudget(result.currentMonthlySpend);
              setRateChange(0);
            }}
          >
            <Icon name="refresh" size={16} /> Reset scenario
          </button>
        }
      />

      <Panel title="Scenario controls" subtitle="Changes apply automatically after a short pause" action={running ? <Badge tone="gold">Updating…</Badge> : <Badge tone="sage">Live</Badge>}>
        <div className="controls">
          <label className="control">
            <div className="control__top">
              <span>Monthly marketing budget</span>
              <strong>{peso(budget ?? 0)}</strong>
            </div>
            <input
              type="range"
              min="8000"
              max="80000"
              step="1000"
              value={budget ?? 25000}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
            <div className="control__scale">
              <span>₱8k</span>
              <span>Current avg {peso(result.currentMonthlySpend)}</span>
              <span>₱80k</span>
            </div>
          </label>

          <label className="control">
            <div className="control__top">
              <span>Room rate change</span>
              <strong>{signedPercent(rateChange, 0)}</strong>
            </div>
            <input
              type="range"
              min="-20"
              max="20"
              step="1"
              value={rateChange}
              onChange={(e) => setRateChange(Number(e.target.value))}
            />
            <div className="control__scale">
              <span>−20%</span>
              <span>Current ADR {peso(roomPricing.currentAdr)}</span>
              <span>+20%</span>
            </div>
          </label>
        </div>
        {simError && <p className="form-error">{simError}</p>}
      </Panel>

      <div className="kpi-grid">
        <KpiCard
          label="Projected monthly revenue"
          value={compactPeso(scenario.projectedMonthlyRevenue)}
          hint={`Model baseline ${compactPeso(scenario.modelRevenue)} · R² ${scenario.modelR2}`}
          icon="wallet"
          tone="caramel"
        />
        <KpiCard
          label="Estimated monthly profit"
          value={compactPeso(scenario.estimatedProfit)}
          hint={`${percent(scenario.margin)} net margin`}
          icon="target"
          tone={profitTone}
        />
        <KpiCard
          label="Attributed revenue lift"
          value={signedPercent(optimization.liftPct)}
          hint={`${compactPeso(optimization.projectedAttributedRevenue)} vs ${compactPeso(optimization.baselineAttributedRevenue)}`}
          icon="trend"
          tone="sage"
        />
        <KpiCard
          label="Projected occupancy"
          value={percent(scenario.occupancy)}
          hint={`ADR ${peso(scenario.adr)} · room rate ${signedPercent(rateChange, 0)}`}
          icon="bed"
          tone="plum"
        />
      </div>

      <div className="grid grid--main">
        <Panel
          title="Recommended budget allocation"
          subtitle="Same budget, better mix — current vs optimized monthly spend"
          action={<Badge tone="sage">ROI {optimization.projectedRoi.toFixed(2)}x</Badge>}
        >
          <div className="chart-box chart-box--tall">
            <Chart
              type="bar"
              data={allocationData}
              options={baseOptions({
                indexAxis: 'y',
                scales: {
                  x: { beginAtZero: true, grid: { color: 'rgba(59,42,32,.07)' }, ticks: { callback: (v) => compactPeso(v) } },
                  y: { grid: { display: false } },
                },
                plugins: {
                  legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 8, padding: 16 } },
                  tooltip: moneyTooltip,
                },
              })}
            />
          </div>
        </Panel>

        <Panel title="Scenario P&amp;L" subtitle={`Budget ${peso(scenario.marketingSpend)} · rate ${signedPercent(rateChange, 0)}`}>
          <div className="pl">
            <StatRow label="Projected revenue" value={peso(scenario.projectedMonthlyRevenue)} />
            <StatRow label="Cost of goods sold" value={`−${peso(scenario.cogs)}`} />
            <StatRow label="Marketing" value={`−${peso(scenario.marketingSpend)}`} />
            <StatRow label="Fixed operating cost" value={`−${peso(scenario.fixedCost)}`} />
            <StatRow label="Estimated profit" value={peso(scenario.estimatedProfit)} tone={profitTone} />
          </div>
          <div className="pl-split">
            <span>Cafe <strong>{peso(scenario.cafeRevenue)}</strong></span>
            <span>Rooms <strong>{peso(scenario.roomRevenue)}</strong></span>
          </div>
          <p className="muted small">Revenue is split between cafe and rooms using the historical mix.</p>
        </Panel>
      </div>

      <Panel title="Allocation detail" subtitle="Per-channel changes and their projected contribution">
        <DataTable
          columns={[
            { key: 'channel', label: 'Channel' },
            { key: 'currentSpend', label: 'Current', align: 'right', render: (v) => peso(v) },
            { key: 'recommendedSpend', label: 'Recommended', align: 'right', render: (v) => peso(v) },
            {
              key: 'change',
              label: 'Change',
              align: 'right',
              render: (v) => (
                <span className={v >= 0 ? 'delta delta--up' : 'delta delta--down'}>
                  {v >= 0 ? '▲' : '▼'} {peso(Math.abs(v))}
                </span>
              ),
            },
            { key: 'changePct', label: '%', align: 'right', render: (v) => signedPercent(v, 0) },
            { key: 'roi', label: 'ROI', align: 'right', render: (v) => <Badge tone={v >= 4 ? 'sage' : v >= 2 ? 'gold' : 'berry'}>{v.toFixed(2)}x</Badge> },
            { key: 'projectedRevenue', label: 'Projected revenue', align: 'right', render: (v) => peso(v) },
          ]}
          rows={rows}
        />
      </Panel>

      <div className="recommendation-grid">
        <Panel title="Recommended actions" subtitle="Generated from the current data and scenario">
          <div className="rec-list">
            {recommendations.map((rec) => (
              <article className="rec" key={rec.title}>
                <Badge tone="caramel">{rec.tag}</Badge>
                <div>
                  <h4>{rec.title}</h4>
                  <p>{rec.detail}</p>
                  <span className="rec__impact">
                    <Icon name="trend" size={14} /> {rec.impact}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <div className="stack">
          <Panel title="Room pricing" subtitle="Based on occupancy and an elasticity of −1.1">
            <div className="price-block">
              <div>
                <span className="price-block__label">Current ADR</span>
                <strong>{peso(roomPricing.currentAdr)}</strong>
              </div>
              <Icon name="arrow" size={20} />
              <div>
                <span className="price-block__label">Suggested rate</span>
                <strong className="price-block__new">{peso(roomPricing.suggestedRate)}</strong>
              </div>
            </div>
            <p className="price-change">
              {signedPercent(roomPricing.suggestedChangePct, 0)} vs current · occupancy {percent(roomPricing.occupancy)}
            </p>
            <p className="model-note">{roomPricing.rationale}</p>
            <div className="pl-split">
              <span>Revenue impact <strong className="delta--up">{signedPeso(roomPricing.suggestedRate - roomPricing.currentAdr)} / night</strong></span>
            </div>
          </Panel>

          <Panel title="Profit snapshot" subtitle="Estimated monthly result">
            <div className="profit-badge">
              <span>Net margin</span>
              <strong>{percent(scenario.margin)}</strong>
              <small>{scenario.estimatedProfit >= 0 ? 'Profitable scenario' : 'Loss-making scenario'}</small>
            </div>
          </Panel>
        </div>
      </div>

      <Callout tone="sage" icon="compass" title="Why this is prescriptive, not just descriptive">
        The recommended mix is not a hunch: {rows[0].channel} receives the largest allocation because its measured ROI is{' '}
        {rows[0].roi.toFixed(2)}x, while the lowest-return channel is trimmed. The projected lift of{' '}
        {signedPercent(optimization.liftPct)} is measured against spending the same budget in the current mix. Every number on
        this page changes when the sliders move.
      </Callout>

      <Panel title="Assumptions" subtitle="Read these before presenting the results">
        <ul className="assumption-list">
          {result.assumptions.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </Panel>
    </div>
  );
}
