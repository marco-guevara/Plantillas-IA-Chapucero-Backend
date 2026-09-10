import { createApp } from './app.js';
import { connectDatabase } from './config/database.js';
import { assertProductionSecrets, env } from './config/env.js';

const startServer = async () => {
  assertProductionSecrets();

  try {
    await connectDatabase();
    console.log('Database connection ready');
  } catch (error) {
    if (env.databaseRequired) {
      throw error;
    }

    console.warn('Database connection skipped:', error.message);
  }

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start API', error);
  process.exit(1);
});
