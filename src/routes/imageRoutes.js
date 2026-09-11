import { Router } from 'express';

import { search } from '../controllers/imageController.js';
import { apiAuthMode } from '../middlewares/apiAuthModeMiddleware.js';
import { requireBodyObject } from '../middlewares/requestValidationMiddleware.js';

export const imageRoutes = Router();

imageRoutes.use(apiAuthMode);
imageRoutes.post('/search', requireBodyObject, search);
