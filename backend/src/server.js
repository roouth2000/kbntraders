import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, sequelize } from './config/database.js';
import { syncDatabase } from './models/index.js';
import { initializeSeedData } from './services/seedService.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  logger.info(`Starting KBN Traders Backend API in [${env.NODE_ENV}] mode...`);

  // 1. Initialize Seed Data for in-memory resilience
  await initializeSeedData();
  logger.success('In-memory data store and demo accounts primed.');

  // 2. Connect Database (MySQL)
  const isConnected = await connectDatabase();
  if (isConnected) {
    await syncDatabase();
  }

  // 3. Initialize Express Application
  const app = createApp();

  // 4. Start HTTP Server
  const server = app.listen(env.PORT, () => {
    logger.success(`🚀 Server running on http://localhost:${env.PORT}`);
    logger.info(`📚 Swagger API Documentation: http://localhost:${env.PORT}/api/docs`);
    logger.info(`🩺 Health Check: http://localhost:${env.PORT}/api/health`);
  });

  // 5. Graceful Shutdown Handlers
  const shutdown = async (signal) => {
    logger.warn(`Received ${signal}. Gracefully terminating server...`);
    server.close(async () => {
      logger.info('HTTP server closed.');
      if (sequelize) {
        await sequelize.close();
        logger.info('Database connections closed.');
      }
      process.exit(0);
    });

    // Force exit after 10s if graceful fails
    setTimeout(() => {
      logger.error('Forcefully exiting server due to timeout.');
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal error during server bootstrap:', err);
  process.exit(1);
});

