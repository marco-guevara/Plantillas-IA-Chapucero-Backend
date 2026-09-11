import { Router } from 'express';

import { assetRoutes } from './assetRoutes.js';
import { authRoutes } from './authRoutes.js';
import { clientRoutes } from './clientRoutes.js';
import { healthRoutes } from './healthRoutes.js';
import { imageRoutes } from './imageRoutes.js';
import { laminaRoutes } from './laminaRoutes.js';
import { publishingRoutes } from './publishingRoutes.js';
import { studioRoutes } from './studioRoutes.js';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/clients', clientRoutes);
routes.use('/health', healthRoutes);
routes.use('/laminas', laminaRoutes);
routes.use('/images', imageRoutes);
routes.use('/assets', assetRoutes);
routes.use('/publishing', publishingRoutes);
routes.use('/studio', studioRoutes);
