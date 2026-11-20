import DataExplorer from './DataExplorer.jsx';

// Order detail view: the sales line-item table.
export default function Orders() {
  return (
    <DataExplorer
      initialTable="sales"
      showTabs={false}
      eyebrow="Data variable 5 of 5"
      title="Orders / sales lines"
      lead="Every product sold on a transaction — the line-item detail behind product and category revenue."
    />
  );
}
