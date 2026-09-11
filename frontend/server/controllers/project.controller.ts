import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';

export class ProjectController {
  public static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await ProjectService.getProjects(req.user!);
      res.status(200).json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  }

  public static async getPendingRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const projects = await ProjectService.getPendingProjectRequests(req.user!);
      res.status(200).json({ success: true, data: projects });
    } catch (error) {
      next(error);
    }
  }

  public static async approve(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const project = await ProjectService.approveProject(id, req.user!);
      res.status(200).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  public static async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const project = await ProjectService.rejectProject(id, req.user!);
      res.status(200).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const project = await ProjectService.getProjectById(id, req.user!);
      res.status(200).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await ProjectService.createProject(req.body, req.user!);
      res.status(201).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const project = await ProjectService.updateProject(id, req.body, req.user!);
      res.status(200).json({ success: true, data: project });
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await ProjectService.deleteProject(id, req.user!);
      res.status(200).json({ success: true, data: { message: 'Project deleted successfully' } });
    } catch (error) {
      next(error);
    }
  }
}
