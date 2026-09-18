import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/kpi', DashboardController.getKpi);
router.get('/activity', DashboardController.getActivity);

export default router;
