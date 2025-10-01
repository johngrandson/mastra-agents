import { openai } from '@ai-sdk/openai';
import { embed } from 'ai';
import type { LoadedDocument } from './document-loader';

export interface DocumentChunk {
  text: string;
  metadata: {
    source: string;
    filename: string;
    category: string;
    chunkIndex: number;
  };
}

export interface EmbeddedChunk extends DocumentChunk {
  embedding: number[];
}

/**
 * Configuration for chunking strategy
 */
export interface ChunkingConfig {
  chunkSize: number;
  chunkOverlap: number;
  preserveParagraphs: boolean;
}

const DEFAULT_CHUNKING_CONFIG: ChunkingConfig = {
  chunkSize: 512, // tokens (approximately 2000 characters)
  chunkOverlap: 50, // tokens overlap between chunks
  preserveParagraphs: true,
};

/**
 * Chunks a document into smaller pieces for embedding
 * Uses a recursive character-based splitting strategy
 */
export function chunkDocument(
  document: LoadedDocument,
  config: ChunkingConfig = DEFAULT_CHUNKING_CONFIG
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];
  const { content, metadata } = document;

  // Simple chunking by paragraphs and character count
  // In production, consider using Mastra's built-in chunking strategies
  const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);

  let currentChunk = '';
  let chunkIndex = 0;

  for (const paragraph of paragraphs) {
    const trimmedParagraph = paragraph.trim();

    // If adding this paragraph exceeds chunk size, save current chunk and start new one
    if (currentChunk.length + trimmedParagraph.length > config.chunkSize * 4) {
      if (currentChunk.length > 0) {
        chunks.push({
          text: currentChunk.trim(),
          metadata: {
            ...metadata,
            chunkIndex,
          },
        });
        chunkIndex++;

        // Add overlap from previous chunk
        const words = currentChunk.split(' ');
        const overlapWords = words.slice(-Math.floor(config.chunkOverlap / 4));
        currentChunk = overlapWords.join(' ') + ' ';
      }
    }

    currentChunk += trimmedParagraph + '\n\n';
  }

  // Add final chunk if there's remaining content
  if (currentChunk.trim().length > 0) {
    chunks.push({
      text: currentChunk.trim(),
      metadata: {
        ...metadata,
        chunkIndex,
      },
    });
  }

  return chunks;
}

/**
 * Generates embeddings for document chunks using OpenAI
 * Note: Uses sequential embedding generation since embedMany is not available in bundled version
 */
export async function generateEmbeddings(chunks: DocumentChunk[]): Promise<EmbeddedChunk[]> {
  try {
    console.log(`Generating embeddings for ${chunks.length} chunks...`);

    const embeddedChunks: EmbeddedChunk[] = [];

    // Generate embeddings one by one (embedMany not available in bundled version)
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const { embedding } = await embed({
        model: openai.embedding('text-embedding-3-small'),
        value: chunk.text,
      });

      embeddedChunks.push({
        ...chunk,
        embedding,
      });

      // Show progress for better UX
      if ((i + 1) % 5 === 0 || i === chunks.length - 1) {
        console.log(`  Progress: ${i + 1}/${chunks.length} embeddings generated`);
      }
    }

    console.log(`✓ Generated ${embeddedChunks.length} embeddings`);
    return embeddedChunks;
  } catch (error) {
    console.error('Error generating embeddings:', error);
    throw error;
  }
}

/**
 * Generates embedding for a single query text
 */
export async function generateQueryEmbedding(query: string): Promise<number[]> {
  try {
    const { embedding } = await embed({
      model: openai.embedding('text-embedding-3-small'),
      value: query,
    });

    return embedding;
  } catch (error) {
    console.error('Error generating query embedding:', error);
    throw error;
  }
}

/**
 * Processes documents into embedded chunks
 * Complete pipeline: document → chunks → embeddings
 */
export async function processDocuments(
  documents: LoadedDocument[],
  config?: ChunkingConfig
): Promise<EmbeddedChunk[]> {
  console.log(`\nProcessing ${documents.length} documents...`);

  // Step 1: Chunk all documents
  let allChunks: DocumentChunk[] = [];
  for (const doc of documents) {
    const chunks = chunkDocument(doc, config);
    allChunks = allChunks.concat(chunks);
    console.log(`  ✓ Chunked ${doc.metadata.filename}: ${chunks.length} chunks`);
  }

  console.log(`\nTotal chunks created: ${allChunks.length}`);

  // Step 2: Generate embeddings for all chunks
  const embeddedChunks = await generateEmbeddings(allChunks);

  console.log(`\n✓ Processing complete!`);
  console.log(`  Documents: ${documents.length}`);
  console.log(`  Chunks: ${embeddedChunks.length}`);
  console.log(`  Embedding dimensions: ${embeddedChunks[0]?.embedding.length || 0}`);

  return embeddedChunks;
}
