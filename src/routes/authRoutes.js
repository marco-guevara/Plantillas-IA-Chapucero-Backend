import { Router } from 'express';

import {
  login,
  logout,
  me,
  csrf,
  refresh,
  revokeSession,
  sessions,
} from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { authRateLimit } from '../middlewares/rateLimitMiddleware.js';
import {
  validateLoginBody,
  validateUuidParam,
} from '../middlewares/requestValidationMiddleware.js';

export const authRoutes = Router();

authRoutes.post('/login', authRateLimit, validateLoginBody, login);
authRoutes.post('/logout', logout);
authRoutes.post('/refresh', authRateLimit, refresh);
authRoutes.get('/csrf', authRateLimit, csrf);
authRoutes.get('/me', requireAuth, me);
authRoutes.get('/sessions', requireAuth, sessions);
authRoutes.delete(
  '/sessions/:id',
  requireAuth,
  validateUuidParam('id'),
  revokeSession,
);
