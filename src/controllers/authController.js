import {
  loginClient,
  logoutClient,
  refreshClientSession,
} from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  authCookieNames,
  clearAuthCookies,
  setAuthCookies,
} from '../utils/cookies.js';

export const login = asyncHandler(async (req, res) => {
  const result = await loginClient({
    email: req.body.email,
    password: req.body.password,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });

  setAuthCookies(res, result);

  res.json({
    ok: true,
    client: result.client,
    accessToken: result.accessToken,
  });
});

export const logout = asyncHandler(async (req, res) => {
  await logoutClient(req.cookies?.[authCookieNames.refresh]);
  clearAuthCookies(res);
  res.json({ ok: true });
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await refreshClientSession(
    req.cookies?.[authCookieNames.refresh],
  );

  setAuthCookies(res, result);

  res.json({
    ok: true,
    client: result.client,
    accessToken: result.accessToken,
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    ok: true,
    client: req.auth.clientPublic,
  });
});
