import { db } from '../config/database.js';
import { categories } from '../db/schema/category.schema.js';
import { eq, and, isNull, ilike, or, desc, asc, sql } from 'drizzle-orm';
import { NotFoundError, ConflictError } from '../errors/AppError.js';
import { PaginationParams } from '../helpers/pagination.helper.js';

export class CategoryService {
  static async list(params: PaginationParams) {
    const { page, perPage, search, sort, order } = params;
    const offset = (page - 1) * perPage;

    const filters = [isNull(categories.deletedAt)];
    if (search) {
      filters.push(or(
        ilike(categories.name, `%${search}%`),
        ilike(categories.code, `%${search}%`)
      )!);
    }

    const sortMap = { name: categories.name, code: categories.code, createdAt: categories.createdAt } as const;
    const sortCol = sort ? (sortMap[sort as keyof typeof sortMap] ?? categories.createdAt) : categories.createdAt;
    const orderBy = order === 'desc' ? desc(sortCol) : asc(sortCol);

    const data = await db
      .select()
      .from(categories)
      .where(and(...filters))
      .limit(perPage)
      .offset(offset)
      .orderBy(orderBy);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(categories)
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
      .from(categories)
      .where(and(eq(categories.id, id), isNull(categories.deletedAt)))
      .limit(1);

    if (!item) throw new NotFoundError('Category tidak ditemukan');
    return item;
  }

  static async create(data: any, userId: string) {
    // Check duplicate code
    const [exist] = await db.select().from(categories).where(eq(categories.code, data.code)).limit(1);
    if (exist) {
      if (exist.deletedAt === null) {
        throw new ConflictError('Kode Kategori sudah digunakan');
      } else {
        const [updated] = await db.update(categories)
          .set({ ...data, deletedAt: null, updatedAt: sql`now()` })
          .where(eq(categories.id, exist.id))
          .returning();
        return updated;
      }
    }

    const [newItem] = await db.insert(categories).values(data).returning();
    return newItem;
  }

  static async update(id: string, data: any, userId: string) {
    await this.getById(id);
    
    if (data.code) {
      const [exist] = await db.select().from(categories).where(and(eq(categories.code, data.code), isNull(categories.deletedAt)));
      if (exist && exist.id !== id) throw new ConflictError('Kode Kategori sudah digunakan');
    }

    const [updated] = await db.update(categories)
      .set({ ...data, updatedAt: sql`now()` })
      .where(eq(categories.id, id))
      .returning();
    return updated;
  }

  static async remove(id: string, userId: string) {
    await this.getById(id);
    await db.update(categories)
      .set({ deletedAt: sql`now()` })
      .where(eq(categories.id, id));
  }
}
