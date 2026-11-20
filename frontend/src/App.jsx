import { Routes, Route } from 'react-router-dom';
import RequireAuth from './components/RequireAuth.jsx';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Analytics from './pages/Analytics.jsx';
import Forecasting from './pages/Forecasting.jsx';
import Recommendations from './pages/Recommendations.jsx';
import Products from './pages/Products.jsx';
import Orders from './pages/Orders.jsx';
import DataExplorer from './pages/DataExplorer.jsx';
import CaseStudy from './pages/CaseStudy.jsx';
import Login from './pages/Login.jsx';
import NotFound from './pages/NotFound.jsx';

// Active app: real Cascadja Foods and Drinks menu + database-backed sales.
// The former inn/customer/marketing pages remain in the repo as *-legacy.js files.
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <DashboardLayout />
          </RequireAuth>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="forecasting" element={<Forecasting />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="data" element={<DataExplorer />} />
        <Route path="case-study" element={<CaseStudy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
