import { Router } from 'express';

import { authRoutes } from './authRoutes.js';
import { clientRoutes } from './clientRoutes.js';
import { healthRoutes } from './healthRoutes.js';
import { laminaRoutes } from './laminaRoutes.js';
import { studioRoutes } from './studioRoutes.js';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/clients', clientRoutes);
routes.use('/health', healthRoutes);
routes.use('/laminas', laminaRoutes);
routes.use('/studio', studioRoutes);
