import { pgTable, uuid, varchar, timestamp, integer, pgEnum, text } from 'drizzle-orm/pg-core';
import { warehouses } from './warehouse.schema.js';
import { suppliers } from './supplier.schema.js';
import { users } from './users.schema.js';
import { products } from './product.schema.js';

export const grnStatusEnum = pgEnum('grn_status', ['DRAFT', 'CONFIRMED', 'CANCELLED']);

export const goodsReceipts = pgTable('goods_receipts', {
  id: uuid('id').defaultRandom().primaryKey(),
  grnNumber: varchar('grn_number', { length: 50 }).notNull().unique(),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id).notNull(),
  supplierId: uuid('supplier_id').references(() => suppliers.id).notNull(),
  status: grnStatusEnum('status').default('DRAFT').notNull(),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  confirmedAt: timestamp('confirmed_at'),
});

export const goodsReceiptLines = pgTable('goods_receipt_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  grnId: uuid('grn_id').references(() => goodsReceipts.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  qty: integer('qty').notNull(),
});
