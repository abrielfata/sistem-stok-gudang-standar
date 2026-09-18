import { db } from '../config/database.js';
import { suppliers } from '../db/schema/supplier.schema.js';
import { eq, and, isNull, ilike, or, desc, asc, sql } from 'drizzle-orm';
import { NotFoundError, ConflictError } from '../errors/AppError.js';
import { PaginationParams } from '../helpers/pagination.helper.js';

export class SupplierService {
  static async list(params: PaginationParams) {
    const { page, perPage, search, sort, order } = params;
    const offset = (page - 1) * perPage;

    const filters = [isNull(suppliers.deletedAt)];
    if (search) {
      filters.push(or(
        ilike(suppliers.name, `%${search}%`),
        ilike(suppliers.code, `%${search}%`)
      )!);
    }

    const sortMap = { name: suppliers.name, code: suppliers.code, createdAt: suppliers.createdAt } as const;
    const sortCol = sort ? (sortMap[sort as keyof typeof sortMap] ?? suppliers.createdAt) : suppliers.createdAt;
    const orderBy = order === 'desc' ? desc(sortCol) : asc(sortCol);

    const data = await db
      .select()
      .from(suppliers)
      .where(and(...filters))
      .limit(perPage)
      .offset(offset)
      .orderBy(orderBy);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(suppliers)
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
      .from(suppliers)
      .where(and(eq(suppliers.id, id), isNull(suppliers.deletedAt)))
      .limit(1);

    if (!item) throw new NotFoundError('Supplier tidak ditemukan');
    return item;
  }

  static async create(data: any, userId: string) {
    // Check duplicate code
    const [exist] = await db.select().from(suppliers).where(eq(suppliers.code, data.code)).limit(1);
    if (exist) {
      if (exist.deletedAt === null) {
        throw new ConflictError('Kode Supplier sudah digunakan');
      } else {
        const [updated] = await db.update(suppliers)
          .set({ ...data, deletedAt: null, updatedAt: sql`now()` })
          .where(eq(suppliers.id, exist.id))
          .returning();
        return updated;
      }
    }

    const [newItem] = await db.insert(suppliers).values(data).returning();
    return newItem;
  }

  static async update(id: string, data: any, userId: string) {
    await this.getById(id);
    
    if (data.code) {
      const [exist] = await db.select().from(suppliers).where(and(eq(suppliers.code, data.code), isNull(suppliers.deletedAt)));
      if (exist && exist.id !== id) throw new ConflictError('Kode Supplier sudah digunakan');
    }

    const [updated] = await db.update(suppliers)
      .set({ ...data, updatedAt: sql`now()` })
      .where(eq(suppliers.id, id))
      .returning();
    return updated;
  }

  static async remove(id: string, userId: string) {
    await this.getById(id);
    await db.update(suppliers)
      .set({ deletedAt: sql`now()` })
      .where(eq(suppliers.id, id));
  }
}
