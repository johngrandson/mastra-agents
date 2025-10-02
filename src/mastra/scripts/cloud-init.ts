#!/usr/bin/env tsx

/**
 * Mastra Cloud Initialization Script
 *
 * This script runs automatically when the application starts in Mastra Cloud.
 * It ensures the knowledge base is populated before agents start handling requests.
 *
 * Usage:
 *   Automatically executed by Mastra Cloud during deployment
 *   Can also be run manually: npm run cloud-init
 */

import 'dotenv/config';
import { loadDocuments, getTenantDocsPath, validateDirectory } from '../rag/document-loader';
import { processDocuments } from '../rag/embedding-service';
import { TenantVectorStore } from '../../core/vector-store';
import { getAllTenants } from '../../config';

async function seedTenantKnowledgeBase(tenantId: string) {
  console.log(`\n📚 [${tenantId}] Starting knowledge base seeding...`);

  try {
    const docsPath = getTenantDocsPath(tenantId);

    // Check if docs directory exists
    const isValid = await validateDirectory(docsPath);
    if (!isValid) {
      console.warn(`⚠️  [${tenantId}] No documentation found at ${docsPath} - skipping`);
      return { success: false, reason: 'no_docs' };
    }

    // Load documents
    const documents = await loadDocuments(docsPath);
    if (documents.length === 0) {
      console.warn(`⚠️  [${tenantId}] No documents found - skipping`);
      return { success: false, reason: 'empty_docs' };
    }

    console.log(`  • Found ${documents.length} documents`);

    // Process documents (chunk + embed)
    const embeddedChunks = await processDocuments(documents, {
      chunkSize: 512,
      chunkOverlap: 50,
      preserveParagraphs: true,
    });

    console.log(`  • Created ${embeddedChunks.length} chunks`);

    // Initialize vector store
    const vectorStore = new TenantVectorStore(tenantId);
    await vectorStore.initialize();

    // Upsert chunks
    await vectorStore.upsertChunks(embeddedChunks);

    console.log(`✓ [${tenantId}] Knowledge base seeded successfully`);
    return {
      success: true,
      documents: documents.length,
      chunks: embeddedChunks.length
    };

  } catch (error) {
    console.error(`✗ [${tenantId}] Error seeding knowledge base:`, error);
    return { success: false, reason: 'error', error };
  }
}

async function initializeMastraCloud() {
  const isCloud = process.env.MASTRA_CLOUD_STORAGE === 'true';
  const skipSeed = process.env.SKIP_KNOWLEDGE_BASE_SEED === 'true';

  console.log('\n' + '='.repeat(70));
  console.log('🚀 Mastra Cloud Initialization');
  console.log('='.repeat(70));
  console.log(`Environment: ${isCloud ? 'Mastra Cloud' : 'Local Development'}`);
  console.log(`Knowledge Base Seeding: ${skipSeed ? 'DISABLED' : 'ENABLED'}`);
  console.log('='.repeat(70));

  if (skipSeed) {
    console.log('\n⏭️  Skipping knowledge base seeding (SKIP_KNOWLEDGE_BASE_SEED=true)');
    return;
  }

  try {
    // Get all tenants
    const tenants = getAllTenants();
    console.log(`\n📋 Found ${tenants.length} tenant(s) to initialize`);

    const results = [];

    // Seed knowledge base for each tenant
    for (const tenant of tenants) {
      const result = await seedTenantKnowledgeBase(tenant.id);
      results.push({ tenantId: tenant.id, ...result });
    }

    // Summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 Initialization Summary');
    console.log('='.repeat(70));

    const successful = results.filter(r => r.success);
    const skipped = results.filter(r => !r.success && r.reason === 'no_docs');
    const failed = results.filter(r => !r.success && r.reason === 'error');

    console.log(`✓ Successfully seeded: ${successful.length} tenant(s)`);
    if (skipped.length > 0) {
      console.log(`⚠️  Skipped (no docs): ${skipped.length} tenant(s)`);
    }
    if (failed.length > 0) {
      console.log(`✗ Failed: ${failed.length} tenant(s)`);
    }

    // Detailed stats for successful seeds
    if (successful.length > 0) {
      console.log('\nDetails:');
      for (const result of successful) {
        console.log(`  • ${result.tenantId}: ${result.documents} docs, ${result.chunks} chunks`);
      }
    }

    console.log('\n✅ Mastra Cloud initialization complete!');
    console.log('='.repeat(70));

    // Exit with error if any tenant failed
    if (failed.length > 0) {
      console.error('\n⚠️  Some tenants failed to initialize. Check logs above.');
      process.exit(1);
    }

  } catch (error) {
    console.error('\n' + '='.repeat(70));
    console.error('✗ Fatal error during initialization:');
    console.error('='.repeat(70));
    console.error(error);
    process.exit(1);
  }
}

// Run initialization
initializeMastraCloud()
  .then(() => {
    console.log('\n🎉 Ready to serve requests!');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
