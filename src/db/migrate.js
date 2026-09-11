import { sequelize } from '../models/index.js';
import {
  ensureMigrationsTable,
  getMigrationStatus,
  runMigration,
} from './migrationService.js';

const migrate = async () => {
  await sequelize.authenticate();
  await ensureMigrationsTable();
  const { pending } = await getMigrationStatus();

  if (!pending.length) {
    console.log('No pending migrations');
    return;
  }

  for (const filename of pending) {
    console.log(`Running migration: ${filename}`);
    await runMigration(filename);
  }

  console.log(`Migrations complete: ${pending.length} applied`);
};

migrate().catch(async (error) => {
  console.error('Failed to run migrations', error);
  process.exitCode = 1;
}).finally(async () => {
  await sequelize.close();
});
