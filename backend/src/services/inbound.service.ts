import { db } from '../config/database.js';
import { goodsReceipts, goodsReceiptLines } from '../db/schema/inbound.schema.js';
import { products } from '../db/schema/product.schema.js';
import { suppliers } from '../db/schema/supplier.schema.js';
import { warehouses } from '../db/schema/warehouse.schema.js';
import { eq, and, ilike, sql, desc, asc } from 'drizzle-orm';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';
import { InventoryService } from './inventory.service.js';
import { generateGrnNumber } from '../helpers/document-number.helper.js';
import { PaginationParams } from '../helpers/pagination.helper.js';
import { z } from 'zod';
import { createGrnSchema } from '../validators/inbound.validator.js';

import { AuditService } from './audit.service.js';

export class InboundService {
  static async listGrn(params: PaginationParams & { status?: string }) {
    const { page, perPage, search, sort, order, status } = params;
    const offset = (page - 1) * perPage;

    const filters: any[] = [];
    if (status) filters.push(eq(goodsReceipts.status, status as any));
    if (search) filters.push(ilike(goodsReceipts.grnNumber, `%${search}%`));

    const sortMap = {
      createdAt: goodsReceipts.createdAt,
      grnNumber: goodsReceipts.grnNumber,
      status: goodsReceipts.status,
    } as const;
    const sortCol = sort ? (sortMap[sort as keyof typeof sortMap] ?? goodsReceipts.createdAt) : goodsReceipts.createdAt;
    const orderBy = order === 'asc' ? asc(sortCol) : desc(sortCol);

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db
      .select({
        id: goodsReceipts.id,
        grnNumber: goodsReceipts.grnNumber,
        status: goodsReceipts.status,
        notes: goodsReceipts.notes,
        warehouseId: goodsReceipts.warehouseId,
        warehouseName: warehouses.name,
        supplierId: goodsReceipts.supplierId,
        supplierName: suppliers.name,
        createdAt: goodsReceipts.createdAt,
        confirmedAt: goodsReceipts.confirmedAt,
      })
      .from(goodsReceipts)
      .innerJoin(warehouses, eq(goodsReceipts.warehouseId, warehouses.id))
      .innerJoin(suppliers, eq(goodsReceipts.supplierId, suppliers.id))
      .where(whereClause)
      .limit(perPage)
      .offset(offset)
      .orderBy(orderBy);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(goodsReceipts)
      .where(whereClause);

    return {
      data,
      meta: { page, perPage, total: Number(count), totalPages: Math.ceil(Number(count) / perPage) },
    };
  }

  static async getGrnById(id: string) {
    const [header] = await db
      .select({
        id: goodsReceipts.id,
        grnNumber: goodsReceipts.grnNumber,
        status: goodsReceipts.status,
        notes: goodsReceipts.notes,
        warehouseId: goodsReceipts.warehouseId,
        warehouseName: warehouses.name,
        supplierId: goodsReceipts.supplierId,
        supplierName: suppliers.name,
        createdAt: goodsReceipts.createdAt,
        confirmedAt: goodsReceipts.confirmedAt,
      })
      .from(goodsReceipts)
      .innerJoin(warehouses, eq(goodsReceipts.warehouseId, warehouses.id))
      .innerJoin(suppliers, eq(goodsReceipts.supplierId, suppliers.id))
      .where(eq(goodsReceipts.id, id))
      .limit(1);

    if (!header) throw new NotFoundError('GRN tidak ditemukan');

    const lines = await db
      .select({
        id: goodsReceiptLines.id,
        productId: goodsReceiptLines.productId,
        productName: products.name,
        productSku: products.sku,
        qty: goodsReceiptLines.qty,
      })
      .from(goodsReceiptLines)
      .innerJoin(products, eq(goodsReceiptLines.productId, products.id))
      .where(eq(goodsReceiptLines.grnId, id));

    return { ...header, lines };
  }

  static async createGrn(data: z.infer<typeof createGrnSchema>, userId: string) {
    return db.transaction(async (tx) => {
      const grnNumber = await generateGrnNumber(tx);

      const [grn] = await tx
        .insert(goodsReceipts)
        .values({
          grnNumber,
          warehouseId: data.warehouseId,
          supplierId: data.supplierId,
          notes: data.notes,
          status: 'DRAFT',
          createdBy: userId,
        })
        .returning();

      await tx.insert(goodsReceiptLines).values(
        data.lines.map((line) => ({
          grnId: grn.id,
          productId: line.productId,
          qty: line.qty,
        }))
      );

      await AuditService.log({
        userId,
        action: 'BUAT_GRN',
        entity: 'GRN',
        entityId: grn.id,
        description: `Membuat draft dokumen penerimaan barang ${grn.grnNumber}`,
      }, tx);

      return grn;
    });
  }

  static async confirmGrn(grnId: string, userId: string) {
    const grn = await this.getGrnById(grnId);

    if (grn.status !== 'DRAFT') {
      throw new BadRequestError(`GRN tidak bisa di-confirm karena status saat ini: ${grn.status}`);
    }

    await db.transaction(async (tx) => {
      // Setiap line → adjustStock (IN) dalam 1 transaksi yang sama
      for (const line of grn.lines) {
        await InventoryService.adjustStock(
          {
            productId: line.productId,
            warehouseId: grn.warehouseId,
            type: 'IN',
            qty: line.qty,
            refType: 'GRN',
            refId: grnId,
            notes: `GRN Confirm: ${grn.grnNumber}`,
            userId,
          },
          tx
        );
      }

      await tx
        .update(goodsReceipts)
        .set({ status: 'CONFIRMED', confirmedAt: sql`now()`, updatedAt: sql`now()` })
        .where(eq(goodsReceipts.id, grnId));

      await AuditService.log({
        userId,
        action: 'KONFIRMASI_GRN',
        entity: 'GRN',
        entityId: grnId,
        description: `Mengonfirmasi penerimaan barang ${grn.grnNumber} (Stok bertambah di ${grn.warehouseName})`,
      }, tx);
    });

    return this.getGrnById(grnId);
  }

  static async cancelGrn(grnId: string, userId: string) {
    const grn = await this.getGrnById(grnId);

    if (grn.status !== 'DRAFT') {
      throw new BadRequestError(`GRN hanya bisa dibatalkan saat status DRAFT. Status saat ini: ${grn.status}`);
    }

    await db
      .update(goodsReceipts)
      .set({ status: 'CANCELLED', updatedAt: sql`now()` })
      .where(eq(goodsReceipts.id, grnId));

    await AuditService.log({
      userId,
      action: 'BATALKAN_GRN',
      entity: 'GRN',
      entityId: grnId,
      description: `Membatalkan dokumen penerimaan barang ${grn.grnNumber}`,
    });
  }
}
