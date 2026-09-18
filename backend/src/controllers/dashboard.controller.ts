import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service.js';
import { sendSuccess } from '../helpers/response.helper.js';

export class DashboardController {
  static async getKpi(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await DashboardService.getKpi();
      sendSuccess(res, data);
    } catch (err) { next(err); }
  }

  static async getActivity(req: Request, res: Response, next: NextFunction) {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const data = await DashboardService.getActivity(days);
      sendSuccess(res, data);
    } catch (err) { next(err); }
  }
}
