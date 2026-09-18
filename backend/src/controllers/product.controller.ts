import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service.js';
import { sendSuccess } from '../helpers/response.helper.js';
import { productSchema } from '../validators/product.validator.js';
import { parsePagination } from '../helpers/pagination.helper.js';

export class ProductController {
  static async list(req: Request, res: Response, next: NextFunction) {
    try {
      const params = parsePagination(req);
      const result = await ProductService.list(params);
      sendSuccess(res, result.data, result.meta);
    } catch (err) { next(err); }
  }

  static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await ProductService.getById(req.params.id as string);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const data = productSchema.parse(req.body);
      const result = await ProductService.create(data, req.user!.userId);
      sendSuccess(res, result, undefined, 201);
    } catch (err) { next(err); }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const data = productSchema.partial().parse(req.body);
      const result = await ProductService.update(req.params.id as string, data, req.user!.userId);
      sendSuccess(res, result);
    } catch (err) { next(err); }
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await ProductService.remove(req.params.id as string, req.user!.userId);
      sendSuccess(res, { message: 'Produk berhasil dihapus' });
    } catch (err) { next(err); }
  }
}
