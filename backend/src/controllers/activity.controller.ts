import { Request, Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service';

export class ActivityController {
  public static async getFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;
      const activities = await ActivityService.getMissedActivities(req.user!, limit);
      res.status(200).json({ success: true, data: activities });
    } catch (error) {
      next(error);
    }
  }
}
