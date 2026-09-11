import { Router } from 'express';

import { publish } from '../controllers/publishingController.js';
import { apiAuthMode } from '../middlewares/apiAuthModeMiddleware.js';
import { webhookRateLimit } from '../middlewares/rateLimitMiddleware.js';
import {
  requireBodyObject,
  validateNetworkParam,
} from '../middlewares/requestValidationMiddleware.js';

export const publishingRoutes = Router();

publishingRoutes.use(apiAuthMode);
publishingRoutes.use(webhookRateLimit);
publishingRoutes.post(
  '/:network',
  validateNetworkParam,
  requireBodyObject,
  publish,
);
