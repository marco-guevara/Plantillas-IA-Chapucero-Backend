import { env } from '../config/env.js';
import { WebhookEvent } from '../models/index.js';
import { sanitizePayload } from '../utils/sanitizePayload.js';

export const recordWebhookEvent = async ({
  webhookName,
  endpoint,
  method,
  status,
  statusCode,
  durationMs,
  requestPayload,
  responsePayload,
  errorMessage,
}) => {
  if (!env.webhookAuditEnabled) return;

  try {
    await WebhookEvent.create({
      webhookName,
      endpoint,
      method,
      status,
      statusCode,
      durationMs,
      requestPayload: sanitizePayload(requestPayload),
      responsePayload: sanitizePayload(responsePayload),
      errorMessage,
    });
  } catch (error) {
    console.warn('Webhook audit skipped:', error.message);
  }
};
