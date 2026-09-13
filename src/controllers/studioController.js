import {
  assertUnavailable,
  generateStudioDraft,
  generateStudioFormat,
  searchStudioImages,
  upsertStudioLamina,
  uploadStudioAsset,
} from '../services/studioLaminaService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const saveLamina = asyncHandler(async (req, res) => {
  const result = await upsertStudioLamina({
    clientId: req.auth.client.id,
    payload: req.body,
  });

  res.json({ ok: true, ...result });
});

export const generate = asyncHandler(async (req, res) => {
  const result = await generateStudioFormat({
    clientId: req.auth.client.id,
    id: req.body.id,
    format: req.params.format,
    base64: req.body.imageBase64,
    title: req.body.titulo,
  });

  res.json(result);
});

export const uploadAsset = asyncHandler(async (req, res) => {
  const result = await uploadStudioAsset({
    clientId: req.auth.client.id,
    laminaId: req.body.lamina_id,
    image: req.body.image,
    tipo: req.body.tipo,
  });

  res.json(result);
});

export const searchImages = asyncHandler(async (req, res) => {
  const images = await searchStudioImages(req.body.query);
  res.json({ images });
});

export const publish = asyncHandler(async () => {
  assertUnavailable('La publicacion en redes');
});

export const generateDraft = asyncHandler(async (req, res) => {
  const draft = await generateStudioDraft({
    clientId: req.auth.client.id,
    prompt: req.body.prompt,
  });

  res.json({ draft });
});
