import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(1, 'name diperlukan'),
  code: z.string().min(1, 'code diperlukan'),
});
