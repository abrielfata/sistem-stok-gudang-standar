import { Router } from 'express';
import authRoutes from './auth.route.js';

import productRoutes from './product.route.js';
import categoryRoutes from './category.route.js';
import uomRoutes from './uom.route.js';
import warehouseRoutes from './warehouse.route.js';
import supplierRoutes from './supplier.route.js';
import customerRoutes from './customer.route.js';
import inventoryRoutes from './inventory.route.js';
import inboundRoutes from './inbound.route.js';
import outboundRoutes from './outbound.route.js';
import auditRoutes from './audit.route.js';
import dashboardRoutes from './dashboard.route.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/uoms', uomRoutes);
router.use('/warehouses', warehouseRoutes);
router.use('/suppliers', supplierRoutes);
router.use('/customers', customerRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/inbound', inboundRoutes);
router.use('/outbound', outboundRoutes);
router.use('/audit', auditRoutes);
router.use('/dashboard', dashboardRoutes);

// Health checks
router.get('/health', (req: any, res: any) => {
  res.status(200).json({ success: true, message: 'Server is healthy' });
});

export default router;
