import { findActiveClientById, publicClient } from '../services/clientService.js';
import { verifyAccessToken } from '../services/jwtService.js';
import { ApiError } from '../utils/apiError.js';
import { authCookieNames } from '../utils/cookies.js';

const readBearerToken = (authorization = '') => {
  const [type, token] = authorization.split(' ');
  return type?.toLowerCase() === 'bearer' ? token : undefined;
};

export const requireAuth = async (req, _res, next) => {
  try {
    const token =
      readBearerToken(req.headers.authorization) ||
      req.cookies?.[authCookieNames.access];

    if (!token) {
      throw new ApiError(401, 'Authentication required');
    }

    const payload = verifyAccessToken(token);
    const client = await findActiveClientById(payload.sub);

    if (!client) {
      throw new ApiError(401, 'Authentication required');
    }

    req.auth = {
      client,
      clientPublic: publicClient(client),
      tokenPayload: payload,
    };
    next();
  } catch (error) {
    next(error.statusCode ? error : new ApiError(401, 'Authentication required'));
  }
};

export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.auth?.client || !roles.includes(req.auth.client.role)) {
    next(new ApiError(403, 'Insufficient permissions'));
    return;
  }

  next();
};
