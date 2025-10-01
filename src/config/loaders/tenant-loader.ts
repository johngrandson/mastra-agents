import { type TenantConfig } from '../schemas/tenant.schema';
import { ITenantRepository, InMemoryTenantRepository } from '../../repositories/tenant';

/**
 * Tenant Loader (Facade over Repository Pattern)
 *
 * This module provides a facade over the repository pattern,
 * maintaining backward compatibility while allowing easy switching
 * between different storage implementations (in-memory, Redis, etc.)
 *
 * Following Dependency Inversion Principle (DIP):
 * - High-level modules (config) depend on abstractions (ITenantRepository)
 * - Low-level modules (InMemory, Redis) implement the abstraction
 */

/**
 * Repository Factory
 * Switch implementation here based on environment
 */
function getRepository(): ITenantRepository {
  // TODO: In production, check environment variable to decide:
  // if (process.env.STORAGE_TYPE === 'redis') {
  //   return new RedisTenantRepository();
  // }
  return new InMemoryTenantRepository();
}

// Singleton instance
const repository = getRepository();

// Cache initialized at module load
let tenantsCache: Map<string, TenantConfig> | null = null;
let cacheInitPromise: Promise<void> | null = null;

async function initializeCache(): Promise<void> {
  if (tenantsCache) return;

  const tenants = await repository.getAll();
  tenantsCache = new Map(tenants.map(t => [t.id, t]));
}

// Initialize cache immediately and store the promise
cacheInitPromise = initializeCache();

/**
 * Get tenant by ID (async to ensure cache is initialized)
 */
export async function getTenant(tenantId: string): Promise<TenantConfig> {
  // Ensure cache is initialized before accessing
  await cacheInitPromise;

  if (!tenantsCache) {
    throw new Error('Tenant cache not initialized');
  }

  const tenant = tenantsCache.get(tenantId);

  if (!tenant) {
    const availableTenants = Array.from(tenantsCache.keys()).join(', ');
    console.error(
      `[TenantLoader] Tenant not found: "${tenantId}". Available tenants: [${availableTenants}]`
    );
    throw new Error(`Tenant not found: ${tenantId}`);
  }

  return tenant;
}

/**
 * Get all tenants (async to ensure cache is initialized)
 */
export async function getAllTenants(): Promise<TenantConfig[]> {
  // Ensure cache is initialized before accessing
  await cacheInitPromise;

  if (!tenantsCache) {
    throw new Error('Tenant cache not initialized');
  }

  return Array.from(tenantsCache.values());
}
