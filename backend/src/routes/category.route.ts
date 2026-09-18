import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', CategoryController.list);
router.get('/:id', CategoryController.getById);
router.post('/', requireRole(['ADMIN', 'STAFF']), CategoryController.create);
router.patch('/:id', requireRole(['ADMIN', 'STAFF']), CategoryController.update);
router.delete('/:id', requireRole(['ADMIN', 'STAFF']), CategoryController.remove);

export default router;
