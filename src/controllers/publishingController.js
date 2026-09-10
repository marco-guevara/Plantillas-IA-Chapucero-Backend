import { publishToSocial } from '../services/n8nProxyService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const publish = asyncHandler(async (req, res) => {
  const result = await publishToSocial(req.params.network, req.body);
  res.json(result);
});
