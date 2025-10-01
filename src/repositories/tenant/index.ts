/**
 * Tenant Repository Module
 *
 * Exports repository interface and implementations following
 * Dependency Inversion Principle (DIP)
 */

export { ITenantRepository } from './tenant-repository.interface';
export { InMemoryTenantRepository } from './in-memory-tenant.repository';
export { RedisTenantRepository } from './redis-tenant.repository';
