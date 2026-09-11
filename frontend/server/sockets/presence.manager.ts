import { Server } from 'socket.io';

class PresenceManager {
  // Map of userId -> Set of socketIds
  private userSockets: Map<string, Set<string>> = new Map();
  // Map of socketId -> user details
  private socketUser: Map<string, { userId: string; email: string; name: string; role: string }> = new Map();

  public addConnection(
    socketId: string,
    user: { userId: string; email: string; name: string; role: string },
    io: Server
  ): void {
    this.socketUser.set(socketId, user);

    if (!this.userSockets.has(user.userId)) {
      this.userSockets.set(user.userId, new Set());
    }
    this.userSockets.get(user.userId)!.add(socketId);

    this.broadcastPresence(io);
  }

  public removeConnection(socketId: string, io: Server): void {
    const user = this.socketUser.get(socketId);
    if (user) {
      const sockets = this.userSockets.get(user.userId);
      if (sockets) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          this.userSockets.delete(user.userId);
        }
      }
      this.socketUser.delete(socketId);
    }

    this.broadcastPresence(io);
  }

  public getOnlineUserCount(): number {
    return this.userSockets.size;
  }

  public getOnlineUsers(): Array<{ userId: string; name: string; email: string; role: string }> {
    const uniqueUsers = new Map<string, { userId: string; name: string; email: string; role: string }>();
    for (const user of this.socketUser.values()) {
      if (!uniqueUsers.has(user.userId)) {
        uniqueUsers.set(user.userId, user);
      }
    }
    return Array.from(uniqueUsers.values());
  }

  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && (this.userSockets.get(userId)?.size ?? 0) > 0;
  }

  private broadcastPresence(io: Server): void {
    const count = this.getOnlineUserCount();
    const onlineUsers = this.getOnlineUsers();

    // Broadcast presence stats to admin room and global users
    io.emit('presence_update', {
      onlineCount: count,
      onlineUsers,
    });
  }
}

export const presenceManager = new PresenceManager();
