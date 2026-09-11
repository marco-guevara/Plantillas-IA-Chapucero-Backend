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

export const authRoutes = Router();

authRoutes.post('/login', login);
authRoutes.post('/logout', logout);
authRoutes.post('/refresh', refresh);
authRoutes.get('/csrf', csrf);
authRoutes.get('/me', requireAuth, me);
authRoutes.get('/sessions', requireAuth, sessions);
authRoutes.delete('/sessions/:id', requireAuth, revokeSession);
