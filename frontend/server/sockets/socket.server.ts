import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { JwtUserPayload } from '../types/express';
import { presenceManager } from './presence.manager';

let io: Server | null = null;

export const initSocketServer = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  // JWT Middleware for Socket.io
  io.use((socket: Socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      (socket.handshake.headers?.authorization
        ? (socket.handshake.headers.authorization as string).replace('Bearer ', '')
        : null);

    if (!token) {
      return next(new Error('Authentication error: Missing token'));
    }

    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as JwtUserPayload;
      socket.data.user = payload;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user: JwtUserPayload = socket.data.user;

    // Track presence
    presenceManager.addConnection(socket.id, user, io!);

    // Personal user room for target notifications
    socket.join(`user:${user.userId}`);

    // Role-specific rooms
    if (user.role === 'ADMIN') {
      socket.join('room:admin');
    } else if (user.role === 'PROJECT_MANAGER') {
      socket.join(`room:pm:${user.userId}`);
    } else if (user.role === 'DEVELOPER') {
      socket.join(`room:dev:${user.userId}`);
    }

    // Allow client to subscribe/join project-specific rooms
    socket.on('join_project', (projectId: string) => {
      socket.join(`room:project:${projectId}`);
    });

    socket.on('leave_project', (projectId: string) => {
      socket.leave(`room:project:${projectId}`);
    });

    socket.on('disconnect', () => {
      presenceManager.removeConnection(socket.id, io!);
    });
  });

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    throw new Error('Socket.io server has not been initialized');
  }
  return io;
};
