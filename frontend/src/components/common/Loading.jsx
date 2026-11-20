// Renamed from PageLoader; same skeleton markup as before.
export default function Loading({ rows = 3 }) {
  return (
    <div className="page">
      <div className="skeleton skeleton--lead" />
      <div className="skeleton-grid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div className="skeleton skeleton--kpi" key={i} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div className="skeleton skeleton--chart" key={i} />
      ))}
    </div>
  );
}

export function PageLoader(props) {
  return <Loading {...props} />;
}
