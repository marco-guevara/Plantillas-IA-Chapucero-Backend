import { env } from '../config/env.js';

const isConfigured = () => Boolean(env.serperApiKey);

export const searchSerperImages = async (query) => {
  if (!isConfigured()) return [];

  const response = await fetch('https://google.serper.dev/images', {
    method: 'POST',
    headers: {
      'X-API-KEY': env.serperApiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ q: query }),
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const items = Array.isArray(data.images) ? data.images : [];

  return items
    .map((item) => ({
      original: item.imageUrl || '',
      thumbnail: item.thumbnailUrl || item.imageUrl || '',
    }))
    .filter((image) => image.original);
};
