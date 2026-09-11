import { Client, ClientSession } from '../models/index.js';
import { ApiError } from '../utils/apiError.js';
import { hashPassword } from './passwordService.js';

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

export const listClients = async () => {
  const clients = await Client.findAll({
    order: [['createdAt', 'DESC']],
  });

  return clients.map(publicClient);
};

export const createClient = async ({ email, password, name, role = 'editor' }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const existing = await Client.findOne({ where: { email: normalizedEmail } });

  if (existing) {
    throw new ApiError(409, 'Client email already exists');
  }

  const client = await Client.create({
    email: normalizedEmail,
    passwordHash: await hashPassword(password),
    name: String(name || '').trim(),
    role,
    status: 'active',
  });

  return publicClient(client);
};

const countActiveAdmins = () =>
  Client.count({
    where: {
      role: 'admin',
      status: 'active',
    },
  });

const assertCanChangeAdminAccess = async ({ client, role, status }) => {
  const removesAdminRole = role !== undefined && role !== 'admin';
  const disablesClient = status === 'disabled';

  if (client.role !== 'admin' || (!removesAdminRole && !disablesClient)) {
    return;
  }

  const activeAdmins = await countActiveAdmins();
  if (activeAdmins <= 1) {
    throw new ApiError(400, 'At least one active admin is required');
  }
};

const revokeClientSessions = async (clientId) => {
  const [revokedCount] = await ClientSession.update(
    { revokedAt: new Date() },
    {
      where: {
        clientId,
        revokedAt: null,
      },
    },
  );

  return revokedCount;
};

export const updateClient = async ({ id, name, role, status, password }) => {
  const client = await Client.findByPk(id);

  if (!client) {
    throw new ApiError(404, 'Client not found');
  }

  await assertCanChangeAdminAccess({ client, role, status });

  const updates = {};
  const shouldRevokeSessions = Boolean(password) || status === 'disabled';

  if (name !== undefined) updates.name = String(name).trim();
  if (role !== undefined) updates.role = role;
  if (status !== undefined) updates.status = status;
  if (password !== undefined) updates.passwordHash = await hashPassword(password);

  await client.update(updates);

  const revokedSessions = shouldRevokeSessions
    ? await revokeClientSessions(client.id)
    : 0;

  return {
    client: publicClient(client),
    revokedSessions,
  };
};
