import 'fastify';
import type { Pool } from 'pg';

declare module 'fastify' {
  interface FastifyInstance {
    db: Pool;
    config: {
      nodeEnv: string;
      host: string;
      port: number;
      databaseUrl: string;
      jwtSecret: string;
      jwtExpiresIn: string;
      jwtIssuer: string;
      jwtAudience: string;
    };
  }

  interface FastifyRequest {
    user?: {
      sub: string;
      email: string;
      role: 'buyer' | 'developer' | 'admin';
    };
  }
}
