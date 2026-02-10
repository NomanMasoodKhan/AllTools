import Fastify from 'fastify';
import cors from '@fastify/cors';
import sensible from '@fastify/sensible';

import { config } from './config.js';
import dbPlugin from './plugins/db.js';
import authPlugin from './plugins/auth.js';
import healthRoutes from './routes/health.js';
import categoryRoutes from './routes/categories.js';
import toolRoutes from './routes/tools.js';

export function buildApp() {
  const app = Fastify({ logger: true });

  app.decorate('config', config);

  app.register(cors, { origin: true });
  app.register(sensible);
  app.register(dbPlugin);
  app.register(authPlugin);

  app.register(healthRoutes, { prefix: '/api/v1' });
  app.register(categoryRoutes, { prefix: '/api/v1' });
  app.register(toolRoutes, { prefix: '/api/v1' });

  return app;
}
