import { Router } from 'express';
import { InboundController } from '../controllers/inbound.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/grn', InboundController.list);
router.get('/grn/:id', InboundController.getById);
router.post('/grn', InboundController.create);
router.post('/grn/:id/confirm', InboundController.confirm);
router.post('/grn/:id/cancel', InboundController.cancel);

export default router;
