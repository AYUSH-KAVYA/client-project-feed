import { Request, Response, NextFunction } from 'express';
import { DashboardService } from '../services/dashboard.service';

export class DashboardController {
  public static async getStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await DashboardService.getDashboardStats(req.user!);
      res.status(200).json({ success: true, data: stats });
    } catch (error) {
      next(error);
    }
  }
}
