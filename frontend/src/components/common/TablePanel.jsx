import { useEffect, useState } from 'react';
import { useFetch, useDebounced } from '../../hooks/useFetch.js';
import { number } from '../../format.js';
import Icon from './Icon.jsx';
import { DataTable, ErrorNotice, Panel } from './UI.jsx';

// Reusable paginated/searchable/sortable table panel for the active datasets.
// `resultKey` prevents stale rows from a previous tab from flashing on screen.
export default function TablePanel({
  title,
  subtitle,
  action,
  fetcher,
  columns,
  resultKey,
  searchPlaceholder = 'Search records…',
  initialSort = 'id',
  initialDir = 'desc',
  pageSize = 10,
  deps = [],
}) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState(initialSort);
  const [dir, setDir] = useState(initialDir);
  const debouncedSearch = useDebounced(search, 300);

  const { data, loading, error, reload } = useFetch(
    () => fetcher({ page, pageSize, search: debouncedSearch, sort, dir }),
    [page, debouncedSearch, sort, dir, ...deps],
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sort, dir]);

  const toggleSort = (key) => {
    if (sort === key) setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else {
      setSort(key);
      setDir('asc');
    }
  };

  const stale = resultKey && data && data.table !== resultKey;
  const ready = !loading && !error && data && !stale;

  return (
    <Panel
      title={title}
      subtitle={subtitle}
      action={
        <span className="table-tools">
          <span className="search-box">
            <Icon name="target" size={15} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
          </span>
          {action}
        </span>
      }
      flush
    >
      {loading && <div className="table-loading">Loading rows…</div>}
      {error && <ErrorNotice message={error} onRetry={reload} />}
      {ready && (
        <>
          <DataTable
            columns={columns.map((col) => ({
              ...col,
              label: (
                <button className="th-sort" onClick={() => toggleSort(col.key)}>
                  {col.label}
                  {sort === col.key && <span className="th-sort__dir">{dir === 'asc' ? '▲' : '▼'}</span>}
                </button>
              ),
            }))}
            rows={data.rows || []}
            empty="No records match this search."
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
              <span>Page {data.page} / {data.pages}</span>
              <button className="btn btn--tiny" disabled={data.page >= data.pages} onClick={() => setPage((p) => p + 1)}>
                Next →
              </button>
            </div>
          </div>
        </>
      )}
    </Panel>
  );
}
