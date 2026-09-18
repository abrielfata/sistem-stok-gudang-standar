import { db } from '../config/database.js';
import { uoms } from '../db/schema/uom.schema.js';
import { eq, and, isNull, ilike, or, desc, asc, sql } from 'drizzle-orm';
import { NotFoundError, ConflictError } from '../errors/AppError.js';
import { PaginationParams } from '../helpers/pagination.helper.js';

export class UomService {
  static async list(params: PaginationParams) {
    const { page, perPage, search, sort, order } = params;
    const offset = (page - 1) * perPage;

    const filters = [isNull(uoms.deletedAt)];
    if (search) {
      filters.push(or(
        ilike(uoms.name, `%${search}%`),
        ilike(uoms.code, `%${search}%`)
      )!);
    }

    const sortMap = { name: uoms.name, code: uoms.code, createdAt: uoms.createdAt } as const;
    const sortCol = sort ? (sortMap[sort as keyof typeof sortMap] ?? uoms.createdAt) : uoms.createdAt;
    const orderBy = order === 'desc' ? desc(sortCol) : asc(sortCol);

    const data = await db
      .select()
      .from(uoms)
      .where(and(...filters))
      .limit(perPage)
      .offset(offset)
      .orderBy(orderBy);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(uoms)
      .where(and(...filters));

    return {
      data,
      meta: {
        page,
        perPage,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / perPage),
      },
    };
  }

  static async getById(id: string) {
    const [item] = await db
      .select()
      .from(uoms)
      .where(and(eq(uoms.id, id), isNull(uoms.deletedAt)))
      .limit(1);

    if (!item) throw new NotFoundError('Uom tidak ditemukan');
    return item;
  }

  static async create(data: any, userId: string) {
    // Check duplicate code (including soft-deleted)
    const [exist] = await db.select().from(uoms).where(eq(uoms.code, data.code)).limit(1);
    if (exist) {
      if (exist.deletedAt === null) {
        throw new ConflictError('Kode UoM sudah digunakan');
      } else {
        // Reactivate soft-deleted UoM
        const [updated] = await db.update(uoms)
          .set({ ...data, deletedAt: null, updatedAt: sql`now()` })
          .where(eq(uoms.id, exist.id))
          .returning();
        return updated;
      }
    }

    const [newItem] = await db.insert(uoms).values(data).returning();
    return newItem;
  }

  static async update(id: string, data: any, userId: string) {
    await this.getById(id);
    
    if (data.code) {
      const [exist] = await db.select().from(uoms).where(and(eq(uoms.code, data.code), isNull(uoms.deletedAt)));
      if (exist && exist.id !== id) throw new ConflictError('Kode UoM sudah digunakan');
    }

    const [updated] = await db.update(uoms)
      .set({ ...data, updatedAt: sql`now()` })
      .where(eq(uoms.id, id))
      .returning();
    return updated;
  }

  static async remove(id: string, userId: string) {
    await this.getById(id);
    await db.update(uoms)
      .set({ deletedAt: sql`now()` })
      .where(eq(uoms.id, id));
  }
}
