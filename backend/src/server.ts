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

// Security, Compression & Parsing
app.use(helmet());
app.use(compression());
app.use(cors({ origin: env.CORS_ORIGINS === '*' ? '*' : env.CORS_ORIGINS.split(',') }));
app.use(express.json());

// pino-http export compat (ESM/CJS)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const httpLogger = (pinoHttp as any).default ?? pinoHttp;
app.use(httpLogger({ logger }));

// Mount Routes
app.use('/api/v1', routes);

// Global Error Handler
app.use(errorMiddleware);

// Boot
app.listen(env.PORT, () => {
  logger.info(`🚀 Server running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});
