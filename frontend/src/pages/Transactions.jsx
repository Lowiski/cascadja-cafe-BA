import DataExplorer from './DataExplorer.jsx';

// Order headers: one row per visit or stay.
export default function Transactions() {
  return (
    <DataExplorer
      initialTable="transactions"
      showTabs={false}
      eyebrow="Data variable 4 of 5"
      title="Transactions"
      lead="Order and booking headers, linked to a loyalty customer when the guest has a profile."
    />
  );
}
