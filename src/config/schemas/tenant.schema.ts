import { z } from 'zod';
import { industryMetadataSchema, DEFAULT_DENTAL_INDUSTRY } from './industry.schema';

export const tenantSchema = z.object({
  id: z.string().min(1, 'Tenant ID is required'),
  name: z.string().min(1, 'Tenant name is required'),
  prefix: z
    .string()
    .min(2)
    .max(5)
    .describe('Prefix for appointment IDs (e.g., ORT for Ortofaccia)'),

  // NEW: Industry configuration with default for backward compatibility
  industry: industryMetadataSchema.default(DEFAULT_DENTAL_INDUSTRY),

  business: z.object({
    location: z.string().min(1, 'Location is required'),
    phone: z.string().min(1, 'Phone is required'),
    timezone: z.string().min(1, 'Timezone is required'),
    description: z.string().optional(),

    // NEW: Flexible metadata for industry-specific fields
    metadata: z.record(z.any()).optional(),
  }),
});

export type TenantConfig = z.infer<typeof tenantSchema>;
