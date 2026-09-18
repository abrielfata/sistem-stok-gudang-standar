import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { errorMiddleware } from './middlewares/error.middleware.js';
import routes from './routes/index.js';

const app = express();

// 1. CORS Middleware (Placed first to handle preflight OPTIONS requests cleanly)
app.use(
  cors({
    origin: (requestOrigin, callback) => {
      // Allow non-browser requests (Postman, curl, server-to-server)
      if (!requestOrigin) return callback(null, true);

      if (!env.CORS_ORIGINS || env.CORS_ORIGINS === '*') {
        return callback(null, true);
      }

      const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) =>
        o.trim().replace(/\/+$/, '')
      );
      const cleanRequestOrigin = requestOrigin.trim().replace(/\/+$/, '');

      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(cleanRequestOrigin) ||
        cleanRequestOrigin.endsWith('.vercel.app')
      ) {
        return callback(null, true);
      }

      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  })
);

// 2. Security, Compression & Body Parsing
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(express.json());

// 3. pino-http logger
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const httpLogger = (pinoHttp as any).default ?? pinoHttp;
app.use(httpLogger({ logger }));

// 4. Mount Routes
app.use('/api/v1', routes);
app.use('/', routes); // Fallback alias if client omits /api/v1 prefix

// 5. Global Error Handler
app.use(errorMiddleware);

// Boot
app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});

