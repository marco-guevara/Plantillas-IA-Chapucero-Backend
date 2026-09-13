import { GoogleGenAI, Type } from '@google/genai';

import { env } from '../../config/env.js';
import { ApiError } from '../../utils/apiError.js';

let client;

const getClient = () => {
  if (!env.geminiApiKey) {
    throw new ApiError(503, 'Gemini no está configurado');
  }

  if (!client) {
    client = new GoogleGenAI({ apiKey: env.geminiApiKey });
  }

  return client;
};

const DRAFT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    titulo: {
      type: Type.STRING,
      description:
        'Titular tipo portada de periodico, en espanol, MAXIMO 5 palabras y 32 caracteres. NO es una oracion completa, es un titular corto y contundente (ej. "NUEVA CICLOVIA EN EL CENTRO", no "Anuncian la construccion de una nueva ciclovia..."). Sin comillas, sin punto final.',
    },
    cuerpo: {
      type: Type.STRING,
      description:
        'Una frase breve (MAXIMO 120 caracteres) que amplia el titulo con un dato o detalle concreto, en espanol. No repite literalmente el titulo. Sin comillas.',
    },
    post: {
      type: Type.STRING,
      description:
        'Texto corto para publicar en redes sociales, en espanol, sin hashtags dentro (van aparte).',
    },
    hashtags: {
      type: Type.STRING,
      description:
        'MINIMO 5 hashtags relevantes separados por espacio, cada uno empezando con #.',
    },
  },
  required: ['titulo', 'cuerpo', 'post', 'hashtags'],
};

const buildReferenceBlock = (referenceLaminas) => {
  const examples = referenceLaminas
    .map((lamina) => {
      const payload = lamina.payload || {};
      const titulo = payload.titulo || lamina.title || '';
      const hashtags = payload.hashtags || '';
      if (!titulo && !hashtags) return null;
      return `- Titulo: "${titulo}" | Hashtags: "${hashtags}"`;
    })
    .filter(Boolean)
    .join('\n');

  if (!examples) return '';

  return `Estas son publicaciones anteriores del mismo cliente, para igualar su estilo y tono:\n${examples}`;
};

const buildPrompt = ({ prompt, referenceLaminas }) => {
  return [
    'Eres un asistente que redacta contenido para laminas de redes sociales (una tarjeta con foto y titular, para Instagram/Facebook/X).',
    'Responde siempre en espanol, con tono editorial e informativo, claro y directo, sin groserias ni relleno.',
    buildReferenceBlock(referenceLaminas),
    `Genera el contenido para esta idea del usuario: "${prompt}"`,
  ]
    .filter(Boolean)
    .join('\n\n');
};

export const generateLaminaDraft = async ({ prompt, referenceLaminas = [] }) => {
  const ai = getClient();

  let response;
  try {
    response = await ai.models.generateContent({
      model: env.geminiModel,
      contents: buildPrompt({ prompt, referenceLaminas }),
      config: {
        responseMimeType: 'application/json',
        responseSchema: DRAFT_SCHEMA,
      },
    });
  } catch (error) {
    throw new ApiError(502, 'Gemini no pudo generar el contenido', {
      message: error.message,
    });
  }

  try {
    return JSON.parse(response.text);
  } catch {
    throw new ApiError(502, 'Gemini devolvió una respuesta inválida');
  }
};
