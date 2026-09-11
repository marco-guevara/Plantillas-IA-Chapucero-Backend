import { Router } from 'express';

import { publish } from '../controllers/publishingController.js';
import { apiAuthMode } from '../middlewares/apiAuthModeMiddleware.js';
import {
  requireBodyObject,
  validateNetworkParam,
} from '../middlewares/requestValidationMiddleware.js';

export const publishingRoutes = Router();

publishingRoutes.use(apiAuthMode);
publishingRoutes.post(
  '/:network',
  validateNetworkParam,
  requireBodyObject,
  publish,
);
