import { searchImages } from '../services/n8nProxyService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const search = asyncHandler(async (req, res) => {
  const images = await searchImages(req.body);
  res.json({ images });
});
