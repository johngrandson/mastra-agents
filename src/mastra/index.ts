import { Mastra } from '@mastra/core/mastra';
import { PinoLogger } from '@mastra/loggers';
import { LibSQLStore } from '@mastra/libsql';
import { bookingWorkflow } from './workflows/booking-workflow';
import { createAgent } from '../core/agent-factory';
import { getAllAgents } from '../config';

// Create all agents dynamically from agent configs (async)
async function createTenantAgents() {
  const agentConfigs = await getAllAgents();
  const agents: Record<string, any> = {};

  for (const agentConfig of agentConfigs) {
    agents[agentConfig.id] = await createAgent(agentConfig.id);
  }

  return agents;
}

async function createMastraInstance() {
  const tenantAgents = await createTenantAgents();

  return new Mastra({
    workflows: {
      bookingWorkflow,
    },
    agents: {
      ...tenantAgents, // All tenant agents (can be multiple per tenant)
    },
    storage: new LibSQLStore({
      // stores telemetry, evals, ... into memory storage, if it needs to persist, change to file:../mastra.db
      url: ':memory:',
    }),
    logger: new PinoLogger({
      name: 'Mastra',
      level: 'info',
    }),
    telemetry: {
      serviceName: 'mastra-agents',
      sampling: {
        enabled: true,
      },
    },
  });
}

// Export Mastra instance using top-level await
export const mastra = await createMastraInstance();
