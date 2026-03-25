// src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const DEV_SERVER_URL = process.env.DEV_SERVER_URL || 'http://localhost:3000';
const PROD_SERVER_URL = process.env.PROD_SERVER_URL;

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Documentation',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'herynnantenaina@gmail.com',
      },
    },
    servers: [
      {
        url: DEV_SERVER_URL,
        description: 'Development server',
      },
      {
        url: PROD_SERVER_URL,
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts', './src/*.ts'], // Chemins vers les annotations
};

const specs = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'Swagger API Docs',
  }));
};