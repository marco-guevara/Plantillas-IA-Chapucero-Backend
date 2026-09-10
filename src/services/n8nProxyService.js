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

const postJson = async (url, payload) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonResponse(response);
  if (!response.ok) {
    throw new ApiError(response.status, 'n8n webhook request failed', data);
  }

  return data;
};

const getJson = async (url) => {
  const response = await fetch(url);
  const data = await parseJsonResponse(response);

  if (!response.ok) {
    throw new ApiError(response.status, 'n8n webhook request failed', data);
  }

  return data;
};

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
  const data = await getJson(webhookUrl(webhook));
  return Array.isArray(data) ? data : data.laminas || [];
};

export const searchImages = async (payload) => {
  const data = await postJson(webhookUrl(fallbackWebhooks.searchImages), payload);
  return Array.isArray(data) ? data : data.imagenes || data.images || [];
};

export const updateTexts = async (category, payload) => {
  const { label, webhook } = resolveCategory(category, textWebhooks);
  return postJson(webhookUrl(webhook || fallbackWebhooks.updateTexts), {
    ...payload,
    categoria: payload.categoria || label,
  });
};

export const saveLamina = async (category, payload) => {
  const { label, webhook } = resolveCategory(category, saveWebhooks);
  return postJson(webhookUrl(webhook || fallbackWebhooks.save), {
    ...payload,
    categoria: payload.categoria || label,
  });
};

export const generateLamina = async (format, payload) => {
  const webhook = generateWebhooks[format];
  if (!webhook) {
    throw new ApiError(400, `Unsupported lamina format: ${format}`);
  }

  const data = await postJson(webhookUrl(webhook), payload);
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

  const data = await postJson(webhookUrl(webhook), payload);
  return {
    ok: data.ok ?? true,
    message: data.message || data.mensaje || '',
    raw: data,
  };
};

export const downloadLaminas = async (payload) => {
  const data = await postJson(webhookUrl(fallbackWebhooks.download), payload);
  return {
    url916: data.url916 || data.url_916 || data.url916_vertical || '',
    url340: data.url340 || data.url_340 || data.url340_horizontal || '',
    raw: data,
  };
};

export const uploadAsset = async (payload) => {
  const data = await postJson(env.hostingerUploadUrl, payload);
  return {
    ok: data.ok ?? true,
    url: data.url || data.imageUrl || data.path || '',
    raw: data,
  };
};
