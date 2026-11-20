import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar.jsx';
import Navbar from '../components/common/Navbar.jsx';
import { api } from '../api.js';
import { useApi } from '../hooks.js';

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
      { to: '/customers', label: 'Customers', icon: 'users' },
      { to: '/products', label: 'Products', icon: 'coffee' },
      { to: '/orders', label: 'Orders', icon: 'cart' },
      { to: '/transactions', label: 'Transactions', icon: 'wallet' },
      { to: '/marketing', label: 'Marketing', icon: 'target' },
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

export const TITLES = {
  '/': 'Business overview',
  '/dashboard': 'Business overview',
  '/analytics': 'Descriptive analytics',
  '/descriptive': 'Descriptive analytics',
  '/forecasting': 'Predictive analytics',
  '/predictive': 'Predictive analytics',
  '/recommendations': 'Prescriptive analytics',
  '/prescriptive': 'Prescriptive analytics',
  '/customers': 'Customers',
  '/products': 'Products',
  '/orders': 'Orders',
  '/transactions': 'Transactions',
  '/marketing': 'Marketing campaigns',
  '/data': 'Data explorer',
  '/case-study': 'Capstone case study',
};

export default function DashboardLayout() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const { data: meta } = useApi(api.meta, []);

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
          meta={meta}
          onMenu={() => setOpen((v) => !v)}
          onRefresh={() => window.location.reload()}
        />

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
