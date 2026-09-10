import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';

import { ClientSession } from '../models/index.js';
import { ApiError } from '../utils/apiError.js';
import { findActiveClientByEmail, publicClient } from './clientService.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from './jwtService.js';
import { verifyPassword } from './passwordService.js';

const refreshTokenTtlMs = 7 * 24 * 60 * 60 * 1000;

export const loginClient = async ({ email, password, userAgent, ipAddress }) => {
  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const client = await findActiveClientByEmail(email);
  if (!client) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const passwordIsValid = await verifyPassword(password, client.passwordHash);
  if (!passwordIsValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const sessionId = crypto.randomUUID();
  const refreshToken = signRefreshToken({ clientId: client.id, sessionId });
  const refreshTokenHash = await bcrypt.hash(refreshToken, 12);

  await ClientSession.create({
    id: sessionId,
    clientId: client.id,
    refreshTokenHash,
    userAgent,
    ipAddress,
    expiresAt: new Date(Date.now() + refreshTokenTtlMs),
  });

  await client.update({ lastLoginAt: new Date() });

  return {
    client: publicClient(client),
    accessToken: signAccessToken(client),
    refreshToken,
  };
};

export const logoutClient = async (refreshToken) => {
  if (!refreshToken) return;

  try {
    const payload = verifyRefreshToken(refreshToken);
    await ClientSession.update(
      { revokedAt: new Date() },
      { where: { id: payload.sid, clientId: payload.sub, revokedAt: null } },
    );
  } catch {
    // Logout must be idempotent even when the cookie is already expired.
  }
};

export const refreshClientSession = async (refreshToken) => {
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token required');
  }

  const payload = verifyRefreshToken(refreshToken);
  const session = await ClientSession.findOne({
    where: {
      id: payload.sid,
      clientId: payload.sub,
      revokedAt: null,
    },
    include: ['client'],
  });

  if (!session || session.expiresAt <= new Date()) {
    throw new ApiError(401, 'Refresh token expired');
  }

  const tokenMatches = await bcrypt.compare(refreshToken, session.refreshTokenHash);
  if (!tokenMatches || session.client.status !== 'active') {
    throw new ApiError(401, 'Refresh token invalid');
  }

  return {
    client: publicClient(session.client),
    accessToken: signAccessToken(session.client),
    refreshToken,
  };
};
