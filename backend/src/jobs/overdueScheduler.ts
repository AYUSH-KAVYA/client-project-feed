import cron from 'node-cron';
import { prisma } from '../utils/prisma';
import { TaskStatus } from '@prisma/client';
import { ActivityService } from '../services/activity.service';

export const startOverdueScheduler = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      // Find tasks past due date that are not DONE and not yet marked as overdue
      const overdueTasks = await prisma.task.findMany({
        where: {
          dueDate: { lt: now },
          status: { not: TaskStatus.DONE },
          isOverdue: false,
        },
        include: {
          project: { select: { id: true, name: true, createdById: true } },
          assignedTo: { select: { id: true, name: true } },
        },
      });

      if (overdueTasks.length === 0) return;

      console.log(`[OverdueScheduler] Found ${overdueTasks.length} newly overdue tasks.`);

      for (const task of overdueTasks) {
        await prisma.task.update({
          where: { id: task.id },
          data: { isOverdue: true },
        });

        // System user ID or system log
        await ActivityService.logActivity({
          taskId: task.id,
          projectId: task.projectId,
          userId: task.project.createdById, // system or project manager
          action: 'TASK_OVERDUE',
          message: `System flagged Task #${task.taskNumber} "${task.title}" as OVERDUE`,
        });
      }
    } catch (error) {
      console.error('[OverdueScheduler] Error checking overdue tasks:', error);
    }
  });

  console.log('[OverdueScheduler] Background cron scheduler started (running every minute).');
};
