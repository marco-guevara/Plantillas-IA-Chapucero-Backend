import { env, isProduction } from '../config/env.js';

const baseCookieOptions = {
  httpOnly: true,
  sameSite: isProduction ? 'none' : 'lax',
  secure: env.cookieSecure,
  domain: env.cookieDomain,
  path: '/',
};

export const authCookieNames = {
  access: 'laminas_access_token',
  refresh: 'laminas_refresh_token',
};

export const setAuthCookies = (res, { accessToken, refreshToken }) => {
  res.cookie(authCookieNames.access, accessToken, {
    ...baseCookieOptions,
    maxAge: 15 * 60 * 1000,
  });
  res.cookie(authCookieNames.refresh, refreshToken, {
    ...baseCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookies = (res) => {
  res.clearCookie(authCookieNames.access, baseCookieOptions);
  res.clearCookie(authCookieNames.refresh, baseCookieOptions);
};
