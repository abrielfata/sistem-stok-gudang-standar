import { db } from '../config/database.js';
import { goodsReceipts } from '../db/schema/inbound.schema.js';
import { salesOrders } from '../db/schema/outbound.schema.js';
import { sql } from 'drizzle-orm';

/**
 * Men-generate nomor dokumen dengan format PREFIX-YYYYMM-XXXX
 * Contoh: generateDocumentNumber('IN', new Date('2026-01-15'), 1) -> "IN-202601-0001"
 */
export function generateDocumentNumber(prefix: string, date: Date, sequence: number): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  
  // Format sequence 4 digit (0001, 0002, dst)
  const seqStr = String(sequence).padStart(4, '0');

  return `${prefix}-${year}${month}-${seqStr}`;
}

/**
 * Generate spesifik untuk GRN
 */
export async function generateGrnNumber(tx: any = db): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const prefixPattern = `IN-${year}${month}-%`;

  const [result] = await tx
    .select({ maxGrn: sql<string>`MAX(${goodsReceipts.grnNumber})` })
    .from(goodsReceipts)
    .where(sql`${goodsReceipts.grnNumber} LIKE ${prefixPattern}`);

  let nextSequence = 1;
  if (result?.maxGrn) {
    const parts = result.maxGrn.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }

  return generateDocumentNumber('IN', now, nextSequence);
}

/**
 * Generate spesifik untuk SO (Outbound)
 */
export async function generateSoNumber(tx: any = db): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  const prefixPattern = `OUT-${year}${month}-%`;

  const [result] = await tx
    .select({ maxSo: sql<string>`MAX(${salesOrders.soNumber})` })
    .from(salesOrders)
    .where(sql`${salesOrders.soNumber} LIKE ${prefixPattern}`);

  let nextSequence = 1;
  if (result?.maxSo) {
    const parts = result.maxSo.split('-');
    const lastSeq = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastSeq)) {
      nextSequence = lastSeq + 1;
    }
  }

  return generateDocumentNumber('OUT', now, nextSequence);
}
