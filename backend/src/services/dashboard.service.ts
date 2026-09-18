import { db } from '../config/database.js';
import { products } from '../db/schema/product.schema.js';
import { stocks, stockMovements } from '../db/schema/inventory.schema.js';
import { goodsReceipts } from '../db/schema/inbound.schema.js';
import { salesOrders } from '../db/schema/outbound.schema.js';
import { sql, isNull, and, gte, eq } from 'drizzle-orm';

export class DashboardService {
  static async getKpi() {
    // 1. Total SKU
    const [skuRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(isNull(products.deletedAt));

    // 2. Total Stok & Nilai Stok
    const [stockRes] = await db
      .select({
        totalStock: sql<number>`coalesce(sum(${stocks.qtyAvailable}), 0)`,
        stockValue: sql<number>`coalesce(sum(${stocks.qtyAvailable} * ${products.costPrice}), 0)`,
      })
      .from(stocks)
      .innerJoin(products, eq(stocks.productId, products.id))
      .where(isNull(products.deletedAt));

    // Hari ini (start of today)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 3. Inbound Hari Ini (Confirmed GRN)
    const [inboundRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(goodsReceipts)
      .where(and(eq(goodsReceipts.status, 'CONFIRMED'), gte(goodsReceipts.confirmedAt, today)));

    // 4. Outbound Hari Ini (Confirmed SO)
    const [outboundRes] = await db
      .select({ count: sql<number>`count(*)` })
      .from(salesOrders)
      .where(and(eq(salesOrders.status, 'CONFIRMED'), gte(salesOrders.confirmedAt, today)));

    return {
      totalSku: Number(skuRes.count),
      totalStock: Number(stockRes.totalStock),
      stockValue: Number(stockRes.stockValue),
      inboundToday: Number(inboundRes.count),
      outboundToday: Number(outboundRes.count),
    };
  }

  static async getActivity(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const movements = await db
      .select({
        date: sql<string>`to_char(${stockMovements.createdAt}, 'YYYY-MM-DD')`,
        type: stockMovements.type,
        qty: sql<number>`sum(${stockMovements.qty})`,
      })
      .from(stockMovements)
      .where(gte(stockMovements.createdAt, startDate))
      .groupBy(sql`to_char(${stockMovements.createdAt}, 'YYYY-MM-DD')`, stockMovements.type)
      .orderBy(sql`to_char(${stockMovements.createdAt}, 'YYYY-MM-DD')`);

    // Map into unified date items
    const dateMap: Record<string, { date: string; in: number; out: number }> = {};

    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const dateStr = d.toISOString().split('T')[0];
      dateMap[dateStr] = { date: dateStr, in: 0, out: 0 };
    }

    for (const m of movements) {
      if (dateMap[m.date]) {
        if (m.type === 'IN') dateMap[m.date].in = Number(m.qty);
        if (m.type === 'OUT') dateMap[m.date].out = Number(m.qty);
      }
    }

    return Object.values(dateMap);
  }
}
