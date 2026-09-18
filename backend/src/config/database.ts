import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
import { env } from './env.js';
import * as schema from '../db/schema/index.js';

// Setup WebSocket untuk Node.js environment (Dibutuhkan untuk transaksi database)
neonConfig.webSocketConstructor = ws;

// Primary connection pool (menggunakan pooled connection)
const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 10,
});

export const db = drizzle({ client: pool, schema });
