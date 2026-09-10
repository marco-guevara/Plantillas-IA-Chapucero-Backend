import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const health = asyncHandler(async (_req, res) => {
  res.json({
    ok: true,
    service: 'laminas-ia-2026-backend',
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});
