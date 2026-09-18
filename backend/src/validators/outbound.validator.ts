import { z } from 'zod';

export const createSoLineSchema = z.object({
  productId: z.string().uuid('Product ID tidak valid'),
  qty: z.number().int().positive('Quantity harus lebih dari 0'),
});

export const createSoSchema = z.object({
  warehouseId: z.string().uuid('Warehouse ID tidak valid'),
  customerId: z.string().uuid('Customer ID tidak valid'),
  notes: z.string().optional(),
  lines: z.array(createSoLineSchema).min(1, 'Minimal satu barang'),
});
