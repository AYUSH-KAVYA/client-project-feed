import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { ActivityLog, NotificationItem } from '../types';
import { api } from '../services/api';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  onlineCount: number;
  onlineUsers: Array<{ userId: string; name: string; email: string; role: string }>;
  activities: ActivityLog[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  joinProjectRoom: (projectId: string) => void;
  leaveProjectRoom: (projectId: string) => void;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  refetchActivities: () => Promise<void>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, accessToken } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [onlineUsers, setOnlineUsers] = useState<Array<{ userId: string; name: string; email: string; role: string }>>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState<number>(0);

  // Fetch initial missed activities (last 20) & notifications from DB when user logs in
  const refetchActivities = async () => {
    if (!user) return;
    try {
      const feedData = await api.get<ActivityLog[]>('/api/activity/feed?limit=20');
      setActivities(feedData);
    } catch (err) {
      console.error('Failed to fetch activity feed:', err);
    }
  };

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const data = await api.get<{ notifications: NotificationItem[]; unreadCount: number }>('/api/notifications');
      setNotifications(data.notifications);
      setUnreadNotificationCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    }
  };

  useEffect(() => {
    if (!user || !accessToken) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    refetchActivities();
    fetchNotifications();

    // Initialize Socket.io connection with access token
    const newSocket = io({
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Real-time presence updates
    newSocket.on('presence_update', (data: { onlineCount: number; onlineUsers: Array<{ userId: string; name: string; email: string; role: string }> }) => {
      setOnlineCount(data.onlineCount);
      setOnlineUsers(data.onlineUsers);
    });

    // Real-time activity feed event
    newSocket.on('activity_event', (event: ActivityLog) => {
      setActivities((prev) => [event, ...prev.slice(0, 49)]);
    });

    // Real-time in-app notification event
    newSocket.on('notification_new', (data: { notification: NotificationItem; unreadCount: number }) => {
      setNotifications((prev) => [data.notification, ...prev]);
      setUnreadNotificationCount(data.unreadCount);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, accessToken]);

  const joinProjectRoom = (projectId: string) => {
    if (socket) {
      socket.emit('join_project', projectId);
    }
  };

  const leaveProjectRoom = (projectId: string) => {
    if (socket) {
      socket.emit('leave_project', projectId);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadNotificationCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllNotificationsRead = async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadNotificationCount(0);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        onlineCount,
        onlineUsers,
        activities,
        notifications,
        unreadNotificationCount,
        joinProjectRoom,
        leaveProjectRoom,
        markNotificationRead,
        markAllNotificationsRead,
        refetchActivities,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
