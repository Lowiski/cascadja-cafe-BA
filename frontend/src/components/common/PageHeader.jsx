// Renamed from PageIntro; same markup and class names as before.
export default function PageHeader({ eyebrow, title, lead, actions }) {
  return (
    <div className="page-intro">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && <h2>{title}</h2>}
        {lead && <p className="lead">{lead}</p>}
      </div>
      {actions && <div className="page-intro__actions">{actions}</div>}
    </div>
  );
}

export function PageIntro(props) {
  return <PageHeader {...props} />;
}
