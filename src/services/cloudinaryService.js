import { v2 as cloudinary } from 'cloudinary';

import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

let configured = false;

const isConfigured = () =>
  Boolean(
    env.cloudinaryCloudName && env.cloudinaryApiKey && env.cloudinaryApiSecret,
  );

const ensureConfigured = () => {
  if (!isConfigured()) {
    throw new ApiError(503, 'Cloudinary no esta configurado');
  }

  if (configured) return;

  cloudinary.config({
    cloud_name: env.cloudinaryCloudName,
    api_key: env.cloudinaryApiKey,
    api_secret: env.cloudinaryApiSecret,
    secure: true,
  });
  configured = true;
};

export const uploadAsset = async (input, { folder } = {}) => {
  ensureConfigured();

  if (typeof input !== 'string' || !input.trim()) {
    throw new ApiError(400, 'Image is required');
  }

  try {
    const result = await cloudinary.uploader.upload(input, {
      folder,
      resource_type: 'image',
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
    };
  } catch (error) {
    throw new ApiError(502, 'Cloudinary upload failed', {
      message: error.message,
    });
  }
};
