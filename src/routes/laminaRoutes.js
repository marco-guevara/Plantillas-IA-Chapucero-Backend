import { Router } from 'express';

import {
  createOrSaveLamina,
  download,
  generate,
  getQueue,
  patchTexts,
} from '../controllers/laminaController.js';
import {
  getHistoryDetail,
  listHistory,
} from '../controllers/laminaHistoryController.js';
import { apiAuthMode } from '../middlewares/apiAuthModeMiddleware.js';
import {
  requireBodyObject,
  validateCategoryParam,
  validateFormatParam,
  validateUuidParam,
} from '../middlewares/requestValidationMiddleware.js';

export const laminaRoutes = Router();

laminaRoutes.use(apiAuthMode);
laminaRoutes.get('/history', listHistory);
laminaRoutes.get('/history/:id', validateUuidParam('id'), getHistoryDetail);
laminaRoutes.get('/queue/:category', validateCategoryParam, getQueue);
laminaRoutes.patch(
  '/texts/:category',
  validateCategoryParam,
  requireBodyObject,
  patchTexts,
);
laminaRoutes.post('/downloads', requireBodyObject, download);
laminaRoutes.post(
  '/generate/:format',
  validateFormatParam,
  requireBodyObject,
  generate,
);
laminaRoutes.post(
  '/:category',
  validateCategoryParam,
  requireBodyObject,
  createOrSaveLamina,
);
