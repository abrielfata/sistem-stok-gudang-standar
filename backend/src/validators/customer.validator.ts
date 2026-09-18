import { z } from 'zod';

export const customerSchema = z.object({
  code: z.string().min(1, 'code diperlukan'),
  name: z.string().min(1, 'name diperlukan'),
  phone: z.string().min(1, 'phone diperlukan'),
  email: z.string().min(1, 'email diperlukan'),
});
