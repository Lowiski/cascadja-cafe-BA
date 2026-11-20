import { useState } from 'react';
import TablePanel from '../components/common/TablePanel.jsx';
import { listMenu } from '../services/productService.js';
import { listSalesData } from '../services/orderService.js';
import { meta as getMeta } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { number } from '../format.js';
import Icon from '../components/Icon.jsx';
import { Badge, Callout, PageIntro } from '../components/UI.jsx';
import { MENU_COLUMNS } from './Products.jsx';
import { SALES_COLUMNS } from './Orders.jsx';

const TABLES = {
  sales: {
    label: 'Sales records',
    icon: 'cart',
    description: 'Generated sample transactions built from the real menu, prices, quantities, add-ons and channels.',
    countKey: 'sales',
    fetcher: listSalesData,
    columns: SALES_COLUMNS,
    searchPlaceholder: 'Search sales records…',
  },
  menu: {
    label: 'Menu items',
    icon: 'coffee',
    description: 'The transcribed real menu: exact item names, categories, hot/iced prices and bestseller flags.',
    countKey: 'menu',
    fetcher: listMenu,
    columns: MENU_COLUMNS,
    searchPlaceholder: 'Search menu items…',
  },
};

export default function DataExplorer({ initialTable = 'sales', showTabs = true }) {
  const [active, setActive] = useState(TABLES[initialTable] ? initialTable : 'sales');
  const { data: meta } = useFetch(getMeta, []);
  const table = TABLES[active];
  const count = meta?.counts?.[table.countKey];

  return (
    <div className="page">
      <PageIntro
        eyebrow="Database integration · five variables + channel"
        title="Explore the rows behind every number"
        lead="Search, sort and page through the exact data the analytics consume. Nothing on the other pages is hard-coded — it is all aggregated from these rows."
        actions={
          <Badge tone={meta?.mode === 'neon' ? 'sage' : 'gold'}>
            {meta?.mode === 'neon' ? 'Neon Postgres' : 'Generated sample data'}
          </Badge>
        }
      />

      {showTabs && (
        <div className="tabs">
          {Object.entries(TABLES).map(([key, item]) => (
            <button
              key={key}
              className={`tab ${key === active ? 'is-active' : ''}`}
              onClick={() => setActive(key)}
            >
              <Icon name={item.icon} size={16} />
              <span>{item.label}</span>
              <span className="tab__count">{number(meta?.counts?.[item.countKey] ?? 0)}</span>
            </button>
          ))}
        </div>
      )}

      <TablePanel
        key={active}
        title={`${table.label} table`}
        subtitle={table.description}
        fetcher={table.fetcher}
        resultKey={active}
        columns={table.columns}
        searchPlaceholder={table.searchPlaceholder}
        pageSize={12}
      />

      <Callout tone="caramel" icon="database" title="Source discipline">
        {meta?.mode === 'neon'
          ? 'These rows come from the Neon sales_fact table.'
          : 'These rows are deterministic SAMPLE data generated from the real Cascadja menu. The moment a POS or Foodpanda export exists, load it into sales_fact and the whole dashboard updates.'}
        {count ? ` Current dataset: ${number(count)} ${table.label.toLowerCase()} rows.` : null}
      </Callout>
    </div>
  );
}
