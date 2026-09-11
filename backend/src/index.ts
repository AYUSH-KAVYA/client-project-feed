import http from 'http';
import app from './app';
import { env } from './config/env';
import { initSocketServer } from './sockets/socket.server';
import { startOverdueScheduler } from './jobs/overdueScheduler';
import { prisma } from './utils/prisma';

const server = http.createServer(app);

// Initialize Socket.io Server
initSocketServer(server);

// Start Overdue Tasks Background Scheduler
startOverdueScheduler();

server.listen(env.PORT, () => {
  console.log(`=================================`);
  console.log(`🚀 Server running on port ${env.PORT}`);
  console.log(`   Environment: ${env.NODE_ENV}`);
  console.log(`=================================`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\nShutting down server gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('PostgreSQL client disconnected.');
    process.exit(0);
  });
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
