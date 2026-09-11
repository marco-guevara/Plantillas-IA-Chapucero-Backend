import { Lamina, LaminaAsset } from '../models/index.js';
import { ApiError } from '../utils/apiError.js';
import { sanitizePayload } from '../utils/sanitizePayload.js';
import { uploadAsset } from './cloudinaryService.js';
import { searchSerperImages } from './serperImageSearchService.js';
import { searchUnsplashImages } from './unsplashService.js';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const assetTypes = new Set([
  'principal',
  'imagen1',
  'circulo1',
  'circulo2',
  'generated916',
  'generated340',
  'other',
]);

const isUuid = (value) => uuidPattern.test(String(value || ''));

const getTitle = (payload = {}) => payload.titulo || payload.title || null;

const findOwnedLamina = async ({ clientId, id }) => {
  if (!isUuid(id)) return null;

  return Lamina.findOne({ where: { id, clientId } });
};

export const upsertStudioLamina = async ({ clientId, payload = {} }) => {
  const values = {
    clientId,
    category: 'general',
    title: getTitle(payload),
    status: 'saved',
    payload: sanitizePayload(payload),
  };

  const existing = await findOwnedLamina({ clientId, id: payload.id });

  if (existing) {
    await existing.update(values);
    return { id: existing.id };
  }

  const created = await Lamina.create(values);
  return { id: created.id };
};

export const generateStudioFormat = async ({
  clientId,
  id,
  format,
  base64,
  title,
}) => {
  let lamina = await findOwnedLamina({ clientId, id });

  if (!lamina) {
    lamina = await Lamina.create({
      clientId,
      category: 'general',
      title: title || null,
      status: 'draft',
      payload: {},
    });
  }

  const { url } = await uploadAsset(base64, {
    folder: `laminas/${clientId}`,
  });
  const urlField = String(format) === '340' ? 'url340' : 'url916';

  await lamina.update({ [urlField]: url, status: 'generated' });

  await LaminaAsset.create({
    laminaId: lamina.id,
    clientId,
    type: String(format) === '340' ? 'generated340' : 'generated916',
    uploadedUrl: url,
  });

  return { id: lamina.id, url };
};

export const uploadStudioAsset = async ({ clientId, laminaId, image, tipo }) => {
  const { url } = await uploadAsset(image, {
    folder: `laminas/${clientId}`,
  });
  const normalizedType = assetTypes.has(String(tipo)) ? String(tipo) : 'other';

  await LaminaAsset.create({
    laminaId: isUuid(laminaId) ? laminaId : null,
    clientId,
    type: normalizedType,
    uploadedUrl: url,
  });

  return { ok: true, url };
};

export const assertUnavailable = (feature) => {
  throw new ApiError(501, `${feature} aun no esta disponible en este plan`);
};

export const searchStudioImages = async (query) => {
  const trimmed = String(query || '').trim();
  if (!trimmed) {
    throw new ApiError(400, 'Query is required');
  }

  const serperResults = await searchSerperImages(trimmed).catch(() => []);
  if (serperResults.length > 0) {
    return serperResults;
  }

  const unsplashResults = await searchUnsplashImages(trimmed).catch(() => []);
  if (unsplashResults.length > 0) {
    return unsplashResults;
  }

  throw new ApiError(502, 'No se encontraron imagenes');
};
