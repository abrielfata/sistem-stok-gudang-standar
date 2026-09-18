import { Request } from 'express';

export interface PaginationParams {
  page: number;
  perPage: number;
  search?: string;
  sort?: string;
  order: 'asc' | 'desc';
}

export function parsePagination(req: Request): PaginationParams {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const perPage = Math.min(100, Math.max(1, parseInt(req.query.perPage as string) || 10));
  const search = req.query.search as string | undefined;
  const sort = req.query.sort as string | undefined;
  const order = req.query.order === 'desc' ? 'desc' : 'asc';
  
  return { page, perPage, search, sort, order };
}
