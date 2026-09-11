import { Request, Response, NextFunction } from 'express';
import { ModificationService } from '../services/modification.service';

export class ModificationController {
  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const mod = await ModificationService.createModification(req.body, req.user!);
      res.status(201).json({ success: true, data: mod });
    } catch (error) {
      next(error);
    }
  }

  public static async getPMModifications(req: Request, res: Response, next: NextFunction) {
    try {
      const mods = await ModificationService.getPMModifications(req.user!);
      res.status(200).json({ success: true, data: mods });
    } catch (error) {
      next(error);
    }
  }

  public static async getDevModifications(req: Request, res: Response, next: NextFunction) {
    try {
      const mods = await ModificationService.getDevModifications(req.user!);
      res.status(200).json({ success: true, data: mods });
    } catch (error) {
      next(error);
    }
  }

  public static async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const mod = await ModificationService.approveModification(id, req.user!);
      res.status(200).json({ success: true, data: mod });
    } catch (error) {
      next(error);
    }
  }

  public static async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const mod = await ModificationService.rejectModification(id, req.user!);
      res.status(200).json({ success: true, data: mod });
    } catch (error) {
      next(error);
    }
  }
}
