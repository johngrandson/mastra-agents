/**
 * Public API for config management
 * Direct exports from config modules (no loaders/repositories needed)
 */

// Tenant configuration
export { getTenant, getAllTenants, tenantExists } from './tenants';

// Agent configuration
export { getAgent, getAgentsByTenant, getAllAgents, agentExists } from './agents';

// Types
export type { TenantConfig } from './schemas/tenant.schema';
export type { AgentConfig } from './schemas/agent.schema';
export type { IndustryMetadata } from './schemas/industry.schema';

// Schemas (for validation)
export { tenantSchema } from './schemas/tenant.schema';
export { agentSchema } from './schemas/agent.schema';
export { industryMetadataSchema, DEFAULT_DENTAL_INDUSTRY } from './schemas/industry.schema';
