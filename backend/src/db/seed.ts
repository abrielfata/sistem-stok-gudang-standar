import { db } from '../config/database.js';
import { users } from './schema/users.schema.js';
import { categories, uoms, products, warehouses, suppliers, customers } from './schema/index.js';
import { goodsReceipts, goodsReceiptLines } from './schema/inbound.schema.js';
import { salesOrders, salesOrderLines } from './schema/outbound.schema.js';
import { hashPassword } from '../helpers/password.helper.js';
import { InventoryService } from '../services/inventory.service.js';
import { sql } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Seeding database...');

  const passwordHash = await hashPassword('admin123');
  const staffHash = await hashPassword('staff123');

  // 1. Users
  const [admin] = await db.insert(users).values({
    name: 'Admin WMS', email: 'admin@demo.com', passwordHash, role: 'ADMIN'
  }).onConflictDoUpdate({ target: users.email, set: { name: 'Admin WMS' } }).returning();

  const [staff] = await db.insert(users).values({
    name: 'Staff Gudang', email: 'staff@demo.com', passwordHash: staffHash, role: 'STAFF'
  }).onConflictDoUpdate({ target: users.email, set: { name: 'Staff Gudang' } }).returning();

  // 2. Warehouses
  const [wh1] = await db.insert(warehouses).values({ code: 'WH-001', name: 'Gudang Utama', address: 'Jakarta' }).onConflictDoUpdate({ target: warehouses.code, set: { name: 'Gudang Utama' } }).returning();
  const [wh2] = await db.insert(warehouses).values({ code: 'WH-002', name: 'Gudang Cabang', address: 'Bandung' }).onConflictDoUpdate({ target: warehouses.code, set: { name: 'Gudang Cabang' } }).returning();

  // 3. Categories & UoMs
  const [catEl] = await db.insert(categories).values({ code: 'CAT-EL', name: 'Elektronik' }).onConflictDoUpdate({ target: categories.code, set: { name: 'Elektronik' } }).returning();
  const [catPak] = await db.insert(categories).values({ code: 'CAT-PAK', name: 'Pakaian' }).onConflictDoUpdate({ target: categories.code, set: { name: 'Pakaian' } }).returning();
  const [catMak] = await db.insert(categories).values({ code: 'CAT-MAK', name: 'Makanan' }).onConflictDoUpdate({ target: categories.code, set: { name: 'Makanan' } }).returning();

  const [uomPcs] = await db.insert(uoms).values({ code: 'PCS', name: 'Pieces' }).onConflictDoUpdate({ target: uoms.code, set: { name: 'Pieces' } }).returning();
  const [uomBox] = await db.insert(uoms).values({ code: 'BOX', name: 'Box' }).onConflictDoUpdate({ target: uoms.code, set: { name: 'Box' } }).returning();
  const [uomKg] = await db.insert(uoms).values({ code: 'KG', name: 'Kilogram' }).onConflictDoUpdate({ target: uoms.code, set: { name: 'Kilogram' } }).returning();
  const [uomLtr] = await db.insert(uoms).values({ code: 'LTR', name: 'Liter' }).onConflictDoUpdate({ target: uoms.code, set: { name: 'Liter' } }).returning();

  // 4. Products
  const [p1] = await db.insert(products).values({ sku: 'LPT-001', name: 'Laptop Asus', categoryId: catEl.id, uomId: uomPcs.id, costPrice: '10000000', sellPrice: '12000000', minStock: 5 }).onConflictDoUpdate({ target: products.sku, set: { name: 'Laptop Asus' } }).returning();
  const [p2] = await db.insert(products).values({ sku: 'MOU-001', name: 'Mouse Logitech', categoryId: catEl.id, uomId: uomPcs.id, costPrice: '150000', sellPrice: '200000', minStock: 20 }).onConflictDoUpdate({ target: products.sku, set: { name: 'Mouse Logitech' } }).returning();
  const [p3] = await db.insert(products).values({ sku: 'KOS-001', name: 'Kaos Polos', categoryId: catPak.id, uomId: uomPcs.id, costPrice: '35000', sellPrice: '50000', minStock: 50 }).onConflictDoUpdate({ target: products.sku, set: { name: 'Kaos Polos' } }).returning();
  const [p4] = await db.insert(products).values({ sku: 'BRS-001', name: 'Beras Premium 5kg', categoryId: catMak.id, uomId: uomBox.id, costPrice: '60000', sellPrice: '75000', minStock: 100 }).onConflictDoUpdate({ target: products.sku, set: { name: 'Beras Premium 5kg' } }).returning();
  const [p5] = await db.insert(products).values({ sku: 'MYK-001', name: 'Minyak Goreng 2L', categoryId: catMak.id, uomId: uomPcs.id, costPrice: '30000', sellPrice: '36000', minStock: 100 }).onConflictDoUpdate({ target: products.sku, set: { name: 'Minyak Goreng 2L' } }).returning();

  // 5. Suppliers & Customers
  const [sup1] = await db.insert(suppliers).values({ code: 'SUP-001', name: 'PT Asusindo', phone: '08111', email: 'asus@demo.com' }).onConflictDoUpdate({ target: suppliers.code, set: { name: 'PT Asusindo' } }).returning();
  await db.insert(suppliers).values({ code: 'SUP-002', name: 'Grosir Pakaian', phone: '08222', email: 'baju@demo.com' }).onConflictDoNothing();
  await db.insert(suppliers).values({ code: 'SUP-003', name: 'Distributor Pangan', phone: '08333', email: 'pangan@demo.com' }).onConflictDoNothing();

  const [cus1] = await db.insert(customers).values({ code: 'CUS-001', name: 'Toko Elektronik Maju', phone: '08999', email: 'maju@demo.com' }).onConflictDoUpdate({ target: customers.code, set: { name: 'Toko Elektronik Maju' } }).returning();
  await db.insert(customers).values({ code: 'CUS-002', name: 'Boutique Indah', phone: '08888', email: 'indah@demo.com' }).onConflictDoNothing();
  await db.insert(customers).values({ code: 'CUS-003', name: 'Supermarket Segar', phone: '08777', email: 'segar@demo.com' }).onConflictDoNothing();

  // 6. Generate 1 GRN Confirmed
  const [grn] = await db.insert(goodsReceipts).values({
    grnNumber: 'IN-202601-0001',
    warehouseId: wh1.id,
    supplierId: sup1.id,
    status: 'CONFIRMED',
    notes: 'Initial Stock via Seed',
    createdBy: admin.id,
    confirmedAt: sql`now()`,
  }).onConflictDoNothing().returning();

  if (grn) {
    await db.insert(goodsReceiptLines).values([
      { grnId: grn.id, productId: p1.id, qty: 50 },
      { grnId: grn.id, productId: p2.id, qty: 200 },
      { grnId: grn.id, productId: p4.id, qty: 500 },
    ]);

    // Adjust Stok IN
    await InventoryService.adjustStock({ productId: p1.id, warehouseId: wh1.id, type: 'IN', qty: 50, refType: 'GRN', refId: grn.id, notes: 'Seed Init', userId: admin.id });
    await InventoryService.adjustStock({ productId: p2.id, warehouseId: wh1.id, type: 'IN', qty: 200, refType: 'GRN', refId: grn.id, notes: 'Seed Init', userId: admin.id });
    await InventoryService.adjustStock({ productId: p4.id, warehouseId: wh1.id, type: 'IN', qty: 500, refType: 'GRN', refId: grn.id, notes: 'Seed Init', userId: admin.id });
  }

  // 7. Generate 1 SO Confirmed
  const [so] = await db.insert(salesOrders).values({
    soNumber: 'OUT-202601-0001',
    warehouseId: wh1.id,
    customerId: cus1.id,
    status: 'CONFIRMED',
    notes: 'Penjualan Perdana',
    createdBy: admin.id,
    confirmedAt: sql`now()`,
  }).onConflictDoNothing().returning();

  if (so) {
    await db.insert(salesOrderLines).values([
      { soId: so.id, productId: p1.id, qty: 2 },
      { soId: so.id, productId: p2.id, qty: 10 },
    ]);

    // Adjust Stok OUT
    await InventoryService.adjustStock({ productId: p1.id, warehouseId: wh1.id, type: 'OUT', qty: 2, refType: 'SO', refId: so.id, notes: 'Penjualan Perdana', userId: admin.id });
    await InventoryService.adjustStock({ productId: p2.id, warehouseId: wh1.id, type: 'OUT', qty: 10, refType: 'SO', refId: so.id, notes: 'Penjualan Perdana', userId: admin.id });
  }

  console.log('✅ Seeding completed');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
