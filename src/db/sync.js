import { sequelize } from '../models/index.js';

const syncDatabase = async () => {
  await sequelize.sync({ alter: false });
  console.log('Database models synced');
  await sequelize.close();
};

syncDatabase().catch(async (error) => {
  console.error('Failed to sync database', error);
  await sequelize.close();
  process.exit(1);
});
