import { Router } from 'express';
import { WarehouseController } from '../controllers/warehouse.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', WarehouseController.list);
router.get('/:id', WarehouseController.getById);
router.post('/', requireRole(['ADMIN', 'STAFF']), WarehouseController.create);
router.patch('/:id', requireRole(['ADMIN', 'STAFF']), WarehouseController.update);
router.delete('/:id', requireRole(['ADMIN', 'STAFF']), WarehouseController.remove);

export default router;
