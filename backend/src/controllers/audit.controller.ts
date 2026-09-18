import { Request, Response, NextFunction } from 'express';
import { AuditService } from '../services/audit.service.js';
import { sendSuccess } from '../helpers/response.helper.js';
import { parsePagination } from '../helpers/pagination.helper.js';

export class AuditController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req);
      const result = await AuditService.list(params);
      sendSuccess(res, result.data, result.meta);
    } catch (err) { next(err); }
  }
}
