import { pgTable, uuid, varchar, timestamp, integer, numeric } from 'drizzle-orm/pg-core';
import { categories } from './category.schema.js';
import { uoms } from './uom.schema.js';

export const products = pgTable('products', {
  id: uuid('id').defaultRandom().primaryKey(),
  sku: varchar('sku', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 150 }).notNull(),
  categoryId: uuid('category_id').references(() => categories.id),
  uomId: uuid('uom_id').references(() => uoms.id),
  minStock: integer('min_stock').default(0).notNull(),
  costPrice: numeric('cost_price', { precision: 12, scale: 2 }).default('0').notNull(),
  sellPrice: numeric('sell_price', { precision: 12, scale: 2 }).default('0').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});
