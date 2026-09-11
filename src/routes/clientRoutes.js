import { Router } from 'express';

import {
  create,
  index,
  update,
} from '../controllers/clientController.js';
import { requireAuth, requireRole } from '../middlewares/authMiddleware.js';
import {
  requireBodyObject,
  validateCreateClientBody,
  validateUpdateClientBody,
  validateUuidParam,
} from '../middlewares/requestValidationMiddleware.js';

export const clientRoutes = Router();

clientRoutes.use(requireAuth, requireRole('admin'));
clientRoutes.get('/', index);
clientRoutes.post('/', requireBodyObject, validateCreateClientBody, create);
clientRoutes.patch(
  '/:id',
  validateUuidParam('id'),
  requireBodyObject,
  validateUpdateClientBody,
  update,
);
