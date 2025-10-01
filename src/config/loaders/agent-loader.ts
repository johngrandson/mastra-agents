import { type AgentConfig } from '../schemas/agent.schema';
import { IAgentRepository, InMemoryAgentRepository } from '../../repositories/agent';

/**
 * Agent Loader (Facade over Repository Pattern)
 *
 * This module provides a facade over the repository pattern,
 * maintaining backward compatibility while allowing easy switching
 * between different storage implementations (in-memory, database, etc.)
 *
 * Following Dependency Inversion Principle (DIP):
 * - High-level modules (config) depend on abstractions (IAgentRepository)
 * - Low-level modules (InMemory, Database) implement the abstraction
 */

/**
 * Repository Factory
 * Switch implementation here based on environment
 */
function getRepository(): IAgentRepository {
  // For now, only in-memory implementation is used
  // No Redis needed - agents are configuration data, not runtime state
  return new InMemoryAgentRepository();
}

// Singleton instance
const repository = getRepository();

// Cache initialized at module load
let agentsCache: Map<string, AgentConfig> | null = null;
let tenantIndex: Map<string, AgentConfig[]> | null = null;
let cacheInitPromise: Promise<void> | null = null;

async function initializeCache(): Promise<void> {
  if (agentsCache) return;

  const agents = await repository.getAll();
  agentsCache = new Map(agents.map(a => [a.id, a]));

  // Build tenant index
  tenantIndex = new Map();
  for (const agent of agents) {
    if (!tenantIndex.has(agent.tenantId)) {
      tenantIndex.set(agent.tenantId, []);
    }
    tenantIndex.get(agent.tenantId)!.push(agent);
  }
}

// Initialize cache immediately and store the promise
cacheInitPromise = initializeCache();

/**
 * Get agent by ID (async to ensure cache is initialized)
 */
export async function getAgent(agentId: string): Promise<AgentConfig> {
  // Ensure cache is initialized before accessing
  await cacheInitPromise;

  if (!agentsCache) {
    throw new Error('Agent cache not initialized');
  }

  const agent = agentsCache.get(agentId);

  if (!agent) {
    throw new Error(`Agent not found: ${agentId}`);
  }

  return agent;
}

/**
 * Get all agents for a specific tenant (async to ensure cache is initialized)
 */
export async function getAgentsByTenant(tenantId: string): Promise<AgentConfig[]> {
  // Ensure cache is initialized before accessing
  await cacheInitPromise;

  if (!tenantIndex) {
    throw new Error('Agent cache not initialized');
  }

  return tenantIndex.get(tenantId) || [];
}

/**
 * Get all agents (async to ensure cache is initialized)
 */
export async function getAllAgents(): Promise<AgentConfig[]> {
  // Ensure cache is initialized before accessing
  await cacheInitPromise;

  if (!agentsCache) {
    throw new Error('Agent cache not initialized');
  }

  return Array.from(agentsCache.values());
}
