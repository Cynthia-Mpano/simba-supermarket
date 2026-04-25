export function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${req.method} ${req.path}:`, err.message);
  const status = err.status || 500;
  res.status(status).json({
    error: status === 500 ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export function requestLogger(req, _res, next) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`→ ${req.method} ${req.path}`);
  }
  next();
}
