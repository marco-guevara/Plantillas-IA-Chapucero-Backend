import { Router } from 'express';

import {
  getHistoryDetail,
  listHistory,
} from '../controllers/laminaHistoryController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { validateUuidParam } from '../middlewares/requestValidationMiddleware.js';

export const laminaRoutes = Router();

laminaRoutes.use(requireAuth);

laminaRoutes.get('/history', listHistory);
laminaRoutes.get('/history/:id', validateUuidParam('id'), getHistoryDetail);
