import { Router } from 'express';

import { health, readiness } from '../controllers/healthController.js';

export const healthRoutes = Router();

healthRoutes.get('/', health);
healthRoutes.get('/ready', readiness);
