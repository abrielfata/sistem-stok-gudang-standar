import { db } from '../config/database.js';
import { customers } from '../db/schema/customer.schema.js';
import { eq, and, isNull, ilike, or, desc, asc, sql } from 'drizzle-orm';
import { NotFoundError, ConflictError } from '../errors/AppError.js';
import { PaginationParams } from '../helpers/pagination.helper.js';

export class CustomerService {
  static async list(params: PaginationParams) {
    const { page, perPage, search, sort, order } = params;
    const offset = (page - 1) * perPage;

    const filters = [isNull(customers.deletedAt)];
    if (search) {
      filters.push(or(
        ilike(customers.name, `%${search}%`),
        ilike(customers.code, `%${search}%`)
      )!);
    }

    const sortMap = { name: customers.name, code: customers.code, createdAt: customers.createdAt } as const;
    const sortCol = sort ? (sortMap[sort as keyof typeof sortMap] ?? customers.createdAt) : customers.createdAt;
    const orderBy = order === 'desc' ? desc(sortCol) : asc(sortCol);

    const data = await db
      .select()
      .from(customers)
      .where(and(...filters))
      .limit(perPage)
      .offset(offset)
      .orderBy(orderBy);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(customers)
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
      .from(customers)
      .where(and(eq(customers.id, id), isNull(customers.deletedAt)))
      .limit(1);

    if (!item) throw new NotFoundError('Customer tidak ditemukan');
    return item;
  }

  static async create(data: any, userId: string) {
    // Check duplicate code
    const [exist] = await db.select().from(customers).where(eq(customers.code, data.code)).limit(1);
    if (exist) {
      if (exist.deletedAt === null) {
        throw new ConflictError('Kode Pelanggan sudah digunakan');
      } else {
        const [updated] = await db.update(customers)
          .set({ ...data, deletedAt: null, updatedAt: sql`now()` })
          .where(eq(customers.id, exist.id))
          .returning();
        return updated;
      }
    }

    const [newItem] = await db.insert(customers).values(data).returning();
    return newItem;
  }

  static async update(id: string, data: any, userId: string) {
    await this.getById(id);
    
    if (data.code) {
      const [exist] = await db.select().from(customers).where(and(eq(customers.code, data.code), isNull(customers.deletedAt)));
      if (exist && exist.id !== id) throw new ConflictError('Kode Pelanggan sudah digunakan');
    }

    const [updated] = await db.update(customers)
      .set({ ...data, updatedAt: sql`now()` })
      .where(eq(customers.id, id))
      .returning();
    return updated;
  }

  static async remove(id: string, userId: string) {
    await this.getById(id);
    await db.update(customers)
      .set({ deletedAt: sql`now()` })
      .where(eq(customers.id, id));
  }
}
