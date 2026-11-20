import Icon from './Icon.jsx';

// Renamed from KpiCard; same markup and class names as before.
export default function StatCard({ label, value, hint, icon = 'spark', tone = 'caramel' }) {
  return (
    <div className={`kpi kpi--${tone}`}>
      <div className="kpi__top">
        <span className="kpi__label">{label}</span>
        <span className="kpi__icon">
          <Icon name={icon} size={17} />
        </span>
      </div>
      <div className="kpi__value">{value}</div>
      {hint && <div className="kpi__hint">{hint}</div>}
    </div>
  );
}

export function KpiCard(props) {
  return <StatCard {...props} />;
}
