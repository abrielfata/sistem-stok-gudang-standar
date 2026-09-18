import { Router } from 'express';
import { InventoryController } from '../controllers/inventory.controller.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();
router.use(requireAuth);

router.get('/stocks', InventoryController.getStocks);
router.get('/stocks/:productId/:warehouseId/kartu-stok', InventoryController.getKartuStok);
router.get('/low-stock', InventoryController.getLowStock);

export default router;
