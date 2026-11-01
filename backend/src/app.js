import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { swaggerSpec } from './config/swagger.js';
import { securityHeaders, apiRateLimiter } from './middleware/security.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';
import { ApiResponse } from './utils/response.js';

export function createApp() {
  const app = express();

  // Security Headers
  app.use(securityHeaders);

  // Cross-Origin Resource Sharing (CORS) with Credentials
  app.use(
    cors({
      origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Rate Limiting
  app.use('/api', apiRateLimiter);

  // Request Parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Swagger UI Interactive API Explorer
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'KBN Traders API Documentation',
  }));

  // Mount API Endpoints
  app.use('/api', apiRouter);

  // 404 Handler for undefined API routes
  app.use('/api/*', (req, res) => {
    ApiResponse.notFound(res, `Route '${req.originalUrl}' does not exist on this server.`);
  });

  // Global Error Handler Middleware
  app.use(errorHandler);

  return app;
}

