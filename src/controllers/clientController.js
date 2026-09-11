import {
  createClient,
  listClients,
  updateClient,
} from '../services/clientService.js';
import { ApiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const index = asyncHandler(async (_req, res) => {
  const clients = await listClients();
  res.json({ clients });
});

export const create = asyncHandler(async (req, res) => {
  const client = await createClient(req.body);
  res.status(201).json({ client });
});

export const update = asyncHandler(async (req, res) => {
  if (
    req.params.id === req.auth.client.id &&
    (req.body.status === 'disabled' || req.body.role !== undefined)
  ) {
    throw new ApiError(400, 'Admins cannot remove their own access');
  }

  const result = await updateClient({
    id: req.params.id,
    ...req.body,
  });

  res.json(result);
});
