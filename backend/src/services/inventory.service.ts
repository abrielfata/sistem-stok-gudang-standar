import { db } from '../config/database.js';
import { stocks, stockMovements } from '../db/schema/inventory.schema.js';
import { products } from '../db/schema/product.schema.js';
import { warehouses } from '../db/schema/warehouse.schema.js';
import { eq, and, asc, sql } from 'drizzle-orm';
import { BadRequestError, NotFoundError } from '../errors/AppError.js';
import { allocateFifo, FifoItem } from '../helpers/fifo.helper.js';
import { AuditService } from './audit.service.js';

// Fix Transaction Type
type DBTransaction = any; 

export interface AdjustStockInput {
  productId: string;
  warehouseId: string;
  type: 'IN' | 'OUT';
  qty: number;
  refType: string;
  refId: string;
  notes?: string;
  userId: string;
}

export class InventoryService {
  /**
   * SATU-SATUNYA PINTU PERUBAHAN STOK
   */
  static async adjustStock(input: AdjustStockInput, externalTx?: DBTransaction) {
    if (input.qty <= 0) {
      throw new BadRequestError('Qty must be greater than 0');
    }

    const process = async (tx: DBTransaction) => {
      // 1. Cek stok saat ini
      const [currentStock] = await tx
        .select()
        .from(stocks)
        .where(
          and(
            eq(stocks.productId, input.productId),
            eq(stocks.warehouseId, input.warehouseId)
          )
        )
        // Penggunaan FOR UPDATE agar aman dari race condition (Concurrency handling)
        .for('update');

      let currentQty = currentStock?.qtyAvailable || 0;

      // 2. Kalau type OUT: pastikan qty_available >= qty
      if (input.type === 'OUT' && currentQty < input.qty) {
        throw new BadRequestError(`Stok tidak cukup. Tersedia: ${currentQty}, Dibutuhkan: ${input.qty}`);
      }

      const newQty = input.type === 'IN' 
        ? currentQty + input.qty 
        : currentQty - input.qty;

      // 3. Update stocks (Upsert)
      const [updatedStock] = await tx
        .insert(stocks)
        .values({
          productId: input.productId,
          warehouseId: input.warehouseId,
          qtyAvailable: newQty,
        })
        .onConflictDoUpdate({
          target: [stocks.productId, stocks.warehouseId],
          set: {
            qtyAvailable: newQty,
            updatedAt: sql`now()`,
          },
        })
        .returning();

      // 4. Insert stock_movements
      await tx.insert(stockMovements).values({
        productId: input.productId,
        warehouseId: input.warehouseId,
        type: input.type,
        qty: input.qty,
        refType: input.refType,
        refId: input.refId,
        notes: input.notes,
        createdBy: input.userId,
      });

      // 5. Catat Audit Log
      await AuditService.log(
        {
          userId: input.userId,
          action: input.type === 'IN' ? 'STOK_MASUK' : 'STOK_KELUAR',
          entity: input.refType,
          entityId: input.refId,
          description: input.notes || `Mutasi ${input.type} ${input.qty} unit pada stok`,
        },
        tx
      );

      return updatedStock;
    };

    if (externalTx) {
      return process(externalTx);
    }
    return db.transaction(process);
  }

  static async getStocks(warehouseId?: string) {
    const filters = [];
    if (warehouseId) {
      filters.push(eq(stocks.warehouseId, warehouseId));
    }

    const data = await db
      .select({
        id: stocks.id,
        productId: stocks.productId,
        productName: products.name,
        productSku: products.sku,
        warehouseId: stocks.warehouseId,
        warehouseName: warehouses.name,
        qtyAvailable: stocks.qtyAvailable,
        updatedAt: stocks.updatedAt,
      })
      .from(stocks)
      .innerJoin(products, eq(stocks.productId, products.id))
      .innerJoin(warehouses, eq(stocks.warehouseId, warehouses.id))
      .where(filters.length > 0 ? and(...filters) : undefined)
      .orderBy(products.name);

    return data;
  }

  static async getKartuStok(productId: string, warehouseId: string) {
    const data = await db
      .select({
        id: stockMovements.id,
        type: stockMovements.type,
        qty: stockMovements.qty,
        refType: stockMovements.refType,
        refId: stockMovements.refId,
        notes: stockMovements.notes,
        createdAt: stockMovements.createdAt,
      })
      .from(stockMovements)
      .where(
        and(
          eq(stockMovements.productId, productId),
          eq(stockMovements.warehouseId, warehouseId)
        )
      )
      .orderBy(asc(stockMovements.createdAt));

    let runningBalance = 0;
    return data.map((mov: any) => {
      if (mov.type === 'IN') {
        runningBalance += mov.qty;
      } else {
        runningBalance -= mov.qty;
      }
      return {
        ...mov,
        balance: runningBalance,
      };
    });
  }

  static async getLowStock() {
    const data = await db
      .select({
        productId: stocks.productId,
        productName: products.name,
        productSku: products.sku,
        warehouseId: stocks.warehouseId,
        warehouseName: warehouses.name,
        qtyAvailable: stocks.qtyAvailable,
        minStock: products.minStock,
      })
      .from(stocks)
      .innerJoin(products, eq(stocks.productId, products.id))
      .innerJoin(warehouses, eq(stocks.warehouseId, warehouses.id))
      .where(sql`${stocks.qtyAvailable} < ${products.minStock}`)
      .orderBy(products.name);

    return data;
  }

  // Simplified FIFO Allocation (Virtual based on sum of OUT)
  static async getFifoAllocation(productId: string, warehouseId: string, requestedQty: number) {
    const movements = await db
      .select()
      .from(stockMovements)
      .where(
        and(
          eq(stockMovements.productId, productId),
          eq(stockMovements.warehouseId, warehouseId)
        )
      )
      .orderBy(asc(stockMovements.createdAt));

    let totalOut = movements
      .filter((m: any) => m.type === 'OUT')
      .reduce((sum: number, m: any) => sum + m.qty, 0);

    const inMovements = movements.filter((m: any) => m.type === 'IN');
    const fifoItems: FifoItem[] = [];

    for (const inMov of inMovements) {
      if (totalOut >= inMov.qty) {
        // This IN movement is fully consumed
        totalOut -= inMov.qty;
      } else {
        // Partially or fully available
        const available = inMov.qty - totalOut;
        fifoItems.push({ id: inMov.id, availableQty: available });
        totalOut = 0; // all OUT consumed
      }
    }

    return allocateFifo(fifoItems, requestedQty);
  }
}
