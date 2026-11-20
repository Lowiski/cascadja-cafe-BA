import { useEffect, useState } from 'react';

// Small data-fetching hook with loading / error / retry.
// Named export `useFetch` is the new home of the old `useApi` hook.
export function useFetch(fn, deps = []) {
  const [nonce, setNonce] = useState(0);
  const [state, setState] = useState({ data: null, loading: true, error: null });

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => {
        if (alive) setState({ data, loading: false, error: null });
      })
      .catch((err) => {
        if (alive) setState({ data: null, loading: false, error: err.message || 'Something went wrong' });
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nonce, ...deps]);

  return { ...state, reload: () => setNonce((n) => n + 1) };
}

export function useDebounced(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export default useFetch;
