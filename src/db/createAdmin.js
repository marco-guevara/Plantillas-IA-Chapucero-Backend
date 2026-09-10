import dotenv from 'dotenv';

import { Client, sequelize } from '../models/index.js';
import { hashPassword } from '../services/passwordService.js';

dotenv.config();

const createAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME || 'Administrador';

  if (!email || !password || password.length < 12) {
    throw new Error(
      'ADMIN_EMAIL and ADMIN_PASSWORD with at least 12 characters are required',
    );
  }

  const [client, created] = await Client.findOrCreate({
    where: { email: email.trim().toLowerCase() },
    defaults: {
      email: email.trim().toLowerCase(),
      passwordHash: await hashPassword(password),
      name,
      role: 'admin',
      status: 'active',
    },
  });

  if (!created) {
    await client.update({
      passwordHash: await hashPassword(password),
      name,
      role: 'admin',
      status: 'active',
    });
  }

  console.log(`${created ? 'Created' : 'Updated'} admin client: ${client.email}`);
  await sequelize.close();
};

createAdmin().catch(async (error) => {
  console.error('Failed to create admin client', error);
  await sequelize.close();
  process.exit(1);
});
