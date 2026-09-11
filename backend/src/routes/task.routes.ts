import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createTaskSchema,
  updateTaskStatusSchema,
  updateTaskSchema,
} from '../utils/validationSchemas';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Get list of tasks & task details (role-filtered in TaskService)
router.get('/', TaskController.getAll);
router.get('/:id', TaskController.getById);

// Create task (Admin & PM only)
router.post('/', requireRole([Role.ADMIN, Role.PROJECT_MANAGER]), validate(createTaskSchema), TaskController.create);

// Update status (Admin, PM, and assigned Dev)
router.patch('/:id/status', validate(updateTaskStatusSchema), TaskController.updateStatus);

// Edit task details (Admin & PM only)
router.put('/:id', requireRole([Role.ADMIN, Role.PROJECT_MANAGER]), validate(updateTaskSchema), TaskController.update);

// Delete task (Admin & PM only)
router.delete('/:id', requireRole([Role.ADMIN, Role.PROJECT_MANAGER]), TaskController.delete);

export default router;
