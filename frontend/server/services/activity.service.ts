import { prisma } from '../utils/prisma';
import { getIO } from '../sockets/socket.server';
import { TaskStatus, Role } from '@prisma/client';

export interface CreateActivityInput {
  taskId: string;
  projectId: string;
  userId: string;
  action: string;
  previousStatus?: TaskStatus;
  newStatus?: TaskStatus;
  message: string;
}

export class ActivityService {
  public static async logActivity(input: CreateActivityInput) {
    const activity = await prisma.activityLog.create({
      data: {
        taskId: input.taskId,
        projectId: input.projectId,
        userId: input.userId,
        action: input.action,
        previousStatus: input.previousStatus,
        newStatus: input.newStatus,
        message: input.message,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
        task: {
          select: { id: true, title: true, taskNumber: true, assignedToId: true },
        },
        project: {
          select: { id: true, name: true, createdById: true },
        },
      },
    });

    // Broadcast via WebSockets to appropriate rooms
    try {
      const io = getIO();
      
      const payload = {
        id: activity.id,
        taskId: activity.taskId,
        taskNumber: activity.task.taskNumber,
        taskTitle: activity.task.title,
        projectId: activity.projectId,
        projectName: activity.project.name,
        userId: activity.userId,
        userName: activity.user.name,
        action: activity.action,
        previousStatus: activity.previousStatus,
        newStatus: activity.newStatus,
        message: activity.message,
        createdAt: activity.createdAt,
      };

      // 1. Admin room (sees all activities)
      io.to('room:admin').emit('activity_event', payload);

      // 2. PM room (PM creator of this project)
      io.to(`room:pm:${activity.project.createdById}`).emit('activity_event', payload);

      // 3. Project room (anyone viewing project dashboard)
      io.to(`room:project:${activity.projectId}`).emit('activity_event', payload);

      // 4. Developer room (assigned dev)
      if (activity.task.assignedToId) {
        io.to(`room:dev:${activity.task.assignedToId}`).emit('activity_event', payload);
      }
    } catch (error) {
      console.warn('Socket broadcast warning:', error);
    }

    return activity;
  }

  // Fetch missed activities (last 20) with strict role filtering from DB
  public static async getMissedActivities(user: { userId: string; role: Role }, limit: number = 20) {
    let whereClause = {};

    if (user.role === Role.ADMIN) {
      whereClause = {}; // Admin sees all
    } else if (user.role === Role.PROJECT_MANAGER) {
      // PM sees activities for projects they created
      whereClause = {
        project: {
          createdById: user.userId,
        },
      };
    } else if (user.role === Role.DEVELOPER) {
      // Developer sees activities only for tasks assigned to them
      whereClause = {
        task: {
          assignedToId: user.userId,
        },
      };
    }

    const activities = await prisma.activityLog.findMany({
      where: whereClause,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        task: {
          select: { id: true, title: true, taskNumber: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    return activities.map((act) => ({
      id: act.id,
      taskId: act.taskId,
      taskNumber: act.task.taskNumber,
      taskTitle: act.task.title,
      projectId: act.projectId,
      projectName: act.project.name,
      userId: act.userId,
      userName: act.user.name,
      action: act.action,
      previousStatus: act.previousStatus,
      newStatus: act.newStatus,
      message: act.message,
      createdAt: act.createdAt,
    }));
  }
}
