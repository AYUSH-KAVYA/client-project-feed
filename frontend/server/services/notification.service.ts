import { prisma } from '../utils/prisma';
import { getIO } from '../sockets/socket.server';

export interface CreateNotificationInput {
  userId: string;
  title: string;
  message: string;
  taskId?: string;
}

export class NotificationService {
  public static async createNotification(input: CreateNotificationInput) {
    const notification = await prisma.notification.create({
      data: {
        userId: input.userId,
        title: input.title,
        message: input.message,
        taskId: input.taskId,
      },
    });

    // Real-time broadcast to specific user's socket room
    try {
      const io = getIO();
      
      // Get unread count for this user
      const unreadCount = await prisma.notification.count({
        where: { userId: input.userId, isRead: false },
      });

      io.to(`user:${input.userId}`).emit('notification_new', {
        notification,
        unreadCount,
      });
    } catch (err) {
      console.warn('Notification socket broadcast error:', err);
    }

    return notification;
  }

  public static async getUserNotifications(userId: string) {
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { notifications, unreadCount };
  }

  public static async markAsRead(notificationId: string, userId: string) {
    const updated = await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true },
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false },
    });

    return { success: true, unreadCount };
  }

  public static async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });

    return { success: true, unreadCount: 0 };
  }
}
