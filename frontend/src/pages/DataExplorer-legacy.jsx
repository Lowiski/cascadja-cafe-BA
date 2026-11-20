import { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useApi, useDebounced } from '../hooks.js';
import { number, percent, peso } from '../format.js';
import Icon from '../components/Icon.jsx';
import { Badge, Callout, DataTable, ErrorNotice, PageIntro, PageLoader, Panel } from '../components/UI.jsx';
import CustomerForm from '../components/forms/CustomerForm.jsx';

const TABLES = [
  {
    key: 'customers',
    label: 'Customers',
    icon: 'users',
    description: 'Loyalty-member profiles: segment, city, join date and points. Walk-in guests are recorded on transactions without a profile.',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'email', label: 'Email' },
      { key: 'city', label: 'City' },
      { key: 'segment', label: 'Segment', render: (v) => <Badge tone="plum">{v}</Badge> },
      { key: 'joined_at', label: 'Joined' },
      { key: 'loyalty_points', label: 'Points', align: 'right', render: (v) => number(v) },
    ],
  },
  {
    key: 'sales',
    label: 'Sales',
    icon: 'cart',
    description: 'Every product sold on a transaction — the line-item table behind product and category revenue.',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'sale_date', label: 'Date' },
      { key: 'transaction_id', label: 'Txn', align: 'right' },
      { key: 'product', label: 'Product' },
      { key: 'category', label: 'Category', render: (v) => <Badge tone="neutral">{v}</Badge> },
      { key: 'channel', label: 'Channel' },
      { key: 'quantity', label: 'Qty', align: 'right' },
      { key: 'unit_price', label: 'Unit price', align: 'right', render: (v) => peso(v) },
      { key: 'line_total', label: 'Line total', align: 'right', render: (v) => peso(v) },
    ],
  },
  {
    key: 'transactions',
    label: 'Transactions',
    icon: 'wallet',
    description: 'Order and booking headers: one row per visit or stay, linked to a customer when the guest is a loyalty member.',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'txn_date', label: 'Date' },
      { key: 'customer', label: 'Customer' },
      { key: 'channel', label: 'Channel', render: (v) => <Badge tone={v === 'Room Stay' ? 'gold' : 'neutral'}>{v}</Badge> },
      { key: 'payment_method', label: 'Payment' },
      { key: 'status', label: 'Status', render: (v) => <Badge tone={v === 'Completed' ? 'sage' : 'berry'}>{v}</Badge> },
      { key: 'total_amount', label: 'Total', align: 'right', render: (v) => peso(v) },
    ],
  },
  {
    key: 'products',
    label: 'Products',
    icon: 'coffee',
    description: 'The cafe menu and the four room types, each with selling price, unit cost and type.',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'name', label: 'Name' },
      { key: 'category', label: 'Category', render: (v) => <Badge tone="caramel">{v}</Badge> },
      { key: 'type', label: 'Type', render: (v) => <Badge tone={v === 'Room' ? 'plum' : 'neutral'}>{v}</Badge> },
      { key: 'unit_price', label: 'Price', align: 'right', render: (v) => peso(v) },
      { key: 'unit_cost', label: 'Unit cost', align: 'right', render: (v) => peso(v) },
      { key: 'margin', label: 'Margin', align: 'right', render: (_, row) => percent(((row.unit_price - row.unit_cost) / row.unit_price) * 100) },
    ],
  },
  {
    key: 'marketing',
    label: 'Marketing',
    icon: 'target',
    description: 'Campaigns across seven channels with spend, reach, conversions and attributed revenue — the source of the ROI calculations.',
    columns: [
      { key: 'id', label: 'ID' },
      { key: 'campaign_name', label: 'Campaign' },
      { key: 'channel', label: 'Channel', render: (v) => <Badge tone="sage">{v}</Badge> },
      { key: 'start_date', label: 'Start' },
      { key: 'spend', label: 'Spend', align: 'right', render: (v) => peso(v) },
      { key: 'conversions', label: 'Conv.', align: 'right', render: (v) => number(v) },
      { key: 'roi', label: 'ROI', align: 'right', render: (v) => <Badge tone={v >= 4 ? 'sage' : v >= 2 ? 'gold' : 'berry'}>{v == null ? '—' : `${Number(v).toFixed(2)}x`}</Badge> },
    ],
  },
];

const SEGMENTS = ['Student', 'Young Professional', 'Family', 'Tourist', 'Corporate'];

export default function DataExplorer({
  initialTable = 'customers',
  showTabs = true,
  eyebrow = 'Database integration',
  title = 'Explore the five data variables',
  lead = 'These are the actual tables the analytics run on. Search, sort and page through each variable. Customers added here are written straight to Neon when the database is connected.',
}) {
  const [tableKey, setTableKey] = useState(initialTable);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('id');
  const [dir, setDir] = useState('desc');
  const [modalOpen, setModalOpen] = useState(false);
  const [toast, setToast] = useState('');
  const debouncedSearch = useDebounced(search, 300);
  const table = TABLES.find((t) => t.key === tableKey);

  const meta = useApi(api.meta, []);
  const { data, loading, error, reload } = useApi(
    () => api.table(tableKey, { page, pageSize: 10, search: debouncedSearch, sort, dir }),
    [tableKey, page, debouncedSearch, sort, dir],
  );

  useEffect(() => {
    setPage(1);
  }, [tableKey, debouncedSearch]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  const changeTable = (key) => {
    setTableKey(key);
    setSearch('');
    setPage(1);
    setSort('id');
    setDir('desc');
  };

  const toggleSort = (key) => {
    if (sort === key) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSort(key);
      setDir('asc');
    }
    setPage(1);
  };

  const countFor = (key) => meta.data?.counts?.[key === 'marketing' ? 'marketing' : key] ?? '—';

  return (
    <div className="page">
      <PageIntro
        eyebrow={eyebrow}
        title={title}
        lead={lead}
        actions={
          tableKey === 'customers' ? (
            <button className="btn btn--primary" onClick={() => setModalOpen(true)}>
              <Icon name="plus" size={16} /> Add customer
            </button>
          ) : null
        }
      />

      {showTabs && (
        <div className="tabs">
          {TABLES.map((t) => (
            <button key={t.key} className={`tab ${t.key === tableKey ? 'is-active' : ''}`} onClick={() => changeTable(t.key)}>
              <Icon name={t.icon} size={16} />
              <span>{t.label}</span>
              <span className="tab__count">{countFor(t.key)}</span>
            </button>
          ))}
        </div>
      )}

      <Panel
        title={`${table.label} table`}
        subtitle={table.description}
        action={
          <span className="table-tools">
            <span className="search-box">
              <Icon name="target" size={15} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${table.label.toLowerCase()}…`}
              />
            </span>
          </span>
        }
        flush
      >
        {loading && <div className="table-loading">Loading rows…</div>}
        {error && <ErrorNotice message={error} onRetry={reload} />}
        {!loading && !error && data?.table === tableKey && (
          <>
            <DataTable
              columns={table.columns.map((c) => ({
                ...c,
                render: c.render,
                label: (
                  <button className="th-sort" onClick={() => toggleSort(c.key)}>
                    {c.label}
                    {sort === c.key && <span className="th-sort__dir">{dir === 'asc' ? '▲' : '▼'}</span>}
                  </button>
                ),
              }))}
              rows={data.rows}
            />
            <div className="table-foot">
              <span>
                Showing {number(data.total === 0 ? 0 : (data.page - 1) * data.pageSize + 1)}–
                {number(Math.min(data.page * data.pageSize, data.total))} of {number(data.total)} rows
              </span>
              <div className="pager">
                <button className="btn btn--tiny" disabled={data.page <= 1} onClick={() => setPage((p) => p - 1)}>
                  ← Prev
                </button>
                <span>
                  Page {data.page} / {data.pages}
                </span>
                <button className="btn btn--tiny" disabled={data.page >= data.pages} onClick={() => setPage((p) => p + 1)}>
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </Panel>

      <Callout tone="caramel" icon="database" title="Where the 50-record requirement is met">
        Customers {countFor('customers')} · Sales {countFor('sales')} · Transactions {countFor('transactions')} · Products{' '}
        {countFor('products')} · Marketing campaigns {countFor('marketing')} — every variable is well above the 50-record
        minimum.
      </Callout>

      {toast && <div className="toast">{toast}</div>}
      {modalOpen && (
        <AddCustomerModal
          onClose={() => setModalOpen(false)}
          onSaved={() => {
            setModalOpen(false);
            setToast('Customer saved. The table and analytics now include the new row.');
            reload();
            meta.reload();
          }}
        />
      )}
    </div>
  );
}

function AddCustomerModal({ onClose, onSaved }) {
  // Thin compatibility wrapper around components/forms/CustomerForm.jsx.
  return <CustomerForm onClose={onClose} onSaved={onSaved} />;
}
