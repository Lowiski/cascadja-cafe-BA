import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import Icon from './Icon.jsx';
import { api } from '../api.js';
import { useApi } from '../hooks.js';

const NAV = [
  {
    group: 'Analytics',
    items: [
      { to: '/', label: 'Overview', icon: 'dashboard', end: true },
      { to: '/descriptive', label: 'Descriptive', icon: 'chart' },
      { to: '/predictive', label: 'Predictive', icon: 'trend' },
      { to: '/prescriptive', label: 'Prescriptive', icon: 'compass' },
    ],
  },
  {
    group: 'Data & story',
    items: [
      { to: '/data', label: 'Data explorer', icon: 'database' },
      { to: '/case-study', label: 'Case study', icon: 'book' },
    ],
  },
];

const TITLES = {
  '/': 'Business overview',
  '/descriptive': 'Descriptive analytics',
  '/predictive': 'Predictive analytics',
  '/prescriptive': 'Prescriptive analytics',
  '/data': 'Data explorer',
  '/case-study': 'Capstone case study',
};

export default function Layout() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { data: meta } = useApi(api.meta, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <Link to="/" className="brand" aria-label="Cascadja Cafe home">
          <span className="brand__mark">
            <Icon name="coffee" size={22} />
          </span>
          <span className="brand__text">
            <strong>Cascadja</strong>
            <small>Cafe &amp; Inn</small>
          </span>
        </Link>

        <div className="sidebar__tagline">
          <span>Business analytics</span>
          <span className="line" />
          <span>Capstone</span>
        </div>

        <nav className="nav">
          {NAV.map((section) => (
            <div key={section.group} className="nav__group">
              <p className="nav__label">{section.group}</p>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => `nav__link ${isActive ? 'is-active' : ''}`}
                >
                  <Icon name={item.icon} size={18} />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar__foot">
          <div className="sidebar__foot-card">
            <Icon name="spark" size={18} />
            <p>
              <strong>5 variables</strong>
              <span>Customers · Sales · Transactions · Products · Marketing</span>
            </p>
          </div>
          <p className="sidebar__credit">Database systems integration · 2026</p>
        </div>
      </aside>

      {open && <button className="scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" onClick={() => setOpen((v) => !v)} aria-label="Open menu">
            <Icon name="menu" />
          </button>
          <div className="topbar__title">
            <span className="topbar__eyebrow">Cascadja Cafe · BA capstone</span>
            <h1>{TITLES[location.pathname] || 'Business overview'}</h1>
          </div>
          <div className="topbar__right">
            <span className={`mode mode--${meta?.mode || 'demo'}`}>
              <span className="dot" />
              {meta?.mode === 'neon' ? 'Neon Postgres' : 'Demo data'}
            </span>
            <span className="period">Nov 2025 – Oct 2026</span>
            <button className="icon-btn" title="Refresh data" onClick={() => window.location.reload()}>
              <Icon name="refresh" />
            </button>
          </div>
        </header>

        <main className="content">
          <Outlet />
        </main>

        <footer className="footer">
          <span>Cascadja Cafe · Business Analytics Capstone</span>
          <span>React · Express · Neon Postgres · Chart.js</span>
        </footer>
      </div>
    </div>
  );
}
