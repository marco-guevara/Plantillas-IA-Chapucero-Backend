import { Router } from 'express';

import { login, logout, me, refresh } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

export const authRoutes = Router();

authRoutes.post('/login', login);
authRoutes.post('/logout', logout);
authRoutes.post('/refresh', refresh);
authRoutes.get('/me', requireAuth, me);
