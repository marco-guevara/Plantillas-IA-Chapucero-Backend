import { Router } from 'express';

import {
  createOrSaveLamina,
  download,
  generate,
  getQueue,
  patchTexts,
} from '../controllers/laminaController.js';
import { apiAuthMode } from '../middlewares/apiAuthModeMiddleware.js';

export const laminaRoutes = Router();

laminaRoutes.use(apiAuthMode);
laminaRoutes.get('/queue/:category', getQueue);
laminaRoutes.patch('/texts/:category', patchTexts);
laminaRoutes.post('/downloads', download);
laminaRoutes.post('/generate/:format', generate);
laminaRoutes.post('/:category', createOrSaveLamina);
