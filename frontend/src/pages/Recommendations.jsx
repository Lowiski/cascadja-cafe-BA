import { useState } from 'react';
import { getPrescriptive } from '../services/analyticsService.js';
import { useFetch, useDebounced } from '../hooks/useFetch.js';
import { compactPeso, number, percent, peso, signedPercent } from '../format.js';
import Icon from '../components/Icon.jsx';
import { Badge, Callout, DataTable, ErrorNotice, KpiCard, PageIntro, PageLoader, Panel, StatRow } from '../components/UI.jsx';

export default function Recommendations() {
  const [attachTarget, setAttachTarget] = useState(25);
  const [foodpandaGrowth, setFoodpandaGrowth] = useState(10);
  const debouncedAttach = useDebounced(attachTarget, 300);
  const debouncedGrowth = useDebounced(foodpandaGrowth, 300);

  const { data, loading, error, reload } = useFetch(
    () => getPrescriptive({ attachTargetPct: debouncedAttach, foodpandaGrowthPct: debouncedGrowth }),
    [debouncedAttach, debouncedGrowth],
  );

  const reset = () => {
    setAttachTarget(25);
    setFoodpandaGrowth(10);
  };

  if (loading && !data) return <PageLoader />;
  if (error) return <ErrorNotice message={error} onRetry={reload} />;
  if (!data) return <PageLoader />;

  const s = data.scenario;
  const profitTone = s.estimatedProfit >= 0 ? 'sage' : 'berry';

  return (
    <div className="page">
      <PageIntro
        eyebrow="Prescriptive analytics · what should we do?"
        title="Turn the menu data into daily decisions"
        lead="These recommendations come from the descriptive results and the forecast baseline. Move the sliders to test two realistic levers: more add-on prompts at the counter and growth in Foodpanda orders."
        actions={
          <>
            {loading && <Badge tone="gold">Updating…</Badge>}
            <button className="btn btn--ghost" onClick={reset}>
              <Icon name="refresh" size={16} /> Reset scenario
            </button>
          </>
        }
      />

      <Panel title="Scenario controls" subtitle="Changes recalculate automatically" action={<Badge tone="sage">Live</Badge>}>
        <div className="controls">
          <label className="control">
            <div className="control__top">
              <span>Add-on attach target</span>
              <strong>{percent(attachTarget, 0)}</strong>
            </div>
            <input type="range" min="0" max="60" step="1" value={attachTarget} onChange={(e) => setAttachTarget(Number(e.target.value))} />
            <div className="control__scale">
              <span>0%</span>
              <span>Current {percent(data.addon.currentAttachPct)}</span>
              <span>60%</span>
            </div>
          </label>

          <label className="control">
            <div className="control__top">
              <span>Foodpanda sales growth</span>
              <strong>{signedPercent(foodpandaGrowth, 0)}</strong>
            </div>
            <input type="range" min="-20" max="40" step="1" value={foodpandaGrowth} onChange={(e) => setFoodpandaGrowth(Number(e.target.value))} />
            <div className="control__scale">
              <span>−20%</span>
              <span>Current {compactPeso(data.channel.currentFoodpandaRevenue)}</span>
              <span>+40%</span>
            </div>
          </label>
        </div>
      </Panel>

      <div className="kpi-grid">
        <KpiCard label="Projected monthly sales" value={compactPeso(s.projectedMonthlyRevenue)} hint={`Baseline ${compactPeso(s.projectedMonthlyRevenue - data.addon.estimatedMonthlyUplift - data.channel.estimatedMonthlyChange)}`} icon="wallet" tone="caramel" />
        <KpiCard label="Estimated monthly profit" value={compactPeso(s.estimatedProfit)} hint={`${percent(s.margin)} net margin`} icon="target" tone={profitTone} />
        <KpiCard label="Add-on uplift" value={compactPeso(data.addon.estimatedMonthlyUplift)} hint={`Attach ${percent(data.addon.currentAttachPct)} → ${percent(data.addon.targetAttachPct, 0)}`} icon="spark" tone="sage" />
        <KpiCard label="Foodpanda change" value={compactPeso(data.channel.estimatedMonthlyChange)} hint={`${signedPercent(data.channel.growthPct, 0)} vs current delivery sales`} icon="cart" tone="plum" />
      </div>

      <div className="grid grid--main">
        <Panel title="Recommended actions" subtitle="Generated from the current data and scenario">
          <div className="rec-list">
            {data.recommendations.map((rec) => (
              <article className="rec" key={rec.title}>
                <Badge tone="caramel">{rec.tag}</Badge>
                <div>
                  <h4>{rec.title}</h4>
                  <p>{rec.detail}</p>
                  <span className="rec__impact"><Icon name="trend" size={14} /> {rec.impact}</span>
                </div>
              </article>
            ))}
          </div>
        </Panel>

        <div className="stack">
          <Panel title="Scenario P&L" subtitle="Simple monthly estimate">
            <div className="pl">
              <StatRow label="Projected sales" value={peso(s.projectedMonthlyRevenue)} />
              <StatRow label="Cost of goods sold" value={`−${peso(s.cogs)}`} />
              <StatRow label="Fixed operating cost" value={`−${peso(s.fixedCost)}`} />
              <StatRow label="Estimated profit" value={peso(s.estimatedProfit)} tone={profitTone} />
            </div>
            <div className="pl-split">
              <span>Net margin <strong className={profitTone === 'sage' ? 'delta--up' : 'delta--down'}>{percent(s.margin)}</strong></span>
            </div>
          </Panel>

          <Panel title="Action economics" subtitle="What each lever contributes">
            <div className="pl">
              <StatRow label="Add-on attach now" value={percent(data.addon.currentAttachPct)} />
              <StatRow label="Attach target" value={percent(data.addon.targetAttachPct, 0)} />
              <StatRow label="Delivery sales now" value={peso(data.channel.currentFoodpandaRevenue)} />
              <StatRow label="Delivery growth" value={signedPercent(data.channel.growthPct, 0)} />
            </div>
          </Panel>
        </div>
      </div>

      <Panel title="Staffing by daypart" subtitle="Orders per hour and a practical minimum crew">
        <DataTable
          columns={[
            { key: 'daypart', label: 'Daypart' },
            { key: 'ordersPerDay', label: 'Orders / day', align: 'right', render: (v) => number(v, 1) },
            { key: 'revenuePerDay', label: 'Sales / day', align: 'right', render: (v) => peso(v) },
            { key: 'staff', label: 'Suggested staff', align: 'right', render: (v) => <Badge tone={v >= 3 ? 'berry' : v >= 2 ? 'gold' : 'sage'}>{v}</Badge> },
          ]}
          rows={data.staffing}
        />
      </Panel>

      <Callout tone="sage" icon="compass" title="Prescriptive, not guesswork">
        The add-on uplift uses the actual leading add-on and current attach rate. The Foodpanda change uses measured delivery revenue. The staffing rule follows real orders per hour by daypart. Every figure updates when the sliders move.
      </Callout>

      <Panel title="Assumptions" subtitle="Read these before presenting the results">
        <ul className="assumption-list">
          {data.assumptions.map((a) => <li key={a}>{a}</li>)}
        </ul>
      </Panel>
    </div>
  );
}
