import { sequelize } from '../models/index.js';
import { getMigrationStatus } from './migrationService.js';

const status = async () => {
  await sequelize.authenticate();
  const migrationStatus = await getMigrationStatus();

  console.log(JSON.stringify(migrationStatus, null, 2));
};

status().catch((error) => {
  console.error('Failed to read migration status', error);
  process.exitCode = 1;
}).finally(async () => {
  await sequelize.close();
});
