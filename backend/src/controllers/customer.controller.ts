import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service.js';
import { sendSuccess } from '../helpers/response.helper.js';
import { customerSchema } from '../validators/customer.validator.js';
import { parsePagination } from '../helpers/pagination.helper.js';

export class CustomerController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req);
      const result = await CustomerService.list(params);
      sendSuccess(res, result.data, result.meta);
    } catch (err) { next(err); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await CustomerService.getById(req.params.id as string);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = customerSchema.parse(req.body);
      const result = await CustomerService.create(data, req.user!.userId);
      sendSuccess(res, result, undefined, 201);
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = customerSchema.partial().parse(req.body);
      const result = await CustomerService.update(req.params.id as string, data, req.user!.userId);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await CustomerService.remove(req.params.id as string, req.user!.userId);
      sendSuccess(res, { message: 'Berhasil dihapus' });
    } catch (err) { next(err); }
  }
}
