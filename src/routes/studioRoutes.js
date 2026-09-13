import { Router } from 'express';

import {
  generate,
  generateDraft,
  publish,
  saveLamina,
  searchImages,
  uploadAsset,
} from '../controllers/studioController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { webhookRateLimit } from '../middlewares/rateLimitMiddleware.js';
import {
  requireBodyObject,
  validateFormatParam,
  validateNetworkParam,
} from '../middlewares/requestValidationMiddleware.js';

export const studioRoutes = Router();

studioRoutes.use(requireAuth);
studioRoutes.use(webhookRateLimit);

studioRoutes.post('/laminas', requireBodyObject, saveLamina);
studioRoutes.post(
  '/laminas/generate/:format',
  validateFormatParam,
  requireBodyObject,
  generate,
);
studioRoutes.post('/assets/upload', requireBodyObject, uploadAsset);
studioRoutes.post('/ai/generate', requireBodyObject, generateDraft);
studioRoutes.post('/images/search', requireBodyObject, searchImages);
studioRoutes.post(
  '/publishing/:network',
  validateNetworkParam,
  requireBodyObject,
  publish,
);
