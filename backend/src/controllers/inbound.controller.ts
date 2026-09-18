import { Request, Response, NextFunction } from 'express';
import { InboundService } from '../services/inbound.service.js';
import { sendSuccess } from '../helpers/response.helper.js';
import { createGrnSchema } from '../validators/inbound.validator.js';
import { parsePagination } from '../helpers/pagination.helper.js';

export class InboundController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req);
      const status = req.query.status as string | undefined;
      const result = await InboundService.listGrn({ ...params, status });
      sendSuccess(res, result.data, result.meta);
    } catch (err) { next(err); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InboundService.getGrnById(req.params.id as string);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createGrnSchema.parse(req.body);
      const result = await InboundService.createGrn(data, req.user!.userId);
      sendSuccess(res, result, undefined, 201);
    } catch (err) { next(err); }
  }

  static async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await InboundService.confirmGrn(req.params.id as string, req.user!.userId);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      await InboundService.cancelGrn(req.params.id as string, req.user!.userId);
      sendSuccess(res, { message: 'GRN berhasil dibatalkan' });
    } catch (err) { next(err); }
  }
}
