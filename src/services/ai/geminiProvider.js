import { GoogleGenAI, Type } from '@google/genai';

import { env } from '../../config/env.js';
import { ApiError } from '../../utils/apiError.js';

let client;

const getClient = () => {
  if (!env.geminiApiKey) {
    throw new ApiError(503, 'Gemini no esta configurado');
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
        'Titulo corto y contundente para el formato vertical 9:16, en espanol, sin comillas.',
    },
    titulo34: {
      type: Type.STRING,
      description:
        'Variante del titulo para el formato 3:4, puede ser igual o levemente mas breve.',
    },
    postX: {
      type: Type.STRING,
      description:
        'Texto corto para publicar en X (Twitter), en espanol, sin hashtags dentro (van aparte).',
    },
    hashtags: {
      type: Type.STRING,
      description:
        'De 2 a 5 hashtags relevantes separados por espacio, cada uno empezando con #.',
    },
    imageQuery: {
      type: Type.STRING,
      description:
        'Terminos de busqueda cortos (nombre de una persona, lugar o evento concreto) para encontrar una foto real relacionada.',
    },
    gradientColor: {
      type: Type.STRING,
      description:
        'Un color hexadecimal (ej. #1f6feb) que combine con el tono del tema, para un fondo degradado.',
    },
  },
  required: [
    'titulo',
    'titulo34',
    'postX',
    'hashtags',
    'imageQuery',
    'gradientColor',
  ],
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
    throw new ApiError(502, 'Gemini devolvio una respuesta invalida');
  }
};
