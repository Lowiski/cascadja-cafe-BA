// Legacy UI module kept working as a compatibility barrel and home for the
// remaining shared primitives. New code should import from the named files in
// components/common/ instead.
import Icon from './Icon.jsx';

export { default as PageIntro, default as PageHeader } from './PageHeader.jsx';
export { default as KpiCard, default as StatCard } from './StatCard.jsx';
export { default as PageLoader, default as Loading } from './Loading.jsx';
export { default as ConfirmModal } from './ConfirmModal.jsx';

export function Panel({ title, subtitle, action, children, className = '', flush = false }) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <header className="panel__head">
          <div>
            {title && <h3>{title}</h3>}
            {subtitle && <p>{subtitle}</p>}
          </div>
          {action && <div className="panel__action">{action}</div>}
        </header>
      )}
      <div className={flush ? 'panel__body panel__body--flush' : 'panel__body'}>{children}</div>
    </section>
  );
}

export function Badge({ children, tone = 'neutral' }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

export function Callout({ tone = 'caramel', icon = 'spark', title, children }) {
  return (
    <div className={`callout callout--${tone}`}>
      <span className="callout__icon">
        <Icon name={icon} size={18} />
      </span>
      <div>
        {title && <strong>{title}</strong>}
        <div className="callout__body">{children}</div>
      </div>
    </div>
  );
}

export function ErrorNotice({ message, onRetry }) {
  return (
    <div className="page">
      <div className="error-card">
        <span className="error-card__icon">
          <Icon name="alert" size={24} />
        </span>
        <h3>Could not load the analytics</h3>
        <p>{message}</p>
        <p className="muted">
          Make sure the API is running on port 4000 (<code>npm run dev</code> at the project root).
        </p>
        {onRetry && (
          <button className="btn btn--primary" onClick={onRetry}>
            <Icon name="refresh" size={16} /> Try again
          </button>
        )}
      </div>
    </div>
  );
}

export function DataTable({ columns, rows, empty = 'No records found.', compact = false }) {
  if (!rows?.length) return <p className="empty">{empty}</p>;
  return (
    <div className={`table-wrap ${compact ? 'table-wrap--compact' : ''}`}>
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ textAlign: col.align || 'left', width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={row.id ?? row.key ?? i}>
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatRow({ label, value, tone = '' }) {
  return (
    <div className={`stat-row ${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
