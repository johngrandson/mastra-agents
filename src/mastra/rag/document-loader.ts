import { promises as fs } from 'fs';
import * as path from 'path';

export interface LoadedDocument {
  content: string;
  metadata: {
    source: string;
    filename: string;
    category: string;
  };
}

/**
 * Loads all markdown documents from a specified directory
 * @param directoryPath - Path to the directory containing documents
 * @returns Array of loaded documents with metadata
 */
export async function loadDocuments(directoryPath: string): Promise<LoadedDocument[]> {
  const documents: LoadedDocument[] = [];

  try {
    const files = await fs.readdir(directoryPath);

    for (const file of files) {
      // Only process markdown files
      if (!file.endsWith('.md')) {
        continue;
      }

      const filePath = path.join(directoryPath, file);
      const content = await fs.readFile(filePath, 'utf-8');

      // Extract category from filename (e.g., "company-info" from "company-info.md")
      const category = file.replace('.md', '').replace(/-/g, ' ');

      documents.push({
        content,
        metadata: {
          source: filePath,
          filename: file,
          category,
        },
      });

      console.log(`✓ Loaded document: ${file}`);
    }

    console.log(`\nTotal documents loaded: ${documents.length}`);
    return documents;
  } catch (error) {
    console.error(`Error loading documents from ${directoryPath}:`, error);
    throw error;
  }
}

/**
 * Loads a single document from a file path
 * @param filePath - Path to the document file
 * @returns Loaded document with metadata
 */
export async function loadDocument(filePath: string): Promise<LoadedDocument> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const filename = path.basename(filePath);
    const category = filename.replace('.md', '').replace(/-/g, ' ');

    return {
      content,
      metadata: {
        source: filePath,
        filename,
        category,
      },
    };
  } catch (error) {
    console.error(`Error loading document ${filePath}:`, error);
    throw error;
  }
}

/**
 * Validates that a directory exists and is readable
 * @param directoryPath - Path to validate
 * @returns True if directory is valid
 */
export async function validateDirectory(directoryPath: string): Promise<boolean> {
  try {
    const stats = await fs.stat(directoryPath);
    return stats.isDirectory();
  } catch (_error) {
    return false;
  }
}

/**
 * Gets the documents directory for a specific tenant
 * @param tenantId - Tenant identifier
 * @returns Absolute path to tenant docs directory
 */
export function getTenantDocsPath(tenantId: string): string {
  // Path: docs/tenants/{tenantId}/
  return path.join(process.cwd(), 'docs', 'tenants', tenantId);
}

/**
 * Gets the default Ortofaccia documents directory (legacy - for backward compatibility)
 * @returns Absolute path to Ortofaccia docs directory
 */
export function getOrtofacciaDocsPath(): string {
  // Use new structure
  return getTenantDocsPath('ortofaccia');
}
