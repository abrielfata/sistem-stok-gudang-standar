import { Request, Response, NextFunction } from 'express';
import { SupplierService } from '../services/supplier.service.js';
import { sendSuccess } from '../helpers/response.helper.js';
import { supplierSchema } from '../validators/supplier.validator.js';
import { parsePagination } from '../helpers/pagination.helper.js';

export class SupplierController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req);
      const result = await SupplierService.list(params);
      sendSuccess(res, result.data, result.meta);
    } catch (err) { next(err); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await SupplierService.getById(req.params.id as string);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = supplierSchema.parse(req.body);
      const result = await SupplierService.create(data, req.user!.userId);
      sendSuccess(res, result, undefined, 201);
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = supplierSchema.partial().parse(req.body);
      const result = await SupplierService.update(req.params.id as string, data, req.user!.userId);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await SupplierService.remove(req.params.id as string, req.user!.userId);
      sendSuccess(res, { message: 'Berhasil dihapus' });
    } catch (err) { next(err); }
  }
}
