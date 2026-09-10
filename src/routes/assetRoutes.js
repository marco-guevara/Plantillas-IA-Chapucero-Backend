import { Router } from 'express';

import { upload } from '../controllers/assetController.js';
import { apiAuthMode } from '../middlewares/apiAuthModeMiddleware.js';

export const assetRoutes = Router();

assetRoutes.use(apiAuthMode);
assetRoutes.post('/upload', upload);
