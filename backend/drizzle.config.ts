import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema/index.ts',
  out: './drizzle',
  dbCredentials: {
    // Migration WAJIB pakai DIRECT endpoint (tanpa -pooler)
    url: process.env.DATABASE_URL_DIRECT || process.env.DATABASE_URL || '',
  },
});
