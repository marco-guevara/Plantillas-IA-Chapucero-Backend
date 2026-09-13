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

// Fits the title font size to its length: the text zone only fits ~2 short
// lines at the default size (55), so anything longer than a few words has
// to shrink or it gets clipped by the canvas. Empirically ~11 characters
// fit comfortably at tam=55, so this scales inversely from that anchor.
const getAutoTextSize = (text) => {
  const length = String(text || '').trim().length || 1;
  const size = Math.round(605 / length);
  // Capped at 55 (the pre-existing manual default, already verified to
  // look right for short titles) rather than higher - a bigger cap only
  // helps very short titles and risks a single long word overflowing the
  // zone width before it would ever help vertical fit.
  return Math.min(55, Math.max(22, size));
};

// Must stay in sync with FORMAT_SPECS[format].output in
// src/domain/laminaGeometry.js (frontend) - the fixed export canvas size
// per format, used here to compute a "cover" crop for whatever aspect
// ratio the auto-selected search image happens to have.
const CANVAS_SIZE = {
  916: { width: 1082, height: 1920 },
  340: { width: 1082, height: 1417 },
};

// getImageBox() on the frontend (src/domain/imageGeometry.js) draws the
// main image at canvas.width*(escala/100) wide, preserving its natural
// aspect ratio - it never crops. Left at the default escala=100/posX=0/
// posY=0, a landscape photo in a portrait canvas leaves a visible gap
// below it. This computes the smallest escala that also covers the
// canvas height, then centers the resulting overflow (canvas clips
// anything drawn past its own edges, so this behaves like CSS
// object-fit: cover).
const getCoverImageConfig = ({ format, imageWidth, imageHeight }) => {
  if (!imageWidth || !imageHeight) return null;

  const canvas = CANVAS_SIZE[format];
  const requiredScale =
    (canvas.height * imageWidth) / (canvas.width * imageHeight);
  const escala = Math.max(100, Math.round(requiredScale * 100));
  const drawWidth = canvas.width * (escala / 100);
  const drawHeight = (imageHeight * drawWidth) / imageWidth;

  return {
    escala,
    posX: Math.round((-(drawWidth - canvas.width) / 2 / canvas.width) * 100),
    posY: Math.round((-(drawHeight - canvas.height) / 2 / canvas.height) * 100),
  };
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
  const selectedImage = images[0] || null;
  const imagenPrincipal = selectedImage?.original || null;

  const titulo = draft.titulo || '';
  const titulo34 = draft.titulo34 || draft.titulo || '';
  const buildTextoConfig = (text) => ({
    // Same defaults as DEFAULT_FORMAT_CONFIG.textoConfig on the frontend
    // (src/domain/editorConfig.js) - the config-merge replaces this whole
    // object, it does not deep-merge per field, so every field must be
    // supplied or the sliders that read them render "NaN".
    align: 'center',
    color: '#ffffff',
    lineHeight: 1.2,
    posY: 75,
    spacing: 1,
    tam: getAutoTextSize(text),
  });

  const buildImgConfig = (format) => {
    const cover = getCoverImageConfig({
      format,
      imageWidth: selectedImage?.width,
      imageHeight: selectedImage?.height,
    });
    // Same defaults as DEFAULT_FORMAT_CONFIG.imgConfig - same shallow-merge
    // caveat as textoConfig above, so every field must be supplied.
    return cover || { escala: 100, posX: 0, posY: 0 };
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
    config_916: {
      textoConfig: buildTextoConfig(titulo),
      imgConfig: buildImgConfig(916),
    },
    config_340: {
      textoConfig: buildTextoConfig(titulo34),
      imgConfig: buildImgConfig(340),
    },
  };
};
