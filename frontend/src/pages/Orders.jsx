import { useState } from 'react';
import TablePanel from '../components/common/TablePanel.jsx';
import SaleForm from '../components/forms/SaleForm.jsx';
import { listSalesData } from '../services/orderService.js';
import { meta as getMeta } from '../services/api.js';
import { useFetch } from '../hooks/useFetch.js';
import { number, peso } from '../format.js';
import Icon from '../components/Icon.jsx';
import { Badge, Callout, PageIntro } from '../components/UI.jsx';

export const SALES_COLUMNS = [
  { key: 'id', label: 'Line', width: 70 },
  { key: 'order_id', label: 'Order', width: 80 },
  { key: 'order_date', label: 'Date' },
  { key: 'daypart', label: 'Daypart', render: (v) => <Badge tone="neutral">{v}</Badge> },
  { key: 'channel', label: 'Channel', render: (v) => <Badge tone={v === 'Foodpanda' ? 'berry' : 'sage'}>{v}</Badge> },
  { key: 'product_category', label: 'Category' },
  { key: 'item_name', label: 'Item' },
  { key: 'bestseller', label: '★', align: 'right', render: (v) => (v === 'Yes' ? '★' : '—') },
  { key: 'item_price', label: 'Price', align: 'right', render: (v) => peso(v) },
  { key: 'quantity_sold', label: 'Qty', align: 'right', render: (v) => number(v) },
  { key: 'addon_name', label: 'Add-on' },
  { key: 'total_sales', label: 'Line total', align: 'right', render: (v) => peso(v) },
];

export default function Orders() {
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
        eyebrow="Data · sales fact table"
        title="Every sold line, traceable"
        lead="One row is one menu item sold on an order. New sales you record here are saved in the Neon database and immediately feed every chart."
        actions={
          <>
            <Badge tone="sage">{number(meta?.counts?.sales || 0)} rows</Badge>
            <button className="btn btn--primary" onClick={() => setFormOpen(true)}>
              <Icon name="plus" size={16} /> Add sale
            </button>
          </>
        }
      />

      <Callout tone="sage" icon="database" title="The six columns the analytics actually use">
        <div className="var-chips">
          <span className="var-chip"><strong>order_date</strong> + daypart</span>
          <span className="var-chip"><strong>product_category</strong></span>
          <span className="var-chip"><strong>item_price</strong></span>
          <span className="var-chip"><strong>quantity_sold</strong></span>
          <span className="var-chip"><strong>total_sales</strong></span>
          <span className="var-chip"><strong>channel</strong> · added because it is real</span>
        </div>
      </Callout>

      <TablePanel
        title="Sales records"
        subtitle="Search by item, category, channel or date; click any heading to sort"
        fetcher={listSalesData}
        resultKey="sales"
        columns={SALES_COLUMNS}
        searchPlaceholder="Search sales records…"
        pageSize={12}
        deps={[refreshKey]}
      />

      <SaleForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onCreated={saved}
      />
    </div>
  );
}
