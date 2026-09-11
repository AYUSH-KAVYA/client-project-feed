import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service';
import { TaskStatus, TaskPriority } from '@prisma/client';

export class TaskController {
  public static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, priority, dueDateFrom, dueDateTo, projectId, search } = req.query;

      const filters = {
        status: status as TaskStatus | undefined,
        priority: priority as TaskPriority | undefined,
        dueDateFrom: dueDateFrom as string | undefined,
        dueDateTo: dueDateTo as string | undefined,
        projectId: projectId as string | undefined,
        search: search as string | undefined,
      };

      const tasks = await TaskService.getTasks(req.user!, filters);
      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      next(error);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const task = await TaskService.getTaskById(id, req.user!);
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await TaskService.createTask(req.body, req.user!);
      res.status(201).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  public static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const task = await TaskService.updateTaskStatus(id, req.body.status, req.user!);
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const task = await TaskService.updateTask(id, req.body, req.user!);
      res.status(200).json({ success: true, data: task });
    } catch (error) {
      next(error);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await TaskService.deleteTask(id, req.user!);
      res.status(200).json({ success: true, data: { message: 'Task deleted successfully' } });
    } catch (error) {
      next(error);
    }
  }
}
