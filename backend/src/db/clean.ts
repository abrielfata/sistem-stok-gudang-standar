import { db } from '../config/database.js';
import { users } from './schema/users.schema.js';
import { 
  categories, uoms, products, warehouses, suppliers, customers,
  goodsReceipts, goodsReceiptLines, salesOrders, salesOrderLines,
  stocks, stockMovements, auditLogs 
} from './schema/index.js';
import { hashPassword } from '../helpers/password.helper.js';

async function clean() {
  console.log('🧹 Cleaning database demo data...');

  // 1. Delete all transactional & movement data
  await db.delete(goodsReceiptLines);
  await db.delete(goodsReceipts);
  await db.delete(salesOrderLines);
  await db.delete(salesOrders);
  await db.delete(stockMovements);
  await db.delete(stocks);

  // 2. Delete all master data
  await db.delete(products);
  await db.delete(categories);
  await db.delete(uoms);
  await db.delete(warehouses);
  await db.delete(suppliers);
  await db.delete(customers);
  await db.delete(auditLogs);

  console.log('✅ Demo data deleted!');

  // 3. Re-ensure admin & staff users exist for login
  const passwordHash = await hashPassword('admin123');
  const staffHash = await hashPassword('staff123');

  await db.insert(users).values({
    name: 'Admin WMS', email: 'admin@demo.com', passwordHash, role: 'ADMIN'
  }).onConflictDoUpdate({ target: users.email, set: { name: 'Admin WMS' } });

  await db.insert(users).values({
    name: 'Staff Gudang', email: 'staff@demo.com', passwordHash: staffHash, role: 'STAFF'
  }).onConflictDoUpdate({ target: users.email, set: { name: 'Staff Gudang' } });

  console.log('✅ Database is clean and ready for real data recording!');
  process.exit(0);
}

clean().catch((err) => {
  console.error('❌ Clean failed:', err);
  process.exit(1);
});
