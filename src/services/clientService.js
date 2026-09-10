import { Client } from '../models/index.js';

export const publicClient = (client) => ({
  id: client.id,
  email: client.email,
  name: client.name,
  role: client.role,
  status: client.status,
  lastLoginAt: client.lastLoginAt,
});

export const findActiveClientByEmail = (email) =>
  Client.findOne({
    where: {
      email: String(email || '').trim().toLowerCase(),
      status: 'active',
    },
  });

export const findActiveClientById = (id) =>
  Client.findOne({
    where: {
      id,
      status: 'active',
    },
  });
