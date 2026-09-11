import { prisma } from '../utils/prisma';
import { ForbiddenError, NotFoundError } from '../utils/errors';
import { Role, ModificationStatus } from '@prisma/client';
import { JwtUserPayload } from '../types/express';
import { NotificationService } from './notification.service';

export class ModificationService {
  public static async createModification(
    data: { title: string; description: string; projectId: string; taskId?: string },
    user: JwtUserPayload
  ) {
    if (user.role !== Role.DEVELOPER) {
      throw new ForbiddenError('Only Developers can submit modification requests');
    }

    const project = await prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const modification = await prisma.modificationRequest.create({
      data: {
        title: data.title,
        description: data.description,
        projectId: data.projectId,
        taskId: data.taskId || null,
        devId: user.userId,
        pmId: project.createdById,
      },
      include: {
        dev: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
      },
    });

    // Notify PM
    await NotificationService.createNotification({
      userId: project.createdById,
      title: 'New Dev Modification Proposal',
      message: `Developer ${user.name} submitted a feature/modification proposal for "${project.name}": "${modification.title}"`,
    });

    return modification;
  }

  public static async getPMModifications(user: JwtUserPayload) {
    if (user.role !== Role.PROJECT_MANAGER && user.role !== Role.ADMIN) {
      throw new ForbiddenError('Only PMs and Admins can view modification requests');
    }

    let whereClause: any = {};
    if (user.role === Role.PROJECT_MANAGER) {
      whereClause = { pmId: user.userId };
    }

    return prisma.modificationRequest.findMany({
      where: whereClause,
      include: {
        dev: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, taskNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async getDevModifications(user: JwtUserPayload) {
    return prisma.modificationRequest.findMany({
      where: { devId: user.userId },
      include: {
        project: { select: { id: true, name: true } },
        task: { select: { id: true, title: true, taskNumber: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public static async approveModification(id: string, user: JwtUserPayload) {
    const mod = await prisma.modificationRequest.findUnique({ where: { id } });
    if (!mod) {
      throw new NotFoundError('Modification request not found');
    }

    if (user.role === Role.PROJECT_MANAGER && mod.pmId !== user.userId) {
      throw new ForbiddenError('You can only approve modifications for your own projects');
    }

    const updated = await prisma.modificationRequest.update({
      where: { id },
      data: { status: ModificationStatus.APPROVED },
    });

    // Notify Developer
    await NotificationService.createNotification({
      userId: mod.devId,
      title: 'Modification Proposal Approved! 🎉',
      message: `Your feature/modification proposal "${mod.title}" has been APPROVED by PM!`,
    });

    return updated;
  }

  public static async rejectModification(id: string, user: JwtUserPayload) {
    const mod = await prisma.modificationRequest.findUnique({ where: { id } });
    if (!mod) {
      throw new NotFoundError('Modification request not found');
    }

    if (user.role === Role.PROJECT_MANAGER && mod.pmId !== user.userId) {
      throw new ForbiddenError('You can only reject modifications for your own projects');
    }

    const updated = await prisma.modificationRequest.update({
      where: { id },
      data: { status: ModificationStatus.REJECTED },
    });

    // Notify Developer
    await NotificationService.createNotification({
      userId: mod.devId,
      title: 'Modification Proposal Status Update',
      message: `Your feature/modification proposal "${mod.title}" was rejected by PM.`,
    });

    return updated;
  }
}
