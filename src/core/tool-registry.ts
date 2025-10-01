import {
  checkAvailabilityTool,
  createCheckPatientAppointmentsTool,
  createBookAppointmentTool,
  createSendConfirmationTool,
} from '../mastra/tools/booking';
import { createRAGTool } from '../mastra/tools/rag-tool';
import { createCurrentDateTimeTool } from '../mastra/tools/current-datetime-tool';

interface ToolDefinition {
  id: string;
  instance?: any;
  factory?: (tenantId: string) => Promise<any>;
}

/**
 * Tool registry for composable agent capabilities
 * Framework-agnostic - can be ported to Next.js
 */
const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  rag: {
    id: 'ragTool',
    factory: (tenantId: string) => createRAGTool(tenantId),
  },
  currentDateTime: {
    id: 'currentDateTimeTool',
    factory: (tenantId: string) => createCurrentDateTimeTool(tenantId),
  },
  checkAvailability: {
    id: 'check-availability',
    instance: checkAvailabilityTool,
  },
  checkPatientAppointments: {
    id: 'check-patient-appointments',
    factory: (tenantId: string) => createCheckPatientAppointmentsTool(tenantId),
  },
  bookAppointment: {
    id: 'book-appointment',
    factory: (tenantId: string) => createBookAppointmentTool(tenantId),
  },
  sendConfirmation: {
    id: 'send-confirmation',
    factory: (tenantId: string) => createSendConfirmationTool(tenantId),
  },
};

/**
 * Get tools for a specific tenant based on tool names
 */
export async function getTools(toolNames: string[], tenantId: string): Promise<any[]> {
  const tools = await Promise.all(
    toolNames.flatMap(async name => {
      const toolDef = TOOL_REGISTRY[name];
      if (!toolDef) {
        console.warn(`Tool not found in registry: ${name}`);
        return [];
      }

      // If tool needs tenant context, use factory
      if (toolDef.factory) {
        return [await toolDef.factory(tenantId)];
      }

      // Otherwise use shared instance
      return [toolDef.instance];
    })
  );

  return tools.flat();
}
