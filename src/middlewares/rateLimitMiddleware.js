import { rateLimit } from 'express-rate-limit';

import { env } from '../config/env.js';

const buildLimiter = ({ max, message }) =>
  rateLimit({
    windowMs: env.rateLimitWindowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      ok: false,
      error: message,
    },
  });

export const globalRateLimit = buildLimiter({
  max: env.rateLimitGlobalMax,
  message: 'Too many requests',
});

export const authRateLimit = buildLimiter({
  max: env.rateLimitAuthMax,
  message: 'Too many authentication requests',
});

export const webhookRateLimit = buildLimiter({
  max: env.rateLimitWebhookMax,
  message: 'Too many workflow requests',
});
