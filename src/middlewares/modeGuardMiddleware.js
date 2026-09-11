import { ApiError } from '../utils/apiError.js';

export const requireStandaloneMode = (req, _res, next) => {
  if (req.auth?.client?.mode !== 'standalone') {
    next(new ApiError(403, 'This endpoint is only available for standalone clients'));
    return;
  }

  next();
};

export const requireN8nMode = (req, _res, next) => {
  if (req.auth && req.auth.client?.mode !== 'n8n') {
    next(new ApiError(403, 'This endpoint is not available for this client'));
    return;
  }

  next();
};
