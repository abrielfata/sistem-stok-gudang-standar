import { Request, Response, NextFunction } from 'express';
import { InventoryService } from '../services/inventory.service.js';
import { sendSuccess } from '../helpers/response.helper.js';

export class InventoryController {
  static async getStocks(req: Request, res: Response, next: NextFunction) {
    try {
      const warehouseId = typeof req.query.warehouseId === 'string' ? req.query.warehouseId : undefined;
      const data = await InventoryService.getStocks(warehouseId);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  }

  static async getKartuStok(req: Request, res: Response, next: NextFunction) {
    try {
      const { productId, warehouseId } = req.params;
      const data = await InventoryService.getKartuStok(productId as string, warehouseId as string);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  }

  static async getLowStock(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await InventoryService.getLowStock();
      sendSuccess(res, data);
    } catch (err) { next(err); }
  }
}
