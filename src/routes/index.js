import { Router } from 'express';

import { assetRoutes } from './assetRoutes.js';
import { authRoutes } from './authRoutes.js';
import { healthRoutes } from './healthRoutes.js';
import { imageRoutes } from './imageRoutes.js';
import { laminaRoutes } from './laminaRoutes.js';
import { publishingRoutes } from './publishingRoutes.js';

export const routes = Router();

routes.use('/auth', authRoutes);
routes.use('/health', healthRoutes);
routes.use('/laminas', laminaRoutes);
routes.use('/images', imageRoutes);
routes.use('/assets', assetRoutes);
routes.use('/publishing', publishingRoutes);
