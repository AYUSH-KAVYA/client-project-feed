import { Router } from 'express';
import { ProjectController } from '../controllers/project.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createProjectSchema, updateProjectSchema } from '../utils/validationSchemas';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// Admin Project Requests Queue
router.get('/requests', requireRole([Role.ADMIN]), ProjectController.getPendingRequests);
router.patch('/:id/approve', requireRole([Role.ADMIN]), ProjectController.approve);
router.patch('/:id/reject', requireRole([Role.ADMIN]), ProjectController.reject);

// All authenticated roles can view authorized projects
router.get('/', ProjectController.getAll);
router.get('/:id', ProjectController.getById);

// Create, update, or delete projects (Admin & PM)
router.post('/', requireRole([Role.ADMIN, Role.PROJECT_MANAGER]), validate(createProjectSchema), ProjectController.create);
router.put('/:id', requireRole([Role.ADMIN, Role.PROJECT_MANAGER]), validate(updateProjectSchema), ProjectController.update);
router.delete('/:id', requireRole([Role.ADMIN, Role.PROJECT_MANAGER]), ProjectController.delete);

export default router;
