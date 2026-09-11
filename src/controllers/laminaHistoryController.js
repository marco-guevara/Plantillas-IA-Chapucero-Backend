import {
  getLaminaHistoryDetail,
  listLaminaHistory,
} from '../services/laminaHistoryService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const listHistory = asyncHandler(async (req, res) => {
  const laminas = await listLaminaHistory({
    clientId: req.auth?.client?.id,
    limit: req.query.limit,
  });

  res.json({ laminas });
});

export const getHistoryDetail = asyncHandler(async (req, res) => {
  const lamina = await getLaminaHistoryDetail({
    clientId: req.auth?.client?.id,
    id: req.params.id,
  });

  res.json({ lamina });
});
