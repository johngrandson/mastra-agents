import { ITenantRepository } from './tenant-repository.interface';
import { TenantConfig } from '../../config/schemas/tenant.schema';

/**
 * In-Memory Implementation of Tenant Repository
 *
 * This implementation stores tenant data directly in memory.
 * Uses Map data structure for O(1) lookups.
 *
 * Data is defined inline - no external JSON files needed.
 * Perfect for development, testing, and production (no Redis needed).
 */
export class InMemoryTenantRepository implements ITenantRepository {
  private tenants: Map<string, TenantConfig> = new Map();

  constructor() {
    // Initialize with tenant data
    this.seedTenants();
  }

  /**
   * Seed initial tenant data
   */
  private seedTenants(): void {
    const tenants: TenantConfig[] = [
      {
        id: 'ortofaccia',
        name: 'ORTOFACCIA Odontologia',
        prefix: 'ORT',
        business: {
          location: 'João Pessoa, PB',
          phone: '(83) 99937-7938',
          timezone: 'America/Fortaleza',
          description:
            'Clínica Odontológica especializada em estética dental, ortodontia e próteses',
        },
      },
    ];

    for (const tenant of tenants) {
      this.tenants.set(tenant.id, tenant);
    }
  }

  async findById(tenantId: string): Promise<TenantConfig | undefined> {
    return this.tenants.get(tenantId);
  }

  async getAll(): Promise<TenantConfig[]> {
    return Array.from(this.tenants.values());
  }

  async save(tenant: TenantConfig): Promise<void> {
    this.tenants.set(tenant.id, tenant);
  }

  async delete(tenantId: string): Promise<boolean> {
    return this.tenants.delete(tenantId);
  }

  async exists(tenantId: string): Promise<boolean> {
    return this.tenants.has(tenantId);
  }
}
