import { db } from '../config/database.js';
import { warehouses } from '../db/schema/warehouse.schema.js';
import { eq, and, isNull, ilike, or, desc, asc, sql } from 'drizzle-orm';
import { NotFoundError, ConflictError } from '../errors/AppError.js';
import { PaginationParams } from '../helpers/pagination.helper.js';

export class WarehouseService {
  static async list(params: PaginationParams) {
    const { page, perPage, search, sort, order } = params;
    const offset = (page - 1) * perPage;

    const filters = [isNull(warehouses.deletedAt)];
    if (search) {
      filters.push(or(
        ilike(warehouses.name, `%${search}%`),
        ilike(warehouses.code, `%${search}%`)
      )!);
    }

    const sortMap = { name: warehouses.name, code: warehouses.code, createdAt: warehouses.createdAt } as const;
    const sortCol = sort ? (sortMap[sort as keyof typeof sortMap] ?? warehouses.createdAt) : warehouses.createdAt;
    const orderBy = order === 'desc' ? desc(sortCol) : asc(sortCol);

    const data = await db
      .select()
      .from(warehouses)
      .where(and(...filters))
      .limit(perPage)
      .offset(offset)
      .orderBy(orderBy);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(warehouses)
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
      .from(warehouses)
      .where(and(eq(warehouses.id, id), isNull(warehouses.deletedAt)))
      .limit(1);

    if (!item) throw new NotFoundError('Warehouse tidak ditemukan');
    return item;
  }

  static async create(data: any, userId: string) {
    // Check duplicate code
    const [exist] = await db.select().from(warehouses).where(eq(warehouses.code, data.code)).limit(1);
    if (exist) {
      if (exist.deletedAt === null) {
        throw new ConflictError('Kode Gudang sudah digunakan');
      } else {
        const [updated] = await db.update(warehouses)
          .set({ ...data, deletedAt: null, updatedAt: sql`now()` })
          .where(eq(warehouses.id, exist.id))
          .returning();
        return updated;
      }
    }

    const [newItem] = await db.insert(warehouses).values(data).returning();
    return newItem;
  }

  static async update(id: string, data: any, userId: string) {
    await this.getById(id);
    
    if (data.code) {
      const [exist] = await db.select().from(warehouses).where(and(eq(warehouses.code, data.code), isNull(warehouses.deletedAt)));
      if (exist && exist.id !== id) throw new ConflictError('Kode Gudang sudah digunakan');
    }

    const [updated] = await db.update(warehouses)
      .set({ ...data, updatedAt: sql`now()` })
      .where(eq(warehouses.id, id))
      .returning();
    return updated;
  }

  static async remove(id: string, userId: string) {
    await this.getById(id);
    await db.update(warehouses)
      .set({ deletedAt: sql`now()` })
      .where(eq(warehouses.id, id));
  }
}
