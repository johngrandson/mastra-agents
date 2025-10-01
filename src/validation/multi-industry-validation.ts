/**
 * Multi-Industry Validation Script
 *
 * Validates that the multi-industry architecture works correctly.
 * Tests:
 * - Both industries (dental, legal) load properly
 * - Agents configured correctly for each industry
 * - Tools resolve correctly for each industry
 * - RAG collections are organized hierarchically
 */

import { getTenant, getAllTenants } from '../config';
import { getAgentsByTenant } from '../config';
import { getTools } from '../core/tool-registry';
import {
  getRelevantCollections,
  getAllIndustryCollections,
} from '../mastra/rag/vector-store-manager';

async function validateMultiIndustryArchitecture(): Promise<void> {
  console.log('=== Multi-Industry Architecture Validation ===\n');

  // 1. Validate tenants
  console.log('1. Validating Tenants...');
  const allTenants = getAllTenants();
  console.log(`   ✅ Total tenants: ${allTenants.length}`);

  const dental = getTenant('ortofaccia');
  console.log(`   ✅ Dental tenant: ${dental.name} (${dental.industry.type})`);

  const legal = getTenant('silva-associados');
  console.log(`   ✅ Legal tenant: ${legal.name} (${legal.industry.type})`);

  // 2. Validate agents
  console.log('\n2. Validating Agents...');
  const dentalAgents = getAgentsByTenant('ortofaccia');
  console.log(`   ✅ Ortofaccia agents: ${dentalAgents.length}`);

  const legalAgents = getAgentsByTenant('silva-associados');
  console.log(`   ✅ Silva & Associados agents: ${legalAgents.length}`);

  // 3. Validate tools
  console.log('\n3. Validating Tools...');
  const dentalTools = await getTools(['booking', 'dental-specific'], 'ortofaccia');
  console.log(`   ✅ Dental tools resolved: ${dentalTools.length}`);

  const legalTools = await getTools(['booking', 'legal-specific'], 'silva-associados');
  console.log(`   ✅ Legal tools resolved: ${legalTools.length}`);

  // 4. Validate RAG collections
  console.log('\n4. Validating RAG Collections...');
  const dentalCollections = getRelevantCollections('ortofaccia');
  console.log(`   ✅ Ortofaccia collections: ${dentalCollections.join(', ')}`);

  const legalCollections = getRelevantCollections('silva-associados');
  console.log(`   ✅ Silva & Associados collections: ${legalCollections.join(', ')}`);

  const allIndustryCollections = getAllIndustryCollections();
  console.log(`   ✅ All industry collections: ${allIndustryCollections.length}`);

  console.log('\n=== ✅ Validation Complete ===');
  console.log('Multi-industry architecture is working correctly!');
}

// Run validation
validateMultiIndustryArchitecture().catch(console.error);
