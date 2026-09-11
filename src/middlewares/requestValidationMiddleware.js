import { ApiError } from '../utils/apiError.js';

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isPlainObject = (value) =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

const fail = (details) => {
  throw new ApiError(400, 'Invalid request', details);
};

export const requireBodyObject = (req, _res, next) => {
  try {
    if (!isPlainObject(req.body)) {
      fail([{ field: 'body', message: 'JSON object body is required' }]);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateLoginBody = (req, _res, next) => {
  try {
    const errors = [];

    if (!req.body?.email || typeof req.body.email !== 'string') {
      errors.push({ field: 'email', message: 'Email is required' });
    }

    if (!req.body?.password || typeof req.body.password !== 'string') {
      errors.push({ field: 'password', message: 'Password is required' });
    }

    if (errors.length) fail(errors);

    next();
  } catch (error) {
    next(error);
  }
};

export const validateCategoryParam = (req, _res, next) => {
  try {
    const category = String(req.params.category || '').toLowerCase();
    if (!['lps', 'lpm', 'lm', 'li'].includes(category)) {
      fail([{ field: 'category', message: 'Unsupported category' }]);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateFormatParam = (req, _res, next) => {
  try {
    if (!['916', '340'].includes(String(req.params.format || ''))) {
      fail([{ field: 'format', message: 'Unsupported lamina format' }]);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateNetworkParam = (req, _res, next) => {
  try {
    const network = String(req.params.network || '').toLowerCase();
    if (!['facebook', 'instagram', 'x'].includes(network)) {
      fail([{ field: 'network', message: 'Unsupported publishing network' }]);
    }

    next();
  } catch (error) {
    next(error);
  }
};

export const validateUuidParam =
  (paramName = 'id') =>
  (req, _res, next) => {
    try {
      if (!uuidPattern.test(String(req.params[paramName] || ''))) {
        fail([{ field: paramName, message: 'Valid UUID is required' }]);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
