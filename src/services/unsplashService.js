import { env } from '../config/env.js';

const isConfigured = () => Boolean(env.unsplashAccessKey);

export const searchUnsplashImages = async (query) => {
  if (!isConfigured()) return [];

  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  // 30 es el maximo por pagina que permite la API de Unsplash.
  url.searchParams.set('per_page', '30');

  const response = await fetch(url, {
    headers: {
      Authorization: `Client-ID ${env.unsplashAccessKey}`,
    },
  });

  if (!response.ok) {
    return [];
  }

  const data = await response.json();
  const results = Array.isArray(data.results) ? data.results : [];

  return results
    .map((item) => ({
      original: item.urls?.regular || '',
      thumbnail: item.urls?.thumb || item.urls?.small || '',
      width: item.width || null,
      height: item.height || null,
    }))
    .filter((image) => image.original);
};
