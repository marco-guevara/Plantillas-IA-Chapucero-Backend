import {
  loginClient,
  listClientSessions,
  logoutClient,
  refreshClientSession,
  revokeClientSession,
} from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
  authCookieNames,
  clearAuthCookies,
  setAuthCookies,
} from '../utils/cookies.js';
import { setCsrfCookie } from '../services/csrfService.js';

export const csrf = asyncHandler(async (_req, res) => {
  const token = setCsrfCookie(res);
  res.json({
    ok: true,
    csrfToken: token,
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginClient({
    email: req.body.email,
    password: req.body.password,
    userAgent: req.headers['user-agent'],
    ipAddress: req.ip,
  });

  setAuthCookies(res, result);
  const csrfToken = setCsrfCookie(res);

  res.json({
    ok: true,
    client: result.client,
    accessToken: result.accessToken,
    csrfToken,
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
  const csrfToken = setCsrfCookie(res);

  res.json({
    ok: true,
    client: result.client,
    accessToken: result.accessToken,
    csrfToken,
  });
});

export const me = asyncHandler(async (req, res) => {
  res.json({
    ok: true,
    client: req.auth.clientPublic,
  });
});

export const sessions = asyncHandler(async (req, res) => {
  const items = await listClientSessions(req.auth.client.id);
  res.json({
    ok: true,
    sessions: items,
  });
});

export const revokeSession = asyncHandler(async (req, res) => {
  await revokeClientSession({
    clientId: req.auth.client.id,
    sessionId: req.params.id,
  });

  res.json({ ok: true });
});
