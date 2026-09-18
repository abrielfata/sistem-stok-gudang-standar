import { Request, Response, NextFunction } from 'express';
import { OutboundService } from '../services/outbound.service.js';
import { sendSuccess } from '../helpers/response.helper.js';
import { createSoSchema } from '../validators/outbound.validator.js';
import { parsePagination } from '../helpers/pagination.helper.js';

export class OutboundController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req);
      const status = req.query.status as string | undefined;
      const result = await OutboundService.listSo({ ...params, status });
      sendSuccess(res, result.data, result.meta);
    } catch (err) { next(err); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OutboundService.getSoById(req.params.id as string);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = createSoSchema.parse(req.body);
      const result = await OutboundService.createSo(data, req.user!.userId);
      sendSuccess(res, result, undefined, 201);
    } catch (err) { next(err); }
  }

  static async confirm(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await OutboundService.confirmSo(req.params.id as string, req.user!.userId);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  static async cancel(req: Request, res: Response, next: NextFunction) {
    try {
      await OutboundService.cancelSo(req.params.id as string, req.user!.userId);
      sendSuccess(res, { message: 'SO berhasil dibatalkan' });
    } catch (err) { next(err); }
  }
}
