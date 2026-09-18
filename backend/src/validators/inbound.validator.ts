import { z } from 'zod';

export const createGrnLineSchema = z.object({
  productId: z.string().uuid('Product ID tidak valid'),
  qty: z.number().int().positive('Quantity harus lebih dari 0'),
});

export const createGrnSchema = z.object({
  warehouseId: z.string().uuid('Warehouse ID tidak valid'),
  supplierId: z.string().uuid('Supplier ID tidak valid'),
  notes: z.string().optional(),
  lines: z.array(createGrnLineSchema).min(1, 'Minimal satu barang'),
});
