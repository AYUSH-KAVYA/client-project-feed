import { Request, Response, NextFunction } from 'express';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  public static async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await NotificationService.getUserNotifications(req.user!.userId);
      res.status(200).json({ success: true, data });
    } catch (error) {
      next(error);
    }
  }

  public static async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const result = await NotificationService.markAsRead(id, req.user!.userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }

  public static async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await NotificationService.markAllAsRead(req.user!.userId);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
}
