import { Request, Response, NextFunction } from 'express';
import { UomService } from '../services/uom.service.js';
import { sendSuccess } from '../helpers/response.helper.js';
import { uomSchema } from '../validators/uom.validator.js';
import { parsePagination } from '../helpers/pagination.helper.js';

export class UomController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req);
      const result = await UomService.list(params);
      sendSuccess(res, result.data, result.meta);
    } catch (err) { next(err); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await UomService.getById(req.params.id as string);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = uomSchema.parse(req.body);
      const result = await UomService.create(data, req.user!.userId);
      sendSuccess(res, result, undefined, 201);
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = uomSchema.partial().parse(req.body);
      const result = await UomService.update(req.params.id as string, data, req.user!.userId);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await UomService.remove(req.params.id as string, req.user!.userId);
      sendSuccess(res, { message: 'Berhasil dihapus' });
    } catch (err) { next(err); }
  }
}
