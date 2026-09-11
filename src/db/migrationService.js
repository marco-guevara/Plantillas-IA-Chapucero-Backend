import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { sequelize } from '../models/index.js';

const currentFile = fileURLToPath(import.meta.url);
const migrationsDir = path.join(path.dirname(currentFile), 'migrations');

export const ensureMigrationsTable = async () => {
  await sequelize.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) NOT NULL UNIQUE,
      executed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
    );
  `);
};

export const getMigrationFiles = async () => {
  const entries = await fs.readdir(migrationsDir, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b));
};

export const getExecutedMigrations = async () => {
  const [rows] = await sequelize.query(
    'SELECT filename FROM schema_migrations ORDER BY filename ASC;',
  );

  return rows.map((row) => row.filename);
};

export const hasMigrationsTable = async () => {
  const [rows] = await sequelize.query(`
    SELECT COUNT(*)::int AS count
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 'schema_migrations';
  `);

  return rows[0]?.count > 0;
};

export const runMigration = async (filename) => {
  const filePath = path.join(migrationsDir, filename);
  const sql = await fs.readFile(filePath, 'utf8');

  await sequelize.transaction(async (transaction) => {
    await sequelize.query(sql, { transaction });
    await sequelize.query(
      'INSERT INTO schema_migrations (filename) VALUES (:filename);',
      {
        replacements: { filename },
        transaction,
      },
    );
  });
};

export const getMigrationStatus = async () => {
  const tableReady = await hasMigrationsTable();
  const files = await getMigrationFiles();
  const executed = tableReady ? await getExecutedMigrations() : [];
  const executedSet = new Set(executed);
  const pending = files.filter((filename) => !executedSet.has(filename));

  return {
    tableReady,
    applied: executed,
    pending,
    ok: pending.length === 0,
  };
};
