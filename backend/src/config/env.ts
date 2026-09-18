import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const isTest = process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST);

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3000),
  
  // Neon Postgres
  DATABASE_URL: z.string().default(
    isTest ? 'postgresql://postgres:postgres@localhost:5432/test_db?sslmode=disable' : ''
  ),
  DATABASE_URL_DIRECT: z.string().default(
    isTest ? 'postgresql://postgres:postgres@localhost:5432/test_db?sslmode=disable' : ''
  ),
  
  // JWT
  JWT_SECRET: z.string().min(10, 'JWT_SECRET minimum 10 chars').default(
    'test_jwt_secret_min_10_chars_long'
  ),
  JWT_REFRESH_SECRET: z.string().min(10, 'JWT_REFRESH_SECRET minimum 10 chars').default(
    'test_jwt_refresh_secret_min_10_chars_long'
  ),
  
  // Security
  CORS_ORIGINS: z.string().default('*'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:\n', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;
