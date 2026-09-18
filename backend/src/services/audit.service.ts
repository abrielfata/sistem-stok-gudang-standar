import { db } from '../config/database.js';
import { auditLogs } from '../db/schema/audit.schema.js';
import { eq, ilike, or, desc, asc, sql } from 'drizzle-orm';
import { PaginationParams } from '../helpers/pagination.helper.js';

export interface AuditLogInput {
  userId?: string;
  action: string;
  entity: string;
  entityId?: string;
  description?: string;
  ipAddress?: string;
}

export class AuditService {
  static async log(input: AuditLogInput, txOrDb: any = db) {
    await txOrDb.insert(auditLogs).values({
      userId: input.userId,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      description: input.description,
      ipAddress: input.ipAddress,
    });
  }

  static async list(params: PaginationParams) {
    const { page, perPage, search, sort, order } = params;
    const offset = (page - 1) * perPage;

    const filters: any[] = [];
    if (search) {
      filters.push(or(
        ilike(auditLogs.action, `%${search}%`),
        ilike(auditLogs.entity, `%${search}%`),
        ilike(auditLogs.description, `%${search}%`)
      )!);
    }

    const sortMap = {
      createdAt: auditLogs.createdAt,
      action: auditLogs.action,
      entity: auditLogs.entity,
    } as const;
    
    const sortCol = sort ? (sortMap[sort as keyof typeof sortMap] ?? auditLogs.createdAt) : auditLogs.createdAt;
    const orderBy = order === 'asc' ? asc(sortCol) : desc(sortCol);

    const whereClause = filters.length > 0 ? filters[0] : undefined;

    const data = await db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .limit(perPage)
      .offset(offset)
      .orderBy(orderBy);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(auditLogs)
      .where(whereClause);

    return {
      data,
      meta: { page, perPage, total: Number(count), totalPages: Math.ceil(Number(count) / perPage) },
    };
  }
}
