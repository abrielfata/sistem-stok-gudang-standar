import { pgTable, uuid, varchar, text, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users.schema.js';

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').references(() => users.id),
  action: varchar('action', { length: 50 }).notNull(), // 'CREATE' | 'UPDATE' | 'DELETE' | 'CONFIRM' | 'CANCEL' | 'LOGIN'
  entity: varchar('entity', { length: 50 }).notNull(), // 'PRODUCT' | 'GRN' | 'SO' | 'USER' etc.
  entityId: varchar('entity_id', { length: 100 }),
  description: text('description'),
  ipAddress: varchar('ip_address', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
}, (t) => ({
  idxAuditCreatedAt: index('idx_audit_logs_created_at').on(t.createdAt),
}));
