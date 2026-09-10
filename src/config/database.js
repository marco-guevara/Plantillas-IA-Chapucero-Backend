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
