import { pgTable, uuid, integer, timestamp, unique, varchar, text, index } from 'drizzle-orm/pg-core';
import { products } from './product.schema.js';
import { warehouses } from './warehouse.schema.js';
import { users } from './users.schema.js';

export const stocks = pgTable('stocks', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id).notNull(),
  qtyAvailable: integer('qty_available').default(0).notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (t) => ({
  unqProductWarehouse: unique().on(t.productId, t.warehouseId),
  idxStockProductWh: index('idx_stock_product_wh').on(t.productId, t.warehouseId),
}));

export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').defaultRandom().primaryKey(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id).notNull(),
  type: varchar('type', { length: 10 }).notNull(), // 'IN' | 'OUT'
  qty: integer('qty').notNull(),
  refType: varchar('ref_type', { length: 20 }).notNull(), // 'GRN' | 'SO' | 'ADJ'
  refId: varchar('ref_id', { length: 100 }).notNull(),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  idxMovementProductWh: index('idx_stock_movements_product_wh').on(t.productId, t.warehouseId),
  idxMovementCreatedAt: index('idx_stock_movements_created_at').on(t.createdAt),
}));
