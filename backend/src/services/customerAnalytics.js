import { computeDescriptive } from '../analytics.js';

// Segment, city, payment and weekday views of the customer base.
export function computeCustomerAnalytics(data, descriptive) {
  const d = descriptive || computeDescriptive(data);
  return {
    customers: d.kpis.customers,
    activeCustomers: d.kpis.activeCustomers,
    repeatCustomers: d.kpis.repeatCustomers,
    repeatRate: d.kpis.repeatRate,
    bySegment: d.bySegment,
    byCity: d.byCity,
    byPayment: d.byPayment,
    byDayOfWeek: d.byDayOfWeek,
  };
}

export default computeCustomerAnalytics;
