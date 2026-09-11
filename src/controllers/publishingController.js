import { publishToSocial } from '../services/n8nProxyService.js';
import { persistPublishJob } from '../services/laminaPersistenceService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const publish = asyncHandler(async (req, res) => {
  const result = await publishToSocial(req.params.network, req.body);
  await persistPublishJob({
    req,
    network: req.params.network,
    result,
  });
  res.json(result);
});
