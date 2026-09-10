import {
  downloadLaminas,
  fetchQueue,
  generateLamina,
  saveLamina,
  updateTexts,
} from '../services/n8nProxyService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getQueue = asyncHandler(async (req, res) => {
  const laminas = await fetchQueue(req.params.category);
  res.json({ laminas });
});

export const patchTexts = asyncHandler(async (req, res) => {
  const result = await updateTexts(req.params.category, req.body);
  res.json({ ok: true, ...result });
});

export const createOrSaveLamina = asyncHandler(async (req, res) => {
  const result = await saveLamina(req.params.category, req.body);
  res.json({ ok: true, ...result });
});

export const generate = asyncHandler(async (req, res) => {
  const result = await generateLamina(req.params.format, req.body);
  res.json(result);
});

export const download = asyncHandler(async (req, res) => {
  const result = await downloadLaminas(req.body);
  res.json(result);
});
