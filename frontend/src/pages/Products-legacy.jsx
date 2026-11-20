import DataExplorer from './DataExplorer.jsx';

// Dedicated view of the products variable.
export default function Products() {
  return (
    <DataExplorer
      initialTable="products"
      showTabs={false}
      eyebrow="Data variable 2 of 5"
      title="Products"
      lead="The cafe menu and the four room types, each with selling price, unit cost and margin."
    />
  );
}
