import { z } from 'zod';

export const tenantSchema = z.object({
  id: z.string().min(1, 'Tenant ID is required'),
  name: z.string().min(1, 'Tenant name is required'),
  prefix: z
    .string()
    .min(2)
    .max(5)
    .describe('Prefix for appointment IDs (e.g., ORT for ORTOFACCIA)'),
  business: z.object({
    location: z.string().min(1, 'Location is required'),
    phone: z.string().min(1, 'Phone is required'),
    timezone: z.string().min(1, 'Timezone is required'),
    description: z.string().optional(),
  }),
});

export type TenantConfig = z.infer<typeof tenantSchema>;
