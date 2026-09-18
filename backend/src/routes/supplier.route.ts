import { Router } from 'express';
import { SupplierController } from '../controllers/supplier.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', SupplierController.list);
router.get('/:id', SupplierController.getById);
router.post('/', requireRole(['ADMIN', 'STAFF']), SupplierController.create);
router.patch('/:id', requireRole(['ADMIN', 'STAFF']), SupplierController.update);
router.delete('/:id', requireRole(['ADMIN', 'STAFF']), SupplierController.remove);

export default router;
