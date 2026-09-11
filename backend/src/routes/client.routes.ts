import { Router } from 'express';
import { ClientController } from '../controllers/client.controller';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/rbac.middleware';
import { validate } from '../middleware/validate.middleware';
import { createClientSchema, updateClientSchema } from '../utils/validationSchemas';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);
router.use(requireRole([Role.ADMIN, Role.PROJECT_MANAGER]));

router.get('/', ClientController.getAll);
router.get('/:id', ClientController.getById);
router.post('/', validate(createClientSchema), ClientController.create);
router.put('/:id', validate(updateClientSchema), ClientController.update);
router.delete('/:id', ClientController.delete);

export default router;
