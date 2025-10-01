/**
 * Public API for config management
 * Centralized exports for all config-related functionality
 */

// Tenant loaders
export { getTenant, getAllTenants } from './loaders/tenant-loader';

// Agent loaders
export { getAgent, getAgentsByTenant, getAllAgents } from './loaders/agent-loader';

// Types
export type { TenantConfig } from './schemas/tenant.schema';
export type { AgentConfig } from './schemas/agent.schema';

// Schemas (for validation)
export { tenantSchema } from './schemas/tenant.schema';
export { agentSchema } from './schemas/agent.schema';
