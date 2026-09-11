import crypto from 'node:crypto';

import { authCookieNames, csrfCookieOptions } from '../utils/cookies.js';

export const createCsrfToken = () => crypto.randomBytes(32).toString('base64url');

export const setCsrfCookie = (res, token = createCsrfToken()) => {
  res.cookie(authCookieNames.csrf, token, {
    ...csrfCookieOptions,
    maxAge: 24 * 60 * 60 * 1000,
  });

  return token;
};
