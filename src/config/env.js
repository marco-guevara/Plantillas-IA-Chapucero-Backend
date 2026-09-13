import dotenv from 'dotenv';

dotenv.config();

const parseList = (value) =>
  String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined) return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
};

const parseInteger = (value, defaultValue) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : defaultValue;
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  trustProxy: parseBoolean(
    process.env.TRUST_PROXY,
    process.env.NODE_ENV === 'production',
  ),
  databaseUrl:
    process.env.DATABASE_URL ||
    'postgresql://postgres:postgres@localhost:5432/laminas_ia',
  databaseSsl: parseBoolean(process.env.DATABASE_SSL),
  databaseRequired: parseBoolean(
    process.env.DATABASE_REQUIRED,
    process.env.NODE_ENV === 'production',
  ),
  dbLogging: parseBoolean(process.env.DB_LOGGING),
  webhookAuditEnabled: parseBoolean(
    process.env.WEBHOOK_AUDIT_ENABLED,
    process.env.NODE_ENV === 'production',
  ),
  corsOrigins: parseList(process.env.CORS_ORIGINS || 'http://localhost:5173'),
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  cookieSecure: parseBoolean(
    process.env.COOKIE_SECURE,
    process.env.NODE_ENV === 'production',
  ),
  csrfRequired: parseBoolean(
    process.env.CSRF_REQUIRED,
    process.env.NODE_ENV === 'production',
  ),
  requireAuthForApi: parseBoolean(process.env.REQUIRE_AUTH_FOR_API, true),
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret-change-me',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-change-me',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  n8nUrl: process.env.N8N_URL || 'https://n8n-ukzb.onrender.com',
  hostingerUploadUrl:
    process.env.HOSTINGER_UPLOAD_URL ||
    'https://laizquierdanoticia.com/guardar_imagen_lamina.php',
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
  serperApiKey: process.env.SERPER_API_KEY || '',
  unsplashAccessKey: process.env.UNSPLASH_ACCESS_KEY || '',
  aiProvider: process.env.AI_PROVIDER || 'gemini',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.6-flash',
  webhookTimeoutMs: Math.max(
    1_000,
    parseInteger(process.env.WEBHOOK_TIMEOUT_MS, 25_000),
  ),
  webhookRetryAttempts: Math.max(
    0,
    Math.min(3, parseInteger(process.env.WEBHOOK_RETRY_ATTEMPTS, 1)),
  ),
  rateLimitWindowMs: Math.max(
    60_000,
    parseInteger(process.env.RATE_LIMIT_WINDOW_MS, 900_000),
  ),
  rateLimitGlobalMax: Math.max(
    60,
    parseInteger(process.env.RATE_LIMIT_GLOBAL_MAX, 600),
  ),
  rateLimitAuthMax: Math.max(
    5,
    parseInteger(process.env.RATE_LIMIT_AUTH_MAX, 20),
  ),
  rateLimitWebhookMax: Math.max(
    10,
    parseInteger(process.env.RATE_LIMIT_WEBHOOK_MAX, 120),
  ),
};

export const isProduction = env.nodeEnv === 'production';

export const assertProductionSecrets = () => {
  if (!isProduction) return;

  const unsafeValues = [
    ['JWT_ACCESS_SECRET', env.jwtAccessSecret],
    ['JWT_REFRESH_SECRET', env.jwtRefreshSecret],
  ].filter(([, value]) => value.includes('change-me') || value.length < 32);

  if (unsafeValues.length > 0) {
    const names = unsafeValues.map(([name]) => name).join(', ');
    throw new Error(`Production secrets are missing or unsafe: ${names}`);
  }
};
