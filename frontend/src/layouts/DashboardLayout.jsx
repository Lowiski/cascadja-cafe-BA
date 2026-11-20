import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar.jsx';
import Navbar from '../components/common/Navbar.jsx';
import { meta } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';

export const NAV = [
  {
    group: 'Analytics',
    items: [
      { to: '/', label: 'Overview', icon: 'dashboard', end: true },
      { to: '/analytics', label: 'Analytics', icon: 'chart' },
      { to: '/forecasting', label: 'Forecasting', icon: 'trend' },
      { to: '/recommendations', label: 'Recommendations', icon: 'compass' },
    ],
  },
  {
    group: 'Data',
    items: [
      { to: '/products', label: 'Menu', icon: 'coffee' },
      { to: '/orders', label: 'Sales records', icon: 'cart' },
      { to: '/data', label: 'Data explorer', icon: 'database' },
    ],
  },
  {
    group: 'Story',
    items: [{ to: '/case-study', label: 'Case study', icon: 'book' }],
  },
];

export const TITLES = {
  '/': 'Business overview',
  '/analytics': 'Descriptive analytics',
  '/forecasting': 'Predictive analytics',
  '/recommendations': 'Prescriptive analytics',
  '/products': 'Cascadja menu',
  '/orders': 'Sales records',
  '/data': 'Data explorer',
  '/case-study': 'Capstone case study',
};

export default function DashboardLayout() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { data: metaData } = useFetch(meta, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  return (
    <div className="shell">
      <Sidebar nav={NAV} open={open} onClose={() => setOpen(false)} />
      {open && <button className="scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}

      <div className="main">
        <Navbar
          title={TITLES[location.pathname] || 'Business overview'}
          meta={metaData}
          onMenu={() => setOpen((v) => !v)}
          onRefresh={() => window.location.reload()}
        />

        <main className="content">
          <Outlet />
        </main>

        <footer className="footer">
          <span>Cascadja Foods and Drinks · Business Analytics Capstone</span>
          <span>React · Express · Neon Postgres · Chart.js</span>
        </footer>
      </div>
    </div>
  );
}
