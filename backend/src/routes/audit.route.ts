import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller.js';
import { requireAuth, requireRole } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/', requireRole(['ADMIN', 'STAFF']), AuditController.list);
router.get('/logs', requireRole(['ADMIN', 'STAFF']), AuditController.list);

export default router;
