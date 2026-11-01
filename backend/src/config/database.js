import { Sequelize } from 'sequelize';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let sequelizeInstance = null;
let isConnected = false;

try {
  sequelizeInstance = new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
    host: env.DB_HOST,
    port: env.DB_PORT,
    dialect: env.DB_DIALECT,
    logging: env.NODE_ENV === 'development' ? false : false,
    pool: {
      max: env.DB_POOL_MAX,
      min: env.DB_POOL_MIN,
      acquire: env.DB_POOL_ACQUIRE,
      idle: env.DB_POOL_IDLE,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: true,
    },
  });
} catch (err) {
  logger.warn('Sequelize initialization notice:', err.message);
}

export const sequelize = sequelizeInstance;

export async function connectDatabase() {
  if (!sequelize) {
    logger.warn('Database driver not initialized. Running in resilient in-memory mode.');
    isConnected = false;
    return false;
  }

  try {
    await sequelize.authenticate();
    isConnected = true;
    logger.success(`MySQL Database connected successfully to ${env.DB_HOST}:${env.DB_PORT}/${env.DB_NAME}`);
    return true;
  } catch (error) {
    isConnected = false;
    logger.warn(`MySQL connection unavailable (${error.message}). Falling back to resilient in-memory storage engine.`);
    return false;
  }
}

export function isDbConnected() {
  return isConnected;
}

