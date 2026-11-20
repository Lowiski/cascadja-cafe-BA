import DataExplorer from './DataExplorer.jsx';

// Marketing campaigns with the ROI formatting fix preserved by the shared explorer.
export default function Marketing() {
  return (
    <DataExplorer
      initialTable="marketing"
      showTabs={false}
      eyebrow="Data variable 3 of 5"
      title="Marketing campaigns"
      lead="Campaigns across seven channels with spend, reach, conversions and attributed revenue — the source of the ROI calculations."
    />
  );
}
