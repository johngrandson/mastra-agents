import { TenantConfig } from '../../config/schemas/tenant.schema';

/**
 * Tenant Repository Interface
 * Following Dependency Inversion Principle (DIP)
 *
 * This interface defines the contract for tenant persistence,
 * allowing easy switching between implementations (in-memory, Redis, database, etc.)
 */
export interface ITenantRepository {
  /**
   * Find tenant by ID
   */
  findById(tenantId: string): Promise<TenantConfig | undefined>;

  /**
   * Get all tenants
   */
  getAll(): Promise<TenantConfig[]>;

  /**
   * Save or update a tenant
   */
  save(tenant: TenantConfig): Promise<void>;

  /**
   * Delete a tenant
   */
  delete(tenantId: string): Promise<boolean>;

  /**
   * Check if tenant exists
   */
  exists(tenantId: string): Promise<boolean>;
}
