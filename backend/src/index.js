import Fastify from 'fastify';
import sensible from '@fastify/sensible';

import { env } from './config/env.js';
import { registerErrorHandler } from './middlewares/error.middleware.js';
import dbPlugin from './plugins/db.plugin.js';
import jwtPlugin from './plugins/jwt.plugin.js';
import v1Routes from './routes/v1/index.routes.js';

export function buildApp() {
  const app = Fastify({
    logger: {
      level: env.nodeEnv === 'production' ? 'info' : 'debug'
    }
  });

  app.decorate('config', env);

  app.register(sensible);
  app.register(dbPlugin);
  app.register(jwtPlugin);

  app.register(v1Routes, { prefix: '/api/v1' });

  registerErrorHandler(app);

  return app;
}
