import { z } from 'zod';

export const warehouseSchema = z.object({
  code: z.string().min(1, 'code diperlukan'),
  name: z.string().min(1, 'name diperlukan'),
  address: z.string().min(1, 'address diperlukan'),
});
