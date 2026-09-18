import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  
  // Neon Postgres
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid connection string (pooled)'),
  DATABASE_URL_DIRECT: z.string().url('DATABASE_URL_DIRECT must be a valid connection string (direct)'),
  
  // JWT
  JWT_SECRET: z.string().min(10, 'JWT_SECRET minimum 10 chars'),
  JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET minimum 10 chars'),
  
  // Security
  CORS_ORIGINS: z.string().default('*'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:\n', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
