import { Router } from 'express';

import { search } from '../controllers/imageController.js';
import { apiAuthMode } from '../middlewares/apiAuthModeMiddleware.js';

export const imageRoutes = Router();

imageRoutes.use(apiAuthMode);
imageRoutes.post('/search', search);
