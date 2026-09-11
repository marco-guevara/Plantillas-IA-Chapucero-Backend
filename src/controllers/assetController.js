import { uploadAsset } from '../services/n8nProxyService.js';
import { persistUploadedAsset } from '../services/laminaPersistenceService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const upload = asyncHandler(async (req, res) => {
  const result = await uploadAsset(req.body);
  await persistUploadedAsset({ req, result });
  res.json(result);
});
