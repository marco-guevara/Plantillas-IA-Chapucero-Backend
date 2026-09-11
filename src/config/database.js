import { Sequelize } from 'sequelize';

import { env } from './env.js';

export const sequelize = new Sequelize(env.databaseUrl, {
  dialect: 'postgres',
  logging: env.dbLogging ? console.log : false,
  dialectOptions: env.databaseSsl
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
      }
    : {},
});

export const connectDatabase = async () => {
  await sequelize.authenticate();
};

export const checkDatabase = async () => {
  try {
    await sequelize.authenticate();
    return {
      ok: true,
      required: env.databaseRequired,
    };
  } catch (error) {
    return {
      ok: false,
      required: env.databaseRequired,
      error: error.message,
    };
  }
};
