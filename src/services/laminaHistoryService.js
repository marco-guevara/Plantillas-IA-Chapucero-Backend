import { Lamina, LaminaAsset, PublishJob } from '../models/index.js';
import { ApiError } from '../utils/apiError.js';

const getClientWhere = (clientId) => (clientId ? { clientId } : {});

const serializeLamina = (lamina) => ({
  id: lamina.id,
  legacyId: lamina.legacyId,
  category: lamina.category,
  originalUser: lamina.originalUser,
  title: lamina.title,
  status: lamina.status,
  url916: lamina.url916,
  url340: lamina.url340,
  metadata: lamina.metadata,
  createdAt: lamina.createdAt,
  updatedAt: lamina.updatedAt,
});

export const listLaminaHistory = async ({ clientId, limit = 50 }) => {
  const laminas = await Lamina.findAll({
    where: getClientWhere(clientId),
    order: [['updatedAt', 'DESC']],
    limit: Math.min(Number(limit) || 50, 100),
  });

  return laminas.map(serializeLamina);
};

export const getLaminaHistoryDetail = async ({ clientId, id }) => {
  const lamina = await Lamina.findOne({
    where: {
      id,
      ...getClientWhere(clientId),
    },
    include: [
      {
        model: LaminaAsset,
        as: 'assets',
        separate: true,
        order: [['createdAt', 'DESC']],
      },
      {
        model: PublishJob,
        as: 'publishJobs',
        separate: true,
        order: [['createdAt', 'DESC']],
      },
    ],
  });

  if (!lamina) {
    throw new ApiError(404, 'Lamina not found');
  }

  return {
    ...serializeLamina(lamina),
    payload: lamina.payload,
    assets: lamina.assets.map((asset) => ({
      id: asset.id,
      type: asset.type,
      sourceUrl: asset.sourceUrl,
      uploadedUrl: asset.uploadedUrl,
      metadata: asset.metadata,
      createdAt: asset.createdAt,
    })),
    publishJobs: lamina.publishJobs.map((job) => ({
      id: job.id,
      network: job.network,
      status: job.status,
      responsePayload: job.responsePayload,
      errorMessage: job.errorMessage,
      publishedAt: job.publishedAt,
      createdAt: job.createdAt,
    })),
  };
};
