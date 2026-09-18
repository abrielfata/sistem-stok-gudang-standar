import { db } from '../config/database.js';
import { products } from '../db/schema/product.schema.js';
import { categories } from '../db/schema/category.schema.js';
import { uoms } from '../db/schema/uom.schema.js';
import { stocks } from '../db/schema/inventory.schema.js';
import { eq, and, isNull, ilike, or, desc, asc, sql } from 'drizzle-orm';
import { NotFoundError, ConflictError } from '../errors/AppError.js';
import { PaginationParams } from '../helpers/pagination.helper.js';
import { z } from 'zod';
import { productSchema } from '../validators/product.validator.js';

export class ProductService {
  static async list(params: PaginationParams) {
    const { page, perPage, search, sort, order } = params;
    const offset = (page - 1) * perPage;

    const filters = [isNull(products.deletedAt)];
    if (search) {
      filters.push(or(
        ilike(products.name, `%${search}%`),
        ilike(products.sku, `%${search}%`)
      )!);
    }

    const sortMap = {
      name: products.name,
      sku: products.sku,
      createdAt: products.createdAt,
      costPrice: products.costPrice,
      sellPrice: products.sellPrice,
    } as const;
    const sortCol = sort ? (sortMap[sort as keyof typeof sortMap] ?? products.createdAt) : products.createdAt;
    const orderBy = order === 'desc' ? desc(sortCol) : asc(sortCol);

    const data = await db
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        categoryId: products.categoryId,
        categoryName: categories.name,
        uomId: products.uomId,
        uomName: uoms.name,
        minStock: products.minStock,
        costPrice: products.costPrice,
        sellPrice: products.sellPrice,
        stock: sql<number>`coalesce(sum(${stocks.qtyAvailable}), 0)::int`,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(uoms, eq(products.uomId, uoms.id))
      .leftJoin(stocks, eq(products.id, stocks.productId))
      .where(and(...filters))
      .groupBy(products.id, categories.id, uoms.id)
      .limit(perPage)
      .offset(offset)
      .orderBy(orderBy);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
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
      .select({
        id: products.id,
        sku: products.sku,
        name: products.name,
        categoryId: products.categoryId,
        categoryName: categories.name,
        uomId: products.uomId,
        uomName: uoms.name,
        minStock: products.minStock,
        costPrice: products.costPrice,
        sellPrice: products.sellPrice,
        stock: sql<number>`coalesce(sum(${stocks.qtyAvailable}), 0)::int`,
        createdAt: products.createdAt,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .leftJoin(uoms, eq(products.uomId, uoms.id))
      .leftJoin(stocks, eq(products.id, stocks.productId))
      .where(and(eq(products.id, id), isNull(products.deletedAt)))
      .groupBy(products.id, categories.id, uoms.id)
      .limit(1);

    if (!item) throw new NotFoundError('Produk tidak ditemukan');
    return item;
  }

  static async create(data: z.infer<typeof productSchema>, userId: string) {
    const [exist] = await db.select().from(products).where(eq(products.sku, data.sku)).limit(1);
    if (exist) throw new ConflictError('SKU sudah digunakan');

    const [newItem] = await db.insert(products).values({
      ...data,
      costPrice: String(data.costPrice),
      sellPrice: String(data.sellPrice),
    }).returning();
    return newItem;
  }

  static async update(id: string, data: Partial<z.infer<typeof productSchema>>, userId: string) {
    await this.getById(id);

    if (data.sku) {
      const [exist] = await db.select().from(products).where(eq(products.sku, data.sku));
      if (exist && exist.id !== id) throw new ConflictError('SKU sudah digunakan');
    }

    const payload: any = { ...data, updatedAt: sql`now()` };
    if (data.costPrice !== undefined) payload.costPrice = String(data.costPrice);
    if (data.sellPrice !== undefined) payload.sellPrice = String(data.sellPrice);

    const [updated] = await db.update(products)
      .set(payload)
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  static async remove(id: string, userId: string) {
    await this.getById(id);
    await db.update(products)
      .set({ deletedAt: sql`now()` })
      .where(eq(products.id, id));
  }
}
