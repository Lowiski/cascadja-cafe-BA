import DataExplorer from './DataExplorer.jsx';

// Dedicated view of the customers variable (same explorer, focused table).
export default function Customers() {
  return (
    <DataExplorer
      initialTable="customers"
      showTabs={false}
      eyebrow="Data variable 1 of 5"
      title="Customers"
      lead="Loyalty-member profiles: segment, city, join date and points. Add a customer here to write a real row to the database."
    />
  );
}
