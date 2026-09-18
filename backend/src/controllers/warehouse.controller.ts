import { Request, Response, NextFunction } from 'express';
import { WarehouseService } from '../services/warehouse.service.js';
import { sendSuccess } from '../helpers/response.helper.js';
import { warehouseSchema } from '../validators/warehouse.validator.js';
import { parsePagination } from '../helpers/pagination.helper.js';

export class WarehouseController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req);
      const result = await WarehouseService.list(params);
      sendSuccess(res, result.data, result.meta);
    } catch (err) { next(err); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await WarehouseService.getById(req.params.id as string);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = warehouseSchema.parse(req.body);
      const result = await WarehouseService.create(data, req.user!.userId);
      sendSuccess(res, result, undefined, 201);
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = warehouseSchema.partial().parse(req.body);
      const result = await WarehouseService.update(req.params.id as string, data, req.user!.userId);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await WarehouseService.remove(req.params.id as string, req.user!.userId);
      sendSuccess(res, { message: 'Berhasil dihapus' });
    } catch (err) { next(err); }
  }
}
