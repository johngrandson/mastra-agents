#!/usr/bin/env tsx

/**
 * Seed Knowledge Base Script - Multi-tenant Version
 *
 * This script loads tenant documentation, processes it into embeddings,
 * and stores it in the vector database for RAG functionality.
 *
 * Usage:
 *   npm run seed-kb <tenantId>
 *   Example: npm run seed-kb ortofaccia
 */

import 'dotenv/config';
import { loadDocuments, getTenantDocsPath, validateDirectory } from '../rag/document-loader';
import { processDocuments } from '../rag/embedding-service';
import { TenantVectorStore } from '../../core/vector-store';
import { getTenant } from '../../config';

async function seedKnowledgeBase(tenantId: string) {
  console.log('='.repeat(60));
  console.log(`Knowledge Base Seeding Script - Tenant: ${tenantId}`);
  console.log('='.repeat(60));

  try {
    // Step 1: Load tenant configuration
    console.log('\n[Step 1/6] Loading tenant configuration...');
    const tenant = getTenant(tenantId);
    console.log(`  • Name: ${tenant.name}`);
    console.log(`  • Location: ${tenant.business.location}`);
    console.log(`  • Description: ${tenant.business.description || 'N/A'}`);

    // Step 2: Validate docs directory
    console.log('\n[Step 2/6] Validating documentation directory...');
    const docsPath = getTenantDocsPath(tenantId);
    console.log(`Docs path: ${docsPath}`);

    const isValid = await validateDirectory(docsPath);
    if (!isValid) {
      throw new Error(
        `Documentation directory not found: ${docsPath}\n` +
          `Please ensure the /docs/tenants/${tenantId}/ directory exists with markdown files.`
      );
    }
    console.log('✓ Documentation directory validated');

    // Step 3: Load documents
    console.log('\n[Step 3/6] Loading documents...');
    const documents = await loadDocuments(docsPath);

    if (documents.length === 0) {
      throw new Error('No documents found in the documentation directory');
    }

    // Step 4: Process documents (chunk + embed)
    console.log('\n[Step 4/6] Processing documents...');
    const embeddedChunks = await processDocuments(documents, {
      chunkSize: 512,
      chunkOverlap: 50,
      preserveParagraphs: true,
    });

    // Step 5: Initialize vector store
    console.log('\n[Step 5/6] Initializing vector store...');
    const vectorStore = new TenantVectorStore(tenantId);
    await vectorStore.initialize();

    // Step 6: Upsert chunks to vector store
    console.log('\n[Step 6/6] Storing embeddings in vector database...');
    await vectorStore.upsertChunks(embeddedChunks);

    // Success summary
    console.log('\n' + '='.repeat(60));
    console.log('✓ Knowledge Base Seeding Complete!');
    console.log('='.repeat(60));
    console.log(`\nSummary:`);
    console.log(`  • Tenant: ${tenant.name} (${tenantId})`);
    console.log(`  • Location: ${tenant.business.location}`);
    console.log(`  • Documents processed: ${documents.length}`);
    console.log(`  • Chunks created: ${embeddedChunks.length}`);
    console.log(`  • Embedding dimensions: 1536`);
    console.log(`  • Vector store index: ${tenantId}_knowledge`);
    console.log(`  • Database: LibSQL (mastra.db)`);
    console.log(`\nThe knowledge base is now ready for use!`);
    console.log(`The agent can now use the RAG tool to search the knowledge base.`);
  } catch (error) {
    console.error('\n' + '='.repeat(60));
    console.error('✗ Error seeding knowledge base:');
    console.error('='.repeat(60));
    console.error(error);
    process.exit(1);
  }
}

// Run the seeding process
const tenantId = process.argv[2] || 'ortofaccia'; // Default to ortofaccia if no arg provided

seedKnowledgeBase(tenantId)
  .then(() => {
    console.log('\nExiting...');
    process.exit(0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
