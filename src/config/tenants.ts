/**
 * Tenant Configuration
 *
 * Direct configuration access - no repository pattern needed for static data.
 * Simplified from 3-layer architecture (Repository → Loader → Consumer) to direct access.
 */

import { type TenantConfig } from './schemas/tenant.schema';

/**
 * Tenant data
 */
const TENANTS: TenantConfig[] = [
  {
    id: 'ortofaccia',
    name: 'Ortofaccia Odontologia',
    prefix: 'ORT',
    industry: {
      type: 'dental',
      toolBundles: ['booking', 'dental-specific'],
      agentTemplates: ['booking-agent'],
      config: {
        specialties: ['general', 'orthodontics', 'cosmetic', 'prosthetics', 'surgery'],
      },
      knowledgeSources: {
        industryKnowledge: true,
        tenantKnowledge: true,
      },
    },
    business: {
      location: 'João Pessoa, PB',
      phone: '(83) 99937-7938',
      timezone: 'America/Fortaleza',
      description: 'Clínica Odontológica especializada em estética dental, ortodontia e próteses',
      metadata: {
        team: [
          {
            name: 'Dra. Larissa Lucena',
            specialties: ['general', 'cosmetic'],
          },
          {
            name: 'Dra. Maria Julia',
            specialties: ['general', 'orthodontics', 'cosmetic'],
          },
          {
            name: 'Dra. Joelma Porto',
            specialties: ['general', 'prosthetics', 'surgery'],
          },
        ],
        insuranceAccepted: ['Dental Center', 'Dental Gold', 'Unidentis', 'SulAmérica', 'Camed'],
      },
    },
  },
  {
    id: 'silva-associados',
    name: 'Silva & Associados Advocacia',
    prefix: 'SIL',
    industry: {
      type: 'legal',
      toolBundles: ['booking', 'legal-specific'],
      agentTemplates: ['booking-agent-template', 'legal-contract-review-template'],
      config: {
        practiceAreas: ['civil', 'criminal', 'corporate', 'family', 'real_estate'],
        consultationDuration: 60, // minutes
      },
      knowledgeSources: {
        industryKnowledge: true,
        tenantKnowledge: true,
      },
    },
    business: {
      location: 'São Paulo, SP',
      phone: '(11) 3456-7890',
      timezone: 'America/Sao_Paulo',
      description:
        'Escritório de advocacia full-service especializado em direito empresarial e civil',
      metadata: {
        attorneys: [
          {
            name: 'Dr. João Silva',
            practiceAreas: ['civil', 'corporate'],
            bar: 'OAB/SP 123456',
          },
          {
            name: 'Dra. Maria Santos',
            practiceAreas: ['criminal', 'family'],
            bar: 'OAB/SP 234567',
          },
          {
            name: 'Dr. Carlos Oliveira',
            practiceAreas: ['real_estate', 'corporate'],
            bar: 'OAB/SP 345678',
          },
        ],
        languages: ['pt-BR', 'en', 'es'],
        insuranceAccepted: ['Allianz Direito Legal', 'Bradesco Advocacia'],
      },
    },
  },
];

// Create Map for O(1) lookups
const tenantsMap = new Map<string, TenantConfig>(TENANTS.map(t => [t.id, t]));

/**
 * Get tenant by ID
 *
 * @param tenantId - Tenant ID
 * @returns Tenant configuration
 * @throws Error if tenant not found
 */
export function getTenant(tenantId: string): TenantConfig {
  const tenant = tenantsMap.get(tenantId);

  if (!tenant) {
    const availableTenants = Array.from(tenantsMap.keys()).join(', ');
    console.error(
      `[Tenants] Tenant not found: "${tenantId}". Available tenants: [${availableTenants}]`
    );
    throw new Error(`Tenant not found: ${tenantId}`);
  }

  return tenant;
}

/**
 * Get all tenants
 *
 * @returns Array of all tenant configurations
 */
export function getAllTenants(): TenantConfig[] {
  return TENANTS;
}

/**
 * Check if tenant exists
 *
 * @param tenantId - Tenant ID
 * @returns True if tenant exists
 */
export function tenantExists(tenantId: string): boolean {
  return tenantsMap.has(tenantId);
}
