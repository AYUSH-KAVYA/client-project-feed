import { prisma } from '../utils/prisma';
import { Role, TaskStatus, TaskPriority } from '@prisma/client';
import { JwtUserPayload } from '../types/express';
import { presenceManager } from '../sockets/presence.manager';

export class DashboardService {
  public static async getDashboardStats(user: JwtUserPayload) {
    if (user.role === Role.ADMIN) {
      return this.getAdminStats();
    } else if (user.role === Role.PROJECT_MANAGER) {
      return this.getPMStats(user.userId);
    } else {
      return this.getDeveloperStats(user.userId);
    }
  }

  private static async getAdminStats() {
    const totalProjects = await prisma.project.count();
    const totalClients = await prisma.client.count();

    const tasksByStatus = await prisma.task.groupBy({
      by: ['status'],
      _count: { id: true },
    });

    const statusCounts: Record<TaskStatus, number> = {
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
    };

    tasksByStatus.forEach((item) => {
      statusCounts[item.status] = item._count.id;
    });

    const overdueCount = await prisma.task.count({
      where: {
        isOverdue: true,
        status: { not: TaskStatus.DONE },
      },
    });

    const totalUsers = await prisma.user.count();
    const activeOnlineUsersCount = presenceManager.getOnlineUserCount();
    const activeOnlineUsers = presenceManager.getOnlineUsers();

    return {
      role: Role.ADMIN,
      totalProjects,
      totalClients,
      totalUsers,
      overdueCount,
      tasksByStatus: statusCounts,
      activeOnlineUsersCount,
      activeOnlineUsers,
    };
  }

  private static async getPMStats(pmUserId: string) {
    const projects = await prisma.project.findMany({
      where: { createdById: pmUserId },
      include: {
        client: { select: { name: true } },
        _count: { select: { tasks: true } },
      },
    });

    const tasksByPriority = await prisma.task.groupBy({
      by: ['priority'],
      where: {
        project: { createdById: pmUserId },
      },
      _count: { id: true },
    });

    const priorityCounts: Record<TaskPriority, number> = {
      LOW: 0,
      MEDIUM: 0,
      HIGH: 0,
      CRITICAL: 0,
    };

    tasksByPriority.forEach((item) => {
      priorityCounts[item.priority] = item._count.id;
    });

    // Upcoming due dates this week (next 7 days)
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const upcomingTasks = await prisma.task.findMany({
      where: {
        project: { createdById: pmUserId },
        dueDate: { gte: now, lte: nextWeek },
        status: { not: TaskStatus.DONE },
      },
      include: {
        project: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    const overdueCount = await prisma.task.count({
      where: {
        project: { createdById: pmUserId },
        isOverdue: true,
        status: { not: TaskStatus.DONE },
      },
    });

    return {
      role: Role.PROJECT_MANAGER,
      totalProjects: projects.length,
      projects,
      tasksByPriority: priorityCounts,
      upcomingTasks,
      overdueCount,
    };
  }

  private static async getDeveloperStats(devUserId: string) {
    const assignedTasks = await prisma.task.findMany({
      where: { assignedToId: devUserId },
      include: {
        project: { select: { id: true, name: true } },
      },
    });

    const PRIORITY_ORDER: Record<TaskPriority, number> = {
      CRITICAL: 4,
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    // Sorted by priority desc then due date asc
    assignedTasks.sort((a, b) => {
      const pDiff = PRIORITY_ORDER[b.priority] - PRIORITY_ORDER[a.priority];
      if (pDiff !== 0) return pDiff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

    const overdueCount = assignedTasks.filter((t) => t.isOverdue && t.status !== TaskStatus.DONE).length;
    const todoCount = assignedTasks.filter((t) => t.status === TaskStatus.TODO).length;
    const inProgressCount = assignedTasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length;
    const inReviewCount = assignedTasks.filter((t) => t.status === TaskStatus.IN_REVIEW).length;
    const doneCount = assignedTasks.filter((t) => t.status === TaskStatus.DONE).length;

    return {
      role: Role.DEVELOPER,
      totalAssigned: assignedTasks.length,
      todoCount,
      inProgressCount,
      inReviewCount,
      doneCount,
      overdueCount,
      tasks: assignedTasks,
    };
  }
}
