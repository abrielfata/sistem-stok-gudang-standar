import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import { logger } from '../config/logger.js';
import { sendError } from '../helpers/response.helper.js';

export function errorMiddleware(err: Error, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ZodError) {
    const details = err.issues.map((e: any) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    logger.warn({ req, err: details }, 'Validation Error');
    return sendError(res, 'Validasi gagal', 400, 'VALIDATION_ERROR', details);
  }

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      logger.error({ req, err }, `AppError: ${err.message}`);
    } else {
      logger.warn({ req, err }, `AppError: ${err.message}`);
    }
    return sendError(res, err.message, err.statusCode, err.code, err.details);
  }

  // Handle generic JWT Error
  if (err.name === 'TokenExpiredError') {
    return sendError(res, 'Sesi Anda telah berakhir, silakan login ulang', 401, 'TOKEN_EXPIRED');
  }
  if (err.name === 'JsonWebTokenError') {
    return sendError(res, 'Token tidak valid', 401, 'INVALID_TOKEN');
  }

  // Fallback 500
  logger.error({ req, err }, 'Unhandled Internal Server Error');
  return sendError(res, 'Terjadi kesalahan pada server', 500, 'INTERNAL_SERVER_ERROR');
}
