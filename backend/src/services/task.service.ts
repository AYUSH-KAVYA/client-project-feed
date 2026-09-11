import { prisma } from '../utils/prisma';
import { ForbiddenError, NotFoundError, BadRequestError } from '../utils/errors';
import { TaskStatus, TaskPriority, Role } from '@prisma/client';
import { JwtUserPayload } from '../types/express';
import { ActivityService } from './activity.service';
import { NotificationService } from './notification.service';

export interface TaskFilterOptions {
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDateFrom?: string;
  dueDateTo?: string;
  projectId?: string;
  search?: string;
}

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export class TaskService {
  public static async getTasks(user: JwtUserPayload, filters: TaskFilterOptions) {
    const where: any = {};

    // Role-based visibility
    if (user.role === Role.ADMIN) {
      // Admin sees all
    } else if (user.role === Role.PROJECT_MANAGER) {
      // PM sees tasks in projects they created
      where.project = { createdById: user.userId };
    } else if (user.role === Role.DEVELOPER) {
      // Developer sees ONLY tasks assigned to them
      where.assignedToId = user.userId;
    }

    // Filters
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.priority) {
      where.priority = filters.priority;
    }
    if (filters.projectId) {
      where.projectId = filters.projectId;
    }
    if (filters.dueDateFrom || filters.dueDateTo) {
      where.dueDate = {};
      if (filters.dueDateFrom) {
        where.dueDate.gte = new Date(filters.dueDateFrom);
      }
      if (filters.dueDateTo) {
        where.dueDate.lte = new Date(filters.dueDateTo);
      }
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, createdById: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    // Custom sorting for Developer: priority then due date
    if (user.role === Role.DEVELOPER) {
      tasks.sort((a, b) => {
        const priorityDiff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      });
    }

    return tasks;
  }

  public static async getTaskById(taskId: string, user: JwtUserPayload) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: {
          include: {
            createdBy: { select: { id: true, name: true, email: true } },
          },
        },
        assignedTo: { select: { id: true, name: true, email: true } },
        activityLogs: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      throw new NotFoundError('Task not found');
    }

    // Role checks
    if (user.role === Role.PROJECT_MANAGER && task.project.createdById !== user.userId) {
      throw new ForbiddenError('Access denied: You do not own the project for this task');
    }
    if (user.role === Role.DEVELOPER && task.assignedToId !== user.userId) {
      throw new ForbiddenError('Access denied: You are not assigned to this task');
    }

    return task;
  }

  public static async createTask(
    data: {
      title: string;
      description: string;
      priority?: TaskPriority;
      dueDate: string;
      projectId: string;
      assignedToId?: string;
    },
    user: JwtUserPayload
  ) {
    if (user.role !== Role.ADMIN && user.role !== Role.PROJECT_MANAGER) {
      throw new ForbiddenError('Only Admins and Project Managers can create tasks');
    }

    const project = await prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (user.role === Role.PROJECT_MANAGER && project.createdById !== user.userId) {
      throw new ForbiddenError('You can only create tasks in your own projects');
    }

    if (data.assignedToId) {
      const devUser = await prisma.user.findUnique({ where: { id: data.assignedToId } });
      if (!devUser) {
        throw new NotFoundError('Assigned developer not found');
      }
    }

    const isOverdue = new Date(data.dueDate) < new Date();

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority || TaskPriority.MEDIUM,
        dueDate: new Date(data.dueDate),
        isOverdue,
        projectId: data.projectId,
        assignedToId: data.assignedToId || null,
      },
      include: {
        project: { select: { id: true, name: true, createdById: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // Log Activity
    await ActivityService.logActivity({
      taskId: task.id,
      projectId: task.projectId,
      userId: user.userId,
      action: 'TASK_CREATED',
      newStatus: task.status,
      message: `${user.name} created Task #${task.taskNumber} "${task.title}"`,
    });

    // Notification if assigned to developer
    if (task.assignedToId) {
      await NotificationService.createNotification({
        userId: task.assignedToId,
        title: 'New Task Assigned',
        message: `You have been assigned to Task #${task.taskNumber}: "${task.title}" in ${task.project.name}`,
        taskId: task.id,
      });
    }

    return task;
  }

  public static async updateTaskStatus(
    taskId: string,
    newStatus: TaskStatus,
    user: JwtUserPayload
  ) {
    const task = await this.getTaskById(taskId, user);

    if (task.status === newStatus) {
      return task;
    }

    const previousStatus = task.status;

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
      include: {
        project: { select: { id: true, name: true, createdById: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    const statusFormat: Record<TaskStatus, string> = {
      TODO: 'To Do',
      IN_PROGRESS: 'In Progress',
      IN_REVIEW: 'In Review',
      DONE: 'Done',
    };

    const message = `${user.name} moved Task #${task.taskNumber} from ${statusFormat[previousStatus]} → ${statusFormat[newStatus]}`;

    // Log Activity in DB & socket broadcast
    await ActivityService.logActivity({
      taskId: updatedTask.id,
      projectId: updatedTask.projectId,
      userId: user.userId,
      action: 'STATUS_CHANGE',
      previousStatus,
      newStatus,
      message,
    });

    // Notification rule: When moved to IN_REVIEW, notify PM (project creator)
    if (newStatus === TaskStatus.IN_REVIEW && updatedTask.project.createdById) {
      await NotificationService.createNotification({
        userId: updatedTask.project.createdById,
        title: 'Task Ready for Review',
        message: `Task #${task.taskNumber} "${task.title}" was moved to In Review by ${user.name}`,
        taskId: updatedTask.id,
      });
    }

    return updatedTask;
  }

  public static async updateTask(
    taskId: string,
    data: {
      title?: string;
      description?: string;
      priority?: TaskPriority;
      dueDate?: string;
      assignedToId?: string | null;
      status?: TaskStatus;
    },
    user: JwtUserPayload
  ) {
    const task = await this.getTaskById(taskId, user);

    // Only Admin or Project Manager of this project can edit task fields
    if (user.role === Role.DEVELOPER) {
      throw new ForbiddenError('Developers can only update task status');
    }

    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.dueDate !== undefined) {
      updateData.dueDate = new Date(data.dueDate);
      updateData.isOverdue = new Date(data.dueDate) < new Date() && (data.status || task.status) !== TaskStatus.DONE;
    }
    if (data.assignedToId !== undefined) {
      updateData.assignedToId = data.assignedToId;
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, createdById: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
      },
    });

    // If assigned user changed to a new dev, notify them
    if (data.assignedToId && data.assignedToId !== task.assignedToId) {
      await NotificationService.createNotification({
        userId: data.assignedToId,
        title: 'Task Reassigned',
        message: `You have been assigned to Task #${updatedTask.taskNumber}: "${updatedTask.title}"`,
        taskId: updatedTask.id,
      });
    }

    // Log Activity
    await ActivityService.logActivity({
      taskId: updatedTask.id,
      projectId: updatedTask.projectId,
      userId: user.userId,
      action: 'TASK_UPDATED',
      message: `${user.name} updated details for Task #${updatedTask.taskNumber}`,
    });

    return updatedTask;
  }

  public static async deleteTask(taskId: string, user: JwtUserPayload) {
    const task = await this.getTaskById(taskId, user);

    if (user.role === Role.DEVELOPER) {
      throw new ForbiddenError('Developers cannot delete tasks');
    }

    return prisma.task.delete({
      where: { id: taskId },
    });
  }
}
