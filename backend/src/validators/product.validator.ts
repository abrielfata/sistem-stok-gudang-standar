import { z } from 'zod';

export const productSchema = z.object({
  sku: z.string().min(1, 'SKU wajib diisi'),
  name: z.string().min(1, 'Nama produk wajib diisi'),
  categoryId: z.string().uuid('Category ID tidak valid').optional(),
  uomId: z.string().uuid('UoM ID tidak valid').optional(),
  minStock: z.number().int().nonnegative().default(0),
  costPrice: z.number().nonnegative().default(0),
  sellPrice: z.number().nonnegative().default(0),
});
