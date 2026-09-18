import { Router } from 'express';
import { OutboundController } from '../controllers/outbound.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/so', OutboundController.list);
router.get('/so/:id', OutboundController.getById);
router.post('/so', OutboundController.create);
router.post('/so/:id/confirm', OutboundController.confirm);
router.post('/so/:id/cancel', OutboundController.cancel);

export default router;
