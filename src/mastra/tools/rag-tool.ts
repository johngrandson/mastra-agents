import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { generateQueryEmbedding } from '../rag/embedding-service';
import { TenantVectorStore } from '../../core/vector-store';
import { getTenant } from '../../config';

/**
 * Creates a tenant-aware RAG tool
 * Searches the knowledge base specific to a tenant
 */
export async function createRAGTool(tenantId: string) {
  const tenant = getTenant(tenantId);
  const vectorStore = new TenantVectorStore(tenantId);

  return createTool({
    id: 'rag-tool',
    description: `Search ${tenant.name} knowledge base for information about services, procedures, policies, company info, and FAQs. Use this to answer questions.`,
    inputSchema: z.object({
      query: z.string().describe('The question or topic to search for in the knowledge base'),
      topK: z
        .number()
        .optional()
        .default(3)
        .describe('Number of relevant results to return (default: 3)'),
    }),
    outputSchema: z.object({
      results: z.array(
        z.object({
          content: z.string(),
          source: z.string(),
          category: z.string(),
          relevance: z.number(),
        })
      ),
      summary: z.string(),
    }),
    execute: async ({ context }) => {
      return await searchKnowledgeBase(vectorStore, context.query, context.topK || 3);
    },
  });
}

async function searchKnowledgeBase(
  vectorStore: TenantVectorStore,
  query: string,
  topK: number = 3
): Promise<{
  results: Array<{
    content: string;
    source: string;
    category: string;
    relevance: number;
  }>;
  summary: string;
}> {
  try {
    // Step 1: Generate embedding for the query
    const queryEmbedding = await generateQueryEmbedding(query);

    // Step 2: Query the vector store (tenant-filtered)
    const searchResults = await vectorStore.query(queryEmbedding, topK);

    // Step 3: Format results
    const results = searchResults.map(result => ({
      content: result.text,
      source: result.metadata.filename,
      category: result.metadata.category,
      relevance: result.similarity,
    }));

    // Step 4: Create summary
    const summary = createSummary(results, query);

    return {
      results,
      summary,
    };
  } catch (error) {
    console.error('Error searching knowledge base:', error);

    // Return empty results with error message
    return {
      results: [],
      summary: `Não encontrei informações sobre "${query}" na base de conhecimento. Pode ser que a base ainda não tenha sido inicializada. Execute o script de seed.`,
    };
  }
}

function createSummary(
  results: Array<{ content: string; category: string; relevance: number }>,
  query: string
): string {
  if (results.length === 0) {
    return `Nenhuma informação encontrada para: ${query}`;
  }

  const topResult = results[0];
  const categories = [...new Set(results.map(r => r.category))];

  let summary = `Encontrei ${results.length} resultado(s) relevante(s) sobre "${query}" nas seguintes categorias: ${categories.join(', ')}.\n\n`;

  summary += `Informação mais relevante:\n${topResult.content.substring(0, 300)}...`;

  return summary;
}

/**
 * Helper function to format RAG results for agent consumption
 */
export function formatRAGResultsForAgent(results: {
  results: Array<{
    content: string;
    source: string;
    category: string;
    relevance: number;
  }>;
  summary: string;
}): string {
  if (results.results.length === 0) {
    return results.summary;
  }

  let formatted = `Resultados da Base de Conhecimento:\n\n`;

  results.results.forEach((result, index) => {
    formatted += `--- Resultado ${index + 1} (${result.category}) ---\n`;
    formatted += `${result.content}\n\n`;
  });

  return formatted;
}

// Lazy initialization - tool is created on first access
let ragToolInstance: Awaited<ReturnType<typeof createRAGTool>> | null = null;

export async function getRagTool() {
  if (!ragToolInstance) {
    ragToolInstance = await createRAGTool('ortofaccia');
  }
  return ragToolInstance;
}
