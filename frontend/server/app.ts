import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';

import authRoutes from './routes/auth.routes';
import clientRoutes from './routes/client.routes';
import projectRoutes from './routes/project.routes';
import taskRoutes from './routes/task.routes';
import activityRoutes from './routes/activity.routes';
import notificationRoutes from './routes/notification.routes';
import dashboardRoutes from './routes/dashboard.routes';
import modificationRoutes from './routes/modification.routes';

const app: Application = express();

// Path normalization for Vercel Serverless Function rewrites
app.use((req, _res, next) => {
  const matchedPath = (req.headers['x-matched-path'] as string) || (req.headers['x-invoke-path'] as string);
  if (matchedPath && (req.url === '/' || req.url === '/api' || req.url.startsWith('/api?'))) {
    req.url = matchedPath;
  }
  next();
});

// Middlewares
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        origin.includes('vercel.app') ||
        origin.includes('localhost') ||
        origin.includes('127.0.0.1') ||
        (env.CORS_ORIGIN && origin === env.CORS_ORIGIN)
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

// API Router
const apiRouter = express.Router();

// Healthcheck
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mounted Endpoints
apiRouter.use('/auth', authRoutes);
apiRouter.use('/clients', clientRoutes);
apiRouter.use('/projects', projectRoutes);
apiRouter.use('/tasks', taskRoutes);
apiRouter.use('/activity', activityRoutes);
apiRouter.use('/notifications', notificationRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/modifications', modificationRoutes);

// Support both /api/* and direct /* prefix
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Error Handling Middleware
app.use(errorHandler);

export default app;
