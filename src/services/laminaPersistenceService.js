import { Lamina, LaminaAsset, PublishJob } from '../models/index.js';
import { sanitizePayload } from '../utils/sanitizePayload.js';

const categoryAliases = {
  lps: 'lps',
  lpm: 'lpm',
  lm: 'lm',
  li: 'li',
  'programas sociales': 'lps',
  'politica mexico': 'lpm',
  medios: 'lm',
  internacional: 'li',
};
const assetTypes = new Set([
  'principal',
  'imagen1',
  'circulo1',
  'circulo2',
  'generated916',
  'generated340',
  'other',
]);

const warnPersistenceSkip = (scope, error) => {
  console.warn(`${scope} persistence skipped:`, error.message);
};

const getClientId = (req) => req.auth?.client?.id || null;

const normalizeCategory = (category) => {
  const normalized = String(category || '').toLowerCase();
  return categoryAliases[normalized] || null;
};

const getLegacyId = (payload = {}) =>
  payload.IDL || payload.id || payload.lamina_id || payload.legacy_id || null;

const getOriginalUser = (payload = {}) =>
  payload.usuario_lamina || payload.usuario || payload.user || null;

const getTitle = (payload = {}) =>
  payload.titulo_actual || payload.titulo || payload.title || null;

const getGeneratedUrl = (result = {}) =>
  result.url || result.webViewLink || result.webContentLink || null;

const findExistingLamina = async ({ category, legacyId }) => {
  if (!legacyId) return null;

  return Lamina.findOne({
    where: {
      category,
      legacyId: String(legacyId),
    },
  });
};

const upsertLamina = async ({
  category,
  clientId,
  payload,
  status,
  result,
  urlField,
}) => {
  const normalizedCategory = normalizeCategory(category);
  if (!normalizedCategory) return null;

  const legacyId = getLegacyId(payload);
  const values = {
    clientId,
    legacyId: legacyId ? String(legacyId) : null,
    category: normalizedCategory,
    originalUser: getOriginalUser(payload),
    title: getTitle(payload),
    status,
    payload: sanitizePayload(payload),
    metadata: {
      lastBackendAction: status,
      lastN8nResponse: sanitizePayload(result),
    },
  };

  if (urlField) {
    values[urlField] = getGeneratedUrl(result);
  }

  const existing = await findExistingLamina({
    category: normalizedCategory,
    legacyId,
  });

  if (existing) {
    await existing.update({
      ...values,
      metadata: {
        ...existing.metadata,
        ...values.metadata,
      },
    });
    return existing;
  }

  return Lamina.create(values);
};

export const persistSavedLamina = async ({ req, category, result }) => {
  try {
    await upsertLamina({
      category,
      clientId: getClientId(req),
      payload: req.body,
      status: 'saved',
      result,
    });
  } catch (error) {
    warnPersistenceSkip('Saved lamina', error);
  }
};

export const persistGeneratedLamina = async ({ req, format, result }) => {
  try {
    const category = req.body.categoria || req.body.category;
    await upsertLamina({
      category,
      clientId: getClientId(req),
      payload: req.body,
      status: 'generated',
      result,
      urlField: String(format) === '340' ? 'url340' : 'url916',
    });
  } catch (error) {
    warnPersistenceSkip('Generated lamina', error);
  }
};

export const persistDownloadLinks = async ({ req, result }) => {
  try {
    const category = req.body.categoria || req.body.category;
    await upsertLamina({
      category,
      clientId: getClientId(req),
      payload: {
        ...req.body,
        url_916: result.url916 || req.body.url_916,
        url_340: result.url340 || req.body.url_340,
      },
      status: 'generated',
      result,
    });
  } catch (error) {
    warnPersistenceSkip('Download links', error);
  }
};

export const persistUploadedAsset = async ({ req, result }) => {
  try {
    const legacyId = getLegacyId(req.body);
    const lamina = legacyId
      ? await Lamina.findOne({ where: { legacyId: String(legacyId) } })
      : null;
    const rawType = String(req.body.tipo || 'other');

    await LaminaAsset.create({
      laminaId: lamina?.id || null,
      clientId: getClientId(req),
      type: assetTypes.has(rawType) ? rawType : 'other',
      sourceUrl:
        typeof req.body.image === 'string' && req.body.image.startsWith('http')
          ? req.body.image
          : null,
      uploadedUrl: result.url || null,
      metadata: {
        legacyLaminaId: legacyId,
        usuario: req.body.usuario || null,
        result: sanitizePayload(result),
      },
    });
  } catch (error) {
    warnPersistenceSkip('Uploaded asset', error);
  }
};

export const persistPublishJob = async ({ req, network, result }) => {
  try {
    const normalizedNetwork = String(network || '').toLowerCase();
    if (!['facebook', 'instagram', 'x'].includes(normalizedNetwork)) {
      return;
    }

    const legacyId = getLegacyId(req.body);
    const lamina = legacyId
      ? await Lamina.findOne({ where: { legacyId: String(legacyId) } })
      : null;

    await PublishJob.create({
      laminaId: lamina?.id || null,
      clientId: getClientId(req),
      network: normalizedNetwork,
      status: result.ok === false ? 'failed' : 'success',
      requestPayload: sanitizePayload(req.body),
      responsePayload: sanitizePayload(result),
      errorMessage: result.ok === false ? result.message || 'Publish failed' : null,
      publishedAt: result.ok === false ? null : new Date(),
    });

    if (lamina && result.ok !== false) {
      await lamina.update({ status: 'published' });
    }
  } catch (error) {
    warnPersistenceSkip('Publish job', error);
  }
};
