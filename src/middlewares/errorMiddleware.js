import { isProduction } from '../config/env.js';

export const errorMiddleware = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    ok: false,
    error: error.message || 'Internal server error',
    details: error.details,
    stack: isProduction ? undefined : error.stack,
  });
};
