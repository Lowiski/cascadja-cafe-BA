import Icon from './Icon.jsx';

// Top bar extracted from the original Layout component.
export default function Navbar({ title, meta, onMenu, onRefresh }) {
  return (
    <header className="topbar">
      <button className="icon-btn menu-btn" onClick={onMenu} aria-label="Open menu">
        <Icon name="menu" />
      </button>
      <div className="topbar__title">
        <span className="topbar__eyebrow">Cascadja Foods and Drinks · BA capstone</span>
        <h1>{title}</h1>
      </div>
      <div className="topbar__right">
        <span className={`mode mode--${meta?.mode || 'demo'}`}>
          <span className="dot" />
          {meta?.mode === 'neon' ? 'Neon Postgres' : 'Sample data'}
        </span>
        <span className="period">Kasadya Park &amp; Play, Cordova</span>
        <button className="icon-btn" title="Refresh data" onClick={onRefresh}>
          <Icon name="refresh" />
        </button>
      </div>
    </header>
  );
}
