import { z } from 'zod';

/**
 * Industry Metadata Schema
 *
 * Defines industry-specific configuration for multi-tenant platform.
 * Each tenant belongs to one industry type.
 */
export const industryMetadataSchema = z.object({
  // Industry identifier
  type: z.enum(['dental', 'legal', 'retail', 'real_estate', 'healthcare', 'education', 'finance']),

  // Industry-specific configuration (flexible metadata)
  config: z.record(z.any()).optional(),

  // Tool bundles available for this industry
  toolBundles: z.array(z.string()).default([]),

  // Agent templates available for this industry
  agentTemplates: z.array(z.string()).default([]),

  // RAG knowledge sources configuration
  knowledgeSources: z
    .object({
      // Shared industry knowledge (e.g., all dental clinics share dental terminology)
      industryKnowledge: z.boolean().default(true),
      // Tenant-specific knowledge
      tenantKnowledge: z.boolean().default(true),
    })
    .default({
      industryKnowledge: true,
      tenantKnowledge: true,
    }),
});

export type IndustryMetadata = z.infer<typeof industryMetadataSchema>;

/**
 * Default industry metadata for dental (backward compatibility)
 */
export const DEFAULT_DENTAL_INDUSTRY: IndustryMetadata = {
  type: 'dental',
  toolBundles: ['booking', 'dental-specific'],
  agentTemplates: ['booking-agent'],
  config: {},
  knowledgeSources: {
    industryKnowledge: true,
    tenantKnowledge: true,
  },
};
