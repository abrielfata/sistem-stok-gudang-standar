import { pgTable, uuid, varchar, timestamp, integer, pgEnum, text } from 'drizzle-orm/pg-core';
import { warehouses } from './warehouse.schema.js';
import { customers } from './customer.schema.js';
import { users } from './users.schema.js';
import { products } from './product.schema.js';

export const soStatusEnum = pgEnum('so_status', ['DRAFT', 'CONFIRMED', 'CANCELLED']);

export const salesOrders = pgTable('sales_orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  soNumber: varchar('so_number', { length: 50 }).notNull().unique(),
  warehouseId: uuid('warehouse_id').references(() => warehouses.id).notNull(),
  customerId: uuid('customer_id').references(() => customers.id).notNull(),
  status: soStatusEnum('status').default('DRAFT').notNull(),
  notes: text('notes'),
  createdBy: uuid('created_by').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  confirmedAt: timestamp('confirmed_at'),
});

export const salesOrderLines = pgTable('sales_order_lines', {
  id: uuid('id').defaultRandom().primaryKey(),
  soId: uuid('so_id').references(() => salesOrders.id).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  qty: integer('qty').notNull(),
});
