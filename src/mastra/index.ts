import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { bookingWorkflow } from './workflows/booking-workflow';
import { createAgent } from '../core/agent-factory';
import { getAllAgents } from '../config';
import { join } from 'path';

// Create all agents dynamically from agent configs
function createTenantAgents() {
  const agentConfigs = getAllAgents();
  const agents: Record<string, any> = {};

  for (const agentConfig of agentConfigs) {
    agents[agentConfig.id] = createAgent(agentConfig.id);
  }

  return agents;
}

// Determine storage URL based on environment
function getStorageUrl(): string {
  // If MASTRA_CLOUD_STORAGE env is set, Mastra Cloud manages storage automatically
  if (process.env.MASTRA_CLOUD_STORAGE === 'true') {
    console.log('Using Mastra Cloud managed storage.');

    return ':memory:'; // Mastra Cloud will override this
  }

  // For local development: use persistent file storage
  const cwd = process.cwd();
  const baseDir = cwd.endsWith('.mastra/output') || cwd.includes('.mastra/output/')
    ? join(cwd, '../..') // Go up from .mastra/output to project root
    : cwd; // Already at project root

  return `file:${join(baseDir, '.mastra', 'mastra.db')}`;
}

// Export Mastra instance
export const mastra = new Mastra({
  workflows: {
    bookingWorkflow,
  },
  agents: {
    ...createTenantAgents(), // All tenant agents (can be multiple per tenant)
  },
  storage: new LibSQLStore({
    url: getStorageUrl(),
  }),
  logger: new PinoLogger({
    name: 'Mastra',
    level: 'info',
  }),
  telemetry: {
    serviceName: 'mastra-agents',
  },
});
