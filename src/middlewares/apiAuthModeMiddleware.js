import { env } from '../config/env.js';
import { requireAuth } from './authMiddleware.js';

export const apiAuthMode = (req, res, next) => {
  if (!env.requireAuthForApi) {
    next();
    return;
  }

  requireAuth(req, res, next);
};
