import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';

export const signAccessToken = (client) =>
  jwt.sign(
    {
      sub: client.id,
      email: client.email,
      role: client.role,
    },
    env.jwtAccessSecret,
    { expiresIn: env.jwtAccessExpiresIn },
  );

export const signRefreshToken = ({ clientId, sessionId }) =>
  jwt.sign(
    {
      sub: clientId,
      sid: sessionId,
    },
    env.jwtRefreshSecret,
    { expiresIn: env.jwtRefreshExpiresIn },
  );

export const verifyAccessToken = (token) =>
  jwt.verify(token, env.jwtAccessSecret);

export const verifyRefreshToken = (token) =>
  jwt.verify(token, env.jwtRefreshSecret);
