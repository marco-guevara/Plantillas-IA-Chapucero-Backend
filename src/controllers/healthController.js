import { env } from '../config/env.js';
import { checkDatabase } from '../config/database.js';
import { getMigrationStatus } from '../db/migrationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const health = asyncHandler(async (_req, res) => {
  res.json({
    ok: true,
    service: 'laminas-ia-2026-backend',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

export const readiness = asyncHandler(async (_req, res) => {
  const database = await checkDatabase();
  const migrations = database.ok
    ? await getMigrationStatus()
    : {
        ok: false,
        tableReady: false,
        applied: [],
        pending: [],
      };
  const checks = {
    database,
    migrations,
    cors: {
      ok: env.corsOrigins.length > 0,
      origins: env.corsOrigins,
    },
    auth: {
      ok:
        env.jwtAccessSecret.length >= 32 &&
        env.jwtRefreshSecret.length >= 32 &&
        env.jwtAccessSecret !== env.jwtRefreshSecret,
      accessSecretConfigured: !env.jwtAccessSecret.includes('change-me'),
      refreshSecretConfigured: !env.jwtRefreshSecret.includes('change-me'),
    },
    cookies: {
      ok: env.nodeEnv !== 'production' || (env.cookieSecure && env.csrfRequired),
      secure: env.cookieSecure,
      trustProxy: env.trustProxy,
      csrfRequired: env.csrfRequired,
    },
    integrations: {
      ok: Boolean(env.n8nUrl && env.hostingerUploadUrl),
      n8nUrlConfigured: Boolean(env.n8nUrl),
      hostingerUploadConfigured: Boolean(env.hostingerUploadUrl),
    },
  };

  const ok =
    (!database.required || database.ok) &&
    (!database.required || migrations.ok) &&
    checks.cors.ok &&
    checks.auth.ok &&
    checks.cookies.ok &&
    checks.integrations.ok;

  res.status(ok ? 200 : 503).json({
    ok,
    service: 'laminas-ia-2026-backend',
    environment: env.nodeEnv,
    checks,
    timestamp: new Date().toISOString(),
  });
});
