import { Router } from 'express';
import { ModificationController } from '../controllers/modification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', ModificationController.create);
router.get('/pm', ModificationController.getPMModifications);
router.get('/dev', ModificationController.getDevModifications);
router.patch('/:id/approve', ModificationController.approve);
router.patch('/:id/reject', ModificationController.reject);

export default router;
