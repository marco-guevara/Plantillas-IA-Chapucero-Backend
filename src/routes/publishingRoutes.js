import { Router } from 'express';

import { publish } from '../controllers/publishingController.js';
import { apiAuthMode } from '../middlewares/apiAuthModeMiddleware.js';

export const publishingRoutes = Router();

publishingRoutes.use(apiAuthMode);
publishingRoutes.post('/:network', publish);
