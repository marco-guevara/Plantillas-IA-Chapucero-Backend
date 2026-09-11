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
import { requireN8nMode } from '../middlewares/modeGuardMiddleware.js';
import { webhookRateLimit } from '../middlewares/rateLimitMiddleware.js';
import {
  requireBodyObject,
  validateCategoryParam,
  validateFormatParam,
  validateUuidParam,
} from '../middlewares/requestValidationMiddleware.js';

export const laminaRoutes = Router();

laminaRoutes.use(apiAuthMode);
laminaRoutes.use(webhookRateLimit);

// El historial sirve a ambos modos (n8n y standalone) - sin guard de modo.
laminaRoutes.get('/history', listHistory);
laminaRoutes.get('/history/:id', validateUuidParam('id'), getHistoryDetail);

// El resto de rutas de este router proxean a n8n - solo clientes en modo n8n.
laminaRoutes.get('/queue/:category', requireN8nMode, validateCategoryParam, getQueue);
laminaRoutes.patch(
  '/texts/:category',
  requireN8nMode,
  validateCategoryParam,
  requireBodyObject,
  patchTexts,
);
laminaRoutes.post('/downloads', requireN8nMode, requireBodyObject, download);
laminaRoutes.post(
  '/generate/:format',
  requireN8nMode,
  validateFormatParam,
  requireBodyObject,
  generate,
);
laminaRoutes.post(
  '/:category',
  requireN8nMode,
  validateCategoryParam,
  requireBodyObject,
  createOrSaveLamina,
);
