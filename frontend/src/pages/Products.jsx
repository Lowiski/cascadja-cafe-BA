import { useState } from 'react';
import TablePanel from '../components/common/TablePanel.jsx';
import MenuForm from '../components/forms/MenuForm.jsx';
import { listMenu } from '../services/productService.js';
import { meta as getMeta } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { number, peso } from '../format.js';
import Icon from '../components/Icon.jsx';
import { Badge, Callout, PageIntro } from '../components/UI.jsx';

export const MENU_COLUMNS = [
  { key: 'id', label: 'ID', width: 70 },
  { key: 'name', label: 'Menu item' },
  { key: 'category', label: 'Category', render: (v) => <Badge tone="caramel">{v}</Badge> },
  { key: 'hot_price', label: 'Hot / regular', align: 'right', render: (v) => peso(v) },
  { key: 'iced_price', label: 'Iced / large', align: 'right', render: (v) => (v === '—' ? <span className="muted">—</span> : peso(v)) },
  { key: 'bestseller', label: 'Bestseller', align: 'right', render: (v) => <Badge tone={v === 'Yes' ? 'sage' : 'neutral'}>{v === 'Yes' ? '★ Yes' : 'No'}</Badge> },
];

export default function Products() {
  const [formOpen, setFormOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const { data: meta, reload: reloadMeta } = useFetch(getMeta, []);

  const saved = () => {
    setRefreshKey((k) => k + 1);
    reloadMeta();
  };

  return (
    <div className="page">
      <PageIntro
        eyebrow="Data · product master"
        title="The real Cascadja menu"
        lead="Names, categories, prices and bestseller flags are transcribed from the owner's menu photos. New items you add here are saved in the Neon database."
        actions={
          <>
            <Badge tone="sage">{number(meta?.counts?.menu || 0)} menu items</Badge>
            <button className="btn btn--primary" onClick={() => setFormOpen(true)}>
              <Icon name="plus" size={16} /> Add menu item
            </button>
          </>
        }
      />

      <Callout tone="caramel" icon="coffee" title="Real prices, not invented averages">
        Coffee starts at ₱140, ade and milktea at ₱90, rice meals at ₱145, and the highest single item is the ₱245 Classic Burger. Add-ons are ₱10 or ₱35. This is the price master behind every sales row.
      </Callout>

      <TablePanel
        title="Menu items"
        subtitle="Search, sort and page through the active product list"
        fetcher={listMenu}
        resultKey="menu"
        columns={MENU_COLUMNS}
        searchPlaceholder="Search menu items or categories…"
        deps={[refreshKey]}
      />

      <MenuForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreated={saved}
      />
    </div>
  );
}
