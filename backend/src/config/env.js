import dotenv from 'dotenv';

dotenv.config();

const REQUIRED = ['DATABASE_URL', 'JWT_SECRET'];

for (const key of REQUIRED) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  host: process.env.HOST ?? '0.0.0.0',
  port: Number(process.env.PORT ?? 4000),
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '15m',
  jwtIssuer: process.env.JWT_ISSUER ?? 'cybermart-api',
  jwtAudience: process.env.JWT_AUDIENCE ?? 'cybermart-users'
};
