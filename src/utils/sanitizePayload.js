const dataUrlPattern = /^data:[^;]+;base64,/;
const sensitiveKeys = new Set([
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'authorization',
]);
const mediaKeys = new Set(['image', 'imageBase64', 'base64']);

const summarizeString = (value) => {
  if (dataUrlPattern.test(value)) {
    return `[data-url length=${value.length}]`;
  }

  if (value.length > 2000) {
    return `${value.slice(0, 2000)}...[truncated length=${value.length}]`;
  }

  return value;
};

export const sanitizePayload = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizePayload(item));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => {
        if (sensitiveKeys.has(key)) {
          return [key, '[redacted]'];
        }

        if (mediaKeys.has(key) && typeof item === 'string') {
          return [key, summarizeString(item)];
        }

        return [key, sanitizePayload(item)];
      }),
    );
  }

  if (typeof value === 'string') {
    return summarizeString(value);
  }

  return value;
};
