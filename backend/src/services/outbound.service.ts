import { db } from '../config/database.js';
import { salesOrders, salesOrderLines } from '../db/schema/outbound.schema.js';
import { products } from '../db/schema/product.schema.js';
import { customers } from '../db/schema/customer.schema.js';
import { warehouses } from '../db/schema/warehouse.schema.js';
import { eq, and, ilike, sql, desc, asc } from 'drizzle-orm';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';
import { InventoryService } from './inventory.service.js';
import { generateSoNumber } from '../helpers/document-number.helper.js';
import { PaginationParams } from '../helpers/pagination.helper.js';
import { z } from 'zod';
import { createSoSchema } from '../validators/outbound.validator.js';

import { AuditService } from './audit.service.js';

export class OutboundService {
  static async listSo(params: PaginationParams & { status?: string }) {
    const { page, perPage, search, sort, order, status } = params;
    const offset = (page - 1) * perPage;

    const filters: any[] = [];
    if (status) filters.push(eq(salesOrders.status, status as any));
    if (search) filters.push(ilike(salesOrders.soNumber, `%${search}%`));

    const sortMap = {
      createdAt: salesOrders.createdAt,
      soNumber: salesOrders.soNumber,
      status: salesOrders.status,
    } as const;
    const sortCol = sort ? (sortMap[sort as keyof typeof sortMap] ?? salesOrders.createdAt) : salesOrders.createdAt;
    const orderBy = order === 'asc' ? asc(sortCol) : desc(sortCol);

    const whereClause = filters.length > 0 ? and(...filters) : undefined;

    const data = await db
      .select({
        id: salesOrders.id,
        soNumber: salesOrders.soNumber,
        status: salesOrders.status,
        notes: salesOrders.notes,
        warehouseId: salesOrders.warehouseId,
        warehouseName: warehouses.name,
        customerId: salesOrders.customerId,
        customerName: customers.name,
        createdAt: salesOrders.createdAt,
        confirmedAt: salesOrders.confirmedAt,
      })
      .from(salesOrders)
      .innerJoin(warehouses, eq(salesOrders.warehouseId, warehouses.id))
      .innerJoin(customers, eq(salesOrders.customerId, customers.id))
      .where(whereClause)
      .limit(perPage)
      .offset(offset)
      .orderBy(orderBy);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(salesOrders)
      .where(whereClause);

    return {
      data,
      meta: { page, perPage, total: Number(count), totalPages: Math.ceil(Number(count) / perPage) },
    };
  }

  static async getSoById(id: string) {
    const [header] = await db
      .select({
        id: salesOrders.id,
        soNumber: salesOrders.soNumber,
        status: salesOrders.status,
        notes: salesOrders.notes,
        warehouseId: salesOrders.warehouseId,
        warehouseName: warehouses.name,
        customerId: salesOrders.customerId,
        customerName: customers.name,
        createdAt: salesOrders.createdAt,
        confirmedAt: salesOrders.confirmedAt,
      })
      .from(salesOrders)
      .innerJoin(warehouses, eq(salesOrders.warehouseId, warehouses.id))
      .innerJoin(customers, eq(salesOrders.customerId, customers.id))
      .where(eq(salesOrders.id, id))
      .limit(1);

    if (!header) throw new NotFoundError('Sales Order tidak ditemukan');

    const lines = await db
      .select({
        id: salesOrderLines.id,
        productId: salesOrderLines.productId,
        productName: products.name,
        productSku: products.sku,
        qty: salesOrderLines.qty,
      })
      .from(salesOrderLines)
      .innerJoin(products, eq(salesOrderLines.productId, products.id))
      .where(eq(salesOrderLines.soId, id));

    return { ...header, lines };
  }

  static async createSo(data: z.infer<typeof createSoSchema>, userId: string) {
    return db.transaction(async (tx: any) => {
      const soNumber = await generateSoNumber(tx);

      const [so] = await tx
        .insert(salesOrders)
        .values({
          soNumber,
          warehouseId: data.warehouseId,
          customerId: data.customerId,
          notes: data.notes,
          status: 'DRAFT',
          createdBy: userId,
        })
        .returning();

      await tx.insert(salesOrderLines).values(
        data.lines.map((line: any) => ({
          soId: so.id,
          productId: line.productId,
          qty: line.qty,
        }))
      );

      await AuditService.log({
        userId,
        action: 'BUAT_SO',
        entity: 'SO',
        entityId: so.id,
        description: `Membuat draft Sales Order ${so.soNumber}`,
      }, tx);

      return so;
    });
  }

  static async confirmSo(soId: string, userId: string) {
    const so = await this.getSoById(soId);

    if (so.status !== 'DRAFT') {
      throw new BadRequestError(`SO tidak bisa di-confirm karena status saat ini: ${so.status}`);
    }

    await db.transaction(async (tx: any) => {
      // Validasi dan kurangi stok untuk setiap line
      for (const line of so.lines) {
        // Cek alokasi FIFO jika diperlukan catatan pergerakan batch
        let fifoAllocNotes = '';
        try {
          const allocations = await InventoryService.getFifoAllocation(line.productId, so.warehouseId, line.qty);
          fifoAllocNotes = allocations.map((a) => `[Batch:${a.id.slice(0, 6)} Qty:${a.qty}]`).join(', ');
        } catch {
          // Fallback if no specific batch found, let adjustStock handle validation
        }

        await InventoryService.adjustStock(
          {
            productId: line.productId,
            warehouseId: so.warehouseId,
            type: 'OUT',
            qty: line.qty,
            refType: 'SO',
            refId: soId,
            notes: `SO Confirm: ${so.soNumber} ${fifoAllocNotes}`.trim(),
            userId,
          },
          tx
        );
      }

      await tx
        .update(salesOrders)
        .set({ status: 'CONFIRMED', confirmedAt: sql`now()`, updatedAt: sql`now()` })
        .where(eq(salesOrders.id, soId));

      await AuditService.log({
        userId,
        action: 'KONFIRMASI_SO',
        entity: 'SO',
        entityId: soId,
        description: `Mengonfirmasi pengiriman barang SO ${so.soNumber} (Stok berkurang di ${so.warehouseName})`,
      }, tx);
    });

    return this.getSoById(soId);
  }

  static async cancelSo(soId: string, userId: string) {
    const so = await this.getSoById(soId);

    if (so.status !== 'DRAFT') {
      throw new BadRequestError(`SO hanya bisa dibatalkan saat status DRAFT. Status saat ini: ${so.status}`);
    }

    await db
      .update(salesOrders)
      .set({ status: 'CANCELLED', updatedAt: sql`now()` })
      .where(eq(salesOrders.id, soId));

    await AuditService.log({
      userId,
      action: 'BATALKAN_SO',
      entity: 'SO',
      entityId: soId,
      description: `Membatalkan dokumen Sales Order ${so.soNumber}`,
    });
  }
}
