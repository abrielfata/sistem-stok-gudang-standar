import { Router } from 'express';
import { UomController } from '../controllers/uom.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', UomController.list);
router.get('/:id', UomController.getById);
router.post('/', requireRole(['ADMIN', 'STAFF']), UomController.create);
router.patch('/:id', requireRole(['ADMIN', 'STAFF']), UomController.update);
router.delete('/:id', requireRole(['ADMIN', 'STAFF']), UomController.remove);

export default router;
