import { Lamina, LaminaAsset } from '../models/index.js';
import { ApiError } from '../utils/apiError.js';
import { sanitizePayload } from '../utils/sanitizePayload.js';
import { generateLaminaDraft } from './aiService.js';
import { uploadAsset } from './cloudinaryService.js';
import { listLaminaHistory } from './laminaHistoryService.js';
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

// Fits the title font size to its length so short titles stay big and
// bold while longer ones shrink instead of overflowing/wrapping badly.
// Tuned against the same "tam" scale used by the manual text size slider
// (12-100, default 55 for a ~15 char title).
const getAutoTextSize = (text) => {
  const length = String(text || '').trim().length || 1;
  const size = Math.round(70 - Math.max(0, length - 10) * 0.7);
  return Math.min(64, Math.max(26, size));
};

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

export const generateStudioDraft = async ({ clientId, prompt }) => {
  const trimmedPrompt = String(prompt || '').trim();
  if (!trimmedPrompt) {
    throw new ApiError(400, 'Prompt is required');
  }

  const referenceLaminas = await listLaminaHistory({ clientId, limit: 6 });

  const draft = await generateLaminaDraft({
    prompt: trimmedPrompt,
    referenceLaminas,
  });

  const images = await searchStudioImages(draft.imageQuery || trimmedPrompt).catch(
    () => [],
  );
  const imagenPrincipal = images[0]?.original || null;

  const titulo = draft.titulo || '';
  const titulo34 = draft.titulo34 || draft.titulo || '';
  const textoConfig = {
    // Same defaults as DEFAULT_FORMAT_CONFIG.textoConfig on the frontend
    // (src/domain/editorConfig.js) - the config-merge replaces this whole
    // object, it does not deep-merge per field, so every field must be
    // supplied or the sliders that read them render "NaN".
    align: 'center',
    color: '#ffffff',
    lineHeight: 1.2,
    posY: 75,
    spacing: 1,
    tam: getAutoTextSize(titulo.length >= titulo34.length ? titulo : titulo34),
  };

  return {
    titulo,
    titulo34,
    post_x: draft.postX || '',
    hashtags: draft.hashtags || '',
    imagen_principal: imagenPrincipal,
    imagenes_composicion: {},
    tipo_composicion: 'ninguna',
    plantilla: {
      color: 'Degradado',
      gradientColor: draft.gradientColor || '#c0392b',
    },
    // Provided directly (not just `configuracion`) because the editor's
    // config-merge reads config_916/config_340 first and treats a missing
    // key as `{}`, which short-circuits before ever falling back to a flat
    // `configuracion` object.
    config_916: { textoConfig },
    config_340: { textoConfig },
  };
};
