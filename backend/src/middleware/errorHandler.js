// Async route wrapper + single JSON error handler.
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function errorHandler(err, _req, res, _next) {
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status < 600
    ? err.status
    : 500;
  if (status >= 500) console.error('[api error]', err.message);
  res.status(status).json({ error: err.message || 'Unexpected server error' });
}

export default errorHandler;
