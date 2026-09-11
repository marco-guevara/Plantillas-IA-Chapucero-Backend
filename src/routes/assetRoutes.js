import { Router } from 'express';

import { upload } from '../controllers/assetController.js';
import { apiAuthMode } from '../middlewares/apiAuthModeMiddleware.js';
import { requireBodyObject } from '../middlewares/requestValidationMiddleware.js';

export const assetRoutes = Router();

assetRoutes.use(apiAuthMode);
assetRoutes.post('/upload', requireBodyObject, upload);
