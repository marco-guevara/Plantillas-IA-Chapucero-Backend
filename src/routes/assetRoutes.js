import { Router } from 'express';

import { upload } from '../controllers/assetController.js';
import { apiAuthMode } from '../middlewares/apiAuthModeMiddleware.js';
import { webhookRateLimit } from '../middlewares/rateLimitMiddleware.js';
import { requireBodyObject } from '../middlewares/requestValidationMiddleware.js';

export const assetRoutes = Router();

assetRoutes.use(apiAuthMode);
assetRoutes.use(webhookRateLimit);
assetRoutes.post('/upload', requireBodyObject, upload);
