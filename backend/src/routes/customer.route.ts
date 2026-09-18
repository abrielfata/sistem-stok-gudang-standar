import { Router } from 'express';
import { CustomerController } from '../controllers/customer.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', CustomerController.list);
router.get('/:id', CustomerController.getById);
router.post('/', requireRole(['ADMIN', 'STAFF']), CustomerController.create);
router.patch('/:id', requireRole(['ADMIN', 'STAFF']), CustomerController.update);
router.delete('/:id', requireRole(['ADMIN', 'STAFF']), CustomerController.remove);

export default router;
