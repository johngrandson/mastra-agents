import { openai } from '@ai-sdk/openai';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { LibSQLStore } from '@mastra/libsql';
import { join } from 'path';
import { getAgent, getTenant } from '../config';
import { getTools } from './tool-registry';

/**
 * Creates a configured agent
 * Framework-agnostic core logic that can be ported to Next.js
 */
export async function createAgent(agentId: string): Promise<Agent> {
  // Load agent configuration
  const agentConfig = getAgent(agentId);

  console.log(`[agent-factory] Creating agent: ${agentId}, tenantId: ${agentConfig.tenantId}`);

  // Load tenant for context
  const tenant = getTenant(agentConfig.tenantId);

  // Build full instructions from prompt + instructions array
  const fullInstructions = [
    agentConfig.prompt,
    '',
    '# Contexto do Negócio',
    `- Empresa: ${tenant.name}`,
    `- Descrição: ${tenant.business.description || 'N/A'}`,
    `- Localização: ${tenant.business.location}`,
    `- Telefone: ${tenant.business.phone}`,
    '',
    '# Instruções',
    ...agentConfig.instructions,
  ].join('\n');

  // Get LLM model
  const model = openai(agentConfig.llm.model);

  // Get tools configured for this agent
  const tools = await getTools(agentConfig.tools, agentConfig.tenantId);

  // Create memory storage
  // Determine correct path based on whether running from bundled output
  const cwd = process.cwd();
  const baseDir =
    cwd.endsWith('.mastra/output') || cwd.includes('.mastra/output/')
      ? join(cwd, '../..') // Go up from .mastra/output to project root
      : cwd; // Already at project root

  const memory = new Memory({
    storage: new LibSQLStore({
      url: `file:${join(baseDir, '.mastra', 'mastra.db')}`,
    }),
  });

  // Create and return agent
  return new Agent({
    name: agentConfig.name,
    instructions: fullInstructions,
    model,
    tools: Object.fromEntries(tools.map(t => [t.id, t])),
    memory,
  });
}
