import { env } from '../config/env.js';
import { authCookieNames } from '../utils/cookies.js';
import { ApiError } from '../utils/apiError.js';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

export const csrfMiddleware = (req, _res, next) => {
  if (!env.csrfRequired || safeMethods.has(req.method)) {
    next();
    return;
  }

  const cookieToken = req.cookies?.[authCookieNames.csrf];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    next(new ApiError(403, 'CSRF token required'));
    return;
  }

  next();
};
