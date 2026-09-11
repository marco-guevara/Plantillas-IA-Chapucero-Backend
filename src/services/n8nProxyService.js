import { env } from '../config/env.js';
import {
  categoryLabels,
  fallbackWebhooks,
  generateWebhooks,
  publishingWebhooks,
  queueWebhooks,
  saveWebhooks,
  textWebhooks,
} from '../config/webhooks.js';
import { ApiError } from '../utils/apiError.js';
import { recordWebhookEvent } from './webhookAuditService.js';

const webhookUrl = (webhookName) =>
  `${env.n8nUrl.replace(/\/$/, '')}/webhook/${encodeURIComponent(webhookName)}`;

const parseJsonResponse = async (response) => {
  const text = await response.text();
  if (!text) return {};

  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
};

const requestJson = async ({ webhookName, url, method = 'GET', payload }) => {
  const startedAt = Date.now();

  let response;
  try {
    response = await fetch(url, {
      method,
      headers:
        method === 'POST'
          ? {
              'Content-Type': 'application/json',
            }
          : undefined,
      body: method === 'POST' ? JSON.stringify(payload) : undefined,
    });
  } catch (error) {
    await recordWebhookEvent({
      webhookName,
      endpoint: url,
      method,
      status: 'error',
      durationMs: Date.now() - startedAt,
      requestPayload: payload,
      errorMessage: error.message,
    });

    throw new ApiError(502, 'n8n webhook is not reachable', {
      webhookName,
      message: error.message,
    });
  }

  const data = await parseJsonResponse(response);
  const durationMs = Date.now() - startedAt;

  await recordWebhookEvent({
    webhookName,
    endpoint: url,
    method,
    status: response.ok ? 'success' : 'error',
    statusCode: response.status,
    durationMs,
    requestPayload: payload,
    responsePayload: data,
    errorMessage: response.ok ? undefined : 'n8n webhook request failed',
  });

  if (!response.ok) {
    throw new ApiError(response.status, 'n8n webhook request failed', data);
  }

  return data;
};

const postJson = async (webhookName, url, payload) =>
  requestJson({
    webhookName,
    url,
    method: 'POST',
    payload,
  });

const getJson = async (webhookName, url) =>
  requestJson({
    webhookName,
    url,
  });

const resolveCategory = (category, webhooks) => {
  const key = String(category || '').toLowerCase();
  const webhook = webhooks[key];

  if (!webhook) {
    throw new ApiError(400, `Unsupported category: ${category}`);
  }

  return {
    key,
    label: categoryLabels[key],
    webhook,
  };
};

export const fetchQueue = async (category) => {
  const { webhook } = resolveCategory(category, queueWebhooks);
  const data = await getJson(webhook, webhookUrl(webhook));
  return Array.isArray(data) ? data : data.laminas || [];
};

export const searchImages = async (payload) => {
  const webhook = fallbackWebhooks.searchImages;
  const data = await postJson(webhook, webhookUrl(webhook), payload);
  return Array.isArray(data) ? data : data.imagenes || data.images || [];
};

export const updateTexts = async (category, payload) => {
  const { label, webhook } = resolveCategory(category, textWebhooks);
  const webhookName = webhook || fallbackWebhooks.updateTexts;
  return postJson(webhookName, webhookUrl(webhookName), {
    ...payload,
    categoria: payload.categoria || label,
  });
};

export const saveLamina = async (category, payload) => {
  const { label, webhook } = resolveCategory(category, saveWebhooks);
  const webhookName = webhook || fallbackWebhooks.save;
  return postJson(webhookName, webhookUrl(webhookName), {
    ...payload,
    categoria: payload.categoria || label,
  });
};

export const generateLamina = async (format, payload) => {
  const webhook = generateWebhooks[format];
  if (!webhook) {
    throw new ApiError(400, `Unsupported lamina format: ${format}`);
  }

  const data = await postJson(webhook, webhookUrl(webhook), payload);
  return {
    url: data.url || data.webViewLink || data.webContentLink || '',
    raw: data,
  };
};

export const publishToSocial = async (network, payload) => {
  const webhook = publishingWebhooks[String(network || '').toLowerCase()];
  if (!webhook) {
    throw new ApiError(400, `Unsupported publishing network: ${network}`);
  }

  const data = await postJson(webhook, webhookUrl(webhook), payload);
  return {
    ok: data.ok ?? true,
    message: data.message || data.mensaje || '',
    raw: data,
  };
};

export const downloadLaminas = async (payload) => {
  const webhook = fallbackWebhooks.download;
  const data = await postJson(webhook, webhookUrl(webhook), payload);
  return {
    url916: data.url916 || data.url_916 || data.url916_vertical || '',
    url340: data.url340 || data.url_340 || data.url340_horizontal || '',
    raw: data,
  };
};

export const uploadAsset = async (payload) => {
  const data = await postJson('hostinger-upload', env.hostingerUploadUrl, payload);
  return {
    ok: data.ok ?? true,
    url: data.url || data.imageUrl || data.path || '',
    raw: data,
  };
};
