/**
 * Vector Store Manager for Hierarchical Knowledge Organization
 *
 * Organizes knowledge in two-tier hierarchy:
 * 1. Industry-level: Shared knowledge across all tenants in an industry
 * 2. Tenant-level: Specific knowledge for a single tenant
 *
 * Collection naming:
 * - Industry: `industry_{type}` (e.g., industry_dental, industry_legal)
 * - Tenant: `tenant_{id}` (e.g., tenant_ortofaccia, tenant_silva_associados)
 */

import { getTenant } from '../../config';

export type KnowledgeScope = 'industry' | 'tenant';

export interface VectorStoreConfig {
  scope: KnowledgeScope;
  industryType?: string; // For industry scope
  tenantId?: string; // For tenant scope
}

/**
 * Generate collection name based on scope
 *
 * @param config - Vector store configuration
 * @returns Collection name (e.g., 'industry_dental', 'tenant_ortofaccia')
 */
export function getCollectionName(config: VectorStoreConfig): string {
  if (config.scope === 'industry') {
    if (!config.industryType) {
      throw new Error('industryType required for industry scope');
    }
    return `industry_${config.industryType}`;
  } else {
    if (!config.tenantId) {
      throw new Error('tenantId required for tenant scope');
    }
    return `tenant_${config.tenantId}`;
  }
}

/**
 * Get relevant collections for a tenant
 *
 * Returns both industry and tenant collections based on tenant configuration.
 *
 * @param tenantId - Tenant ID
 * @returns Array of collection names to search
 */
export function getRelevantCollections(tenantId: string): string[] {
  const tenant = getTenant(tenantId);

  const collections: string[] = [];

  // Add industry collection if enabled
  if (tenant.industry.knowledgeSources.industryKnowledge) {
    collections.push(
      getCollectionName({
        scope: 'industry',
        industryType: tenant.industry.type,
      })
    );
  }

  // Add tenant collection if enabled
  if (tenant.industry.knowledgeSources.tenantKnowledge) {
    collections.push(
      getCollectionName({
        scope: 'tenant',
        tenantId: tenant.id,
      })
    );
  }

  return collections;
}

/**
 * Get all industry collection names
 *
 * @returns Array of supported industry collection names
 */
export function getAllIndustryCollections(): string[] {
  return [
    'industry_dental',
    'industry_legal',
    'industry_retail',
    'industry_real_estate',
    'industry_healthcare',
    'industry_education',
    'industry_finance',
  ];
}
