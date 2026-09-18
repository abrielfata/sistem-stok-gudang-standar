import { Response } from 'express';

export interface PaginationMeta {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(res: Response, data: T, meta?: PaginationMeta, statusCode: number = 200) {
  return res.status(statusCode).json({
    success: true,
    data,
    ...(meta ? { meta } : {}),
  });
}

export function sendError(
  res: Response,
  message: string,
  statusCode: number = 500,
  code: string = 'ERROR',
  details: unknown = null
) {
  return res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      details,
    },
  });
}
