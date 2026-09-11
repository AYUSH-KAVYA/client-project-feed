import { prisma } from '../utils/prisma';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { Role, ProjectApprovalStatus } from '@prisma/client';
import { JwtUserPayload } from '../types/express';
import { ActivityService } from './activity.service';
import { NotificationService } from './notification.service';

export class ProjectService {
  public static async getProjects(user: JwtUserPayload) {
    let whereClause: any = {};

    if (user.role === Role.ADMIN) {
      whereClause = {}; // Admin sees all
    } else if (user.role === Role.PROJECT_MANAGER) {
      // PM sees projects they created (including pending approval)
      whereClause = { createdById: user.userId };
    } else if (user.role === Role.DEVELOPER) {
      // Developer sees ONLY approved projects containing assigned tasks
      whereClause = {
        approvalStatus: ProjectApprovalStatus.APPROVED,
        tasks: {
          some: {
            assignedToId: user.userId,
          },
        },
      };
    }

    return prisma.project.findMany({
      where: whereClause,
      include: {
        client: { select: { id: true, name: true, company: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        tasks: {
          select: {
            id: true,
            status: true,
            priority: true,
            isOverdue: true,
            dueDate: true,
          },
        },
        _count: {
          select: { tasks: true, activityLogs: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async getPendingProjectRequests(user: JwtUserPayload) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenError('Only Admins can access project requests');
    }

    return prisma.project.findMany({
      where: { approvalStatus: ProjectApprovalStatus.PENDING_APPROVAL },
      include: {
        client: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async approveProject(projectId: string, user: JwtUserPayload) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenError('Only Admins can approve project requests');
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { approvalStatus: ProjectApprovalStatus.APPROVED },
      include: {
        client: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Activity log
    await ActivityService.logActivity({
      taskId: '00000000-0000-0000-0000-000000000000', // system
      projectId: updated.id,
      userId: user.userId,
      action: 'PROJECT_APPROVED',
      message: `Admin ${user.name} APPROVED project request "${updated.name}"`,
    });

    // Notify PM
    await NotificationService.createNotification({
      userId: updated.createdById,
      title: 'Project Approved by Admin',
      message: `Your project proposal "${updated.name}" has been APPROVED by Admin!`,
    });

    return updated;
  }

  public static async rejectProject(projectId: string, user: JwtUserPayload) {
    if (user.role !== Role.ADMIN) {
      throw new ForbiddenError('Only Admins can reject project requests');
    }

    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { approvalStatus: ProjectApprovalStatus.REJECTED },
    });

    // Notify PM
    await NotificationService.createNotification({
      userId: updated.createdById,
      title: 'Project Request Rejected',
      message: `Your project proposal "${updated.name}" was rejected by Admin.`,
    });

    return updated;
  }

  public static async getProjectById(projectId: string, user: JwtUserPayload) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        client: true,
        createdBy: { select: { id: true, name: true, email: true } },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
          },
          orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
        },
        _count: { select: { tasks: true } },
      },
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    if (user.role === Role.PROJECT_MANAGER && project.createdById !== user.userId) {
      throw new ForbiddenError('Access denied: You do not own this project');
    }

    if (user.role === Role.DEVELOPER) {
      if (project.approvalStatus !== ProjectApprovalStatus.APPROVED) {
        throw new ForbiddenError('Access denied: This project is pending admin approval');
      }
      const hasAssignedTask = project.tasks.some((t) => t.assignedToId === user.userId);
      if (!hasAssignedTask) {
        throw new ForbiddenError('Access denied: You are not assigned to any tasks in this project');
      }
    }

    return project;
  }

  public static async createProject(
    data: { name: string; description: string; clientId: string },
    user: JwtUserPayload
  ) {
    if (user.role !== Role.ADMIN && user.role !== Role.PROJECT_MANAGER) {
      throw new ForbiddenError('Only Admins and Project Managers can create projects');
    }

    const clientExists = await prisma.client.findUnique({ where: { id: data.clientId } });
    if (!clientExists) {
      throw new NotFoundError('Client not found');
    }

    // Admin projects are APPROVED immediately. PM projects require PENDING_APPROVAL.
    const initialApprovalStatus =
      user.role === Role.ADMIN
        ? ProjectApprovalStatus.APPROVED
        : ProjectApprovalStatus.PENDING_APPROVAL;

    const project = await prisma.project.create({
      data: {
        name: data.name,
        description: data.description,
        clientId: data.clientId,
        createdById: user.userId,
        approvalStatus: initialApprovalStatus,
      },
      include: {
        client: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    // Notify Admins if PM created project requiring approval
    if (user.role === Role.PROJECT_MANAGER) {
      const admins = await prisma.user.findMany({ where: { role: Role.ADMIN } });
      for (const admin of admins) {
        await NotificationService.createNotification({
          userId: admin.id,
          title: 'New Project Approval Request',
          message: `PM ${user.name} requested approval for new project: "${project.name}"`,
        });
      }
    }

    return project;
  }

  public static async updateProject(
    projectId: string,
    data: { name?: string; description?: string; clientId?: string },
    user: JwtUserPayload
  ) {
    const project = await this.getProjectById(projectId, user);

    if (user.role === Role.PROJECT_MANAGER && project.createdById !== user.userId) {
      throw new ForbiddenError('You can only edit projects you created');
    }

    return prisma.project.update({
      where: { id: projectId },
      data,
      include: {
        client: true,
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  }

  public static async deleteProject(projectId: string, user: JwtUserPayload) {
    const project = await this.getProjectById(projectId, user);

    if (user.role === Role.PROJECT_MANAGER && project.createdById !== user.userId) {
      throw new ForbiddenError('You can only delete projects you created');
    }

    return prisma.project.delete({
      where: { id: projectId },
    });
  }
}
