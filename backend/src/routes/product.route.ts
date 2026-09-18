import { Router } from 'express';
import { ProductController } from '../controllers/product.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', ProductController.list);
router.get('/:id', ProductController.getById);
router.post('/', requireRole(['ADMIN', 'STAFF']), ProductController.create);
router.patch('/:id', requireRole(['ADMIN', 'STAFF']), ProductController.update);
router.delete('/:id', requireRole(['ADMIN', 'STAFF']), ProductController.remove);

export default router;
