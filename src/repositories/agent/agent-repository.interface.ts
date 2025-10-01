import { AgentConfig } from '../../config/schemas/agent.schema';

/**
 * Agent Repository Interface
 * Following Dependency Inversion Principle (DIP)
 *
 * This interface defines the contract for agent persistence,
 * allowing easy switching between implementations (in-memory, database, etc.)
 */
export interface IAgentRepository {
  /**
   * Find agent by ID
   */
  findById(agentId: string): Promise<AgentConfig | undefined>;

  /**
   * Find agents by tenant ID
   */
  findByTenantId(tenantId: string): Promise<AgentConfig[]>;

  /**
   * Get all agents
   */
  getAll(): Promise<AgentConfig[]>;

  /**
   * Save or update an agent
   */
  save(agent: AgentConfig): Promise<void>;

  /**
   * Delete an agent
   */
  delete(agentId: string): Promise<boolean>;

  /**
   * Check if agent exists
   */
  exists(agentId: string): Promise<boolean>;
}
