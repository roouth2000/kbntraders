import swaggerJsdoc from 'swagger-jsdoc';
import { env } from './env.js';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'KBN Traders Finova API Documentation',
      version: '1.0.0',
      description: 'Comprehensive RESTful API for Produce Billing, Commission Agents, Customer Ledgers, and Real-Time Financial Reports.',
      contact: {
        name: 'KBN Traders Technical Support',
        email: 'support@kbntraders.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}/api`,
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token retrieved from /auth/login',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'],
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);

