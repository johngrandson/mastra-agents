/**
 * Multi-tenant type definitions
 * Note: TenantConfig and AgentConfig are now exported from src/config
 */

export type { TenantConfig, AgentConfig } from '../config';
export type { Appointment } from './appointment';

export interface EmbeddedChunk {
  text: string;
  embedding: number[];
  metadata: {
    source: string;
    filename: string;
    category: string;
    chunkIndex: number;
    tenantId?: string;
    industry?: string;
    language?: string;
  };
}

export interface QueryResult {
  text: string;
  metadata: {
    source: string;
    filename: string;
    category: string;
    chunkIndex: number;
    tenantId?: string;
    industry?: string;
  };
  similarity: number;
}
