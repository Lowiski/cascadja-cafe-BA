import { Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Analytics from './pages/Analytics.jsx';
import Forecasting from './pages/Forecasting.jsx';
import Recommendations from './pages/Recommendations.jsx';
import Customers from './pages/Customers.jsx';
import Products from './pages/Products.jsx';
import Orders from './pages/Orders.jsx';
import Transactions from './pages/Transactions.jsx';
import Marketing from './pages/Marketing.jsx';
import NotFound from './pages/NotFound.jsx';

// Legacy page modules are kept in the project and still reachable.
import Descriptive from './pages/Descriptive.jsx';
import Predictive from './pages/Predictive.jsx';
import Prescriptive from './pages/Prescriptive.jsx';
import DataExplorer from './pages/DataExplorer.jsx';
import CaseStudy from './pages/CaseStudy.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />

        <Route path="analytics" element={<Analytics />} />
        <Route path="descriptive" element={<Descriptive />} />
        <Route path="forecasting" element={<Forecasting />} />
        <Route path="predictive" element={<Predictive />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="prescriptive" element={<Prescriptive />} />

        <Route path="customers" element={<Customers />} />
        <Route path="products" element={<Products />} />
        <Route path="orders" element={<Orders />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="marketing" element={<Marketing />} />

        <Route path="data" element={<DataExplorer />} />
        <Route path="case-study" element={<CaseStudy />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
