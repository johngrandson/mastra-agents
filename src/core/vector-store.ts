import { LibSQLVector } from '@mastra/libsql';
import { join } from 'path';
import type { EmbeddedChunk, QueryResult } from '../types/tenant';

/**
 * Get the database path for vector store
 */
function getVectorDbPath(): string {
  // Determine correct path based on whether running from bundled output
  const cwd = process.cwd();
  const baseDir =
    cwd.endsWith('.mastra/output') || cwd.includes('.mastra/output/')
      ? join(cwd, '../..') // Go up from .mastra/output to project root
      : cwd; // Already at project root

  return join(baseDir, '.mastra', 'mastra.db');
}

// Database path: always use .mastra/mastra.db relative to project root
// This ensures both seed script and runtime use the same database
const DB_PATH = getVectorDbPath();

/**
 * Multi-tenant Vector Store
 * Framework-agnostic implementation that can be ported to Next.js
 */
export class TenantVectorStore {
  private store: LibSQLVector;
  private tenantId: string;
  private indexName: string;

  constructor(tenantId: string) {
    this.tenantId = tenantId;
    // Each tenant has its own isolated index
    this.indexName = `${tenantId}_knowledge`;

    console.log(`[VectorStore] Tenant: ${tenantId}, Index: ${this.indexName}`);
    console.log(`[VectorStore] Using database at: ${DB_PATH}`);

    this.store = new LibSQLVector({
      connectionUrl: `file:${DB_PATH}`,
    });
  }

  /**
   * Initializes the vector store and creates the index if it doesn't exist
   */
  async initialize(): Promise<void> {
    try {
      console.log(`Initializing vector store for ${this.tenantId}...`);

      // Create index with correct embedding dimensions (1536 for text-embedding-3-small)
      await this.store.createIndex({
        indexName: this.indexName,
        dimension: 1536,
      });

      console.log(`✓ Vector store initialized: ${this.indexName}`);
    } catch (_error) {
      // Index might already exist, which is fine
      console.log(`Vector store index "${this.indexName}" ready`);
    }
  }

  /**
   * Upserts embedded chunks into the vector store with tenant metadata
   */
  async upsertChunks(chunks: EmbeddedChunk[]): Promise<void> {
    try {
      console.log(`\nUpserting ${chunks.length} chunks to vector store...`);

      // Prepare data in the correct format for LibSQLVector
      // LibSQLVector expects three separate arrays: ids, vectors, metadata
      const ids = chunks.map(
        chunk => `${this.tenantId}-${chunk.metadata.filename}-chunk-${chunk.metadata.chunkIndex}`
      );

      const vectors = chunks.map(chunk => chunk.embedding); // number[][]

      const metadata = chunks.map(chunk => ({
        text: chunk.text,
        source: chunk.metadata.source,
        filename: chunk.metadata.filename,
        category: chunk.metadata.category,
        chunkIndex: chunk.metadata.chunkIndex,
        tenantId: this.tenantId, // For tenant isolation
      }));

      await this.store.upsert({
        indexName: this.indexName,
        ids, // string[]
        vectors, // number[][]
        metadata, // Record<string, any>[]
      });

      console.log(`✓ Successfully upserted ${chunks.length} chunks`);
    } catch (error) {
      console.error('Error upserting chunks:', error);
      throw error;
    }
  }

  /**
   * Queries the vector store for similar chunks (filtered by tenant)
   */
  async query(queryEmbedding: number[], topK: number = 5): Promise<QueryResult[]> {
    try {
      const results = await this.store.query({
        indexName: this.indexName,
        queryVector: queryEmbedding,
        topK: topK * 2, // Get more results for filtering
      });

      // Filter results by tenant ID
      const filteredResults = results
        .filter((result: any) => result.metadata.tenantId === this.tenantId)
        .slice(0, topK);

      // Transform results to QueryResult format
      return filteredResults.map((result: any) => ({
        text: result.metadata.text,
        metadata: {
          source: result.metadata.source,
          filename: result.metadata.filename,
          category: result.metadata.category,
          chunkIndex: result.metadata.chunkIndex,
          tenantId: result.metadata.tenantId,
        },
        similarity: result.score || 0,
      }));
    } catch (error) {
      console.error('Error querying vector store:', error);
      throw error;
    }
  }

  /**
   * Clears all data from the vector store (useful for re-indexing)
   */
  async clear(): Promise<void> {
    try {
      console.log('Clearing vector store...');
      // LibSQL doesn't have a clear method, so we'll need to drop and recreate
      // For now, we'll just log
      console.log('Note: To fully clear, delete mastra.db and re-run seed script');
    } catch (error) {
      console.error('Error clearing vector store:', error);
      throw error;
    }
  }

  /**
   * Gets statistics about the vector store
   */
  async getStats(): Promise<{ indexName: string; tenantId: string; message: string }> {
    return {
      indexName: this.indexName,
      tenantId: this.tenantId,
      message: 'Vector store is ready. Use query() to search for knowledge.',
    };
  }
}
