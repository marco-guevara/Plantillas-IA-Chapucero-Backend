import cookieParser from 'cookie-parser';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { corsMiddleware } from './config/cors.js';
import { env, isProduction } from './config/env.js';
import { csrfMiddleware } from './middlewares/csrfMiddleware.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import { notFoundMiddleware } from './middlewares/notFoundMiddleware.js';
import { globalRateLimit } from './middlewares/rateLimitMiddleware.js';
import { routes } from './routes/index.js';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.set('trust proxy', env.trustProxy ? 1 : false);
  app.use(helmet());
  app.use(corsMiddleware);
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));
  app.use(cookieParser());
  app.use('/api', globalRateLimit);
  app.use('/api', csrfMiddleware);
  app.use(morgan(isProduction ? 'combined' : 'dev'));

  app.get('/', (_req, res) => {
    res.json({
      ok: true,
      service: 'laminas-ia-2026-backend',
      environment: env.nodeEnv,
    });
  });

  app.use('/api', routes);
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
