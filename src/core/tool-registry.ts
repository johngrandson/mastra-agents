/**
 * Tool Registry for Multi-Industry Multi-Tenant AI Agents
 *
 * Provides:
 * - Namespaced tool organization (common, booking, industry-specific)
 * - Tool bundles for common use cases
 * - Backward compatibility with legacy tool names
 * - Industry-aware tool discovery
 *
 * Architecture:
 * - Tools are organized by namespace (common, booking, dental, legal, retail)
 * - Bundles group related tools for easy configuration
 * - Legacy names automatically mapped to namespaced versions
 */

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
  namespace: string;
  category?: string;
  instance?: any;
  factory?: (tenantId: string) => Promise<any>;
}

/**
 * Tool registry for composable agent capabilities
 * Framework-agnostic - can be ported to Next.js
 */
const TOOL_REGISTRY: Record<string, ToolDefinition> = {
  // ===== COMMON TOOLS (All Industries) =====
  'common.rag': {
    id: 'ragTool',
    namespace: 'common',
    category: 'knowledge',
    factory: (tenantId: string) => createRAGTool(tenantId),
  },
  'common.currentDateTime': {
    id: 'currentDateTimeTool',
    namespace: 'common',
    category: 'utility',
    factory: (tenantId: string) => createCurrentDateTimeTool(tenantId),
  },

  // ===== BOOKING TOOLS (Multi-Industry) =====
  'booking.checkAvailability': {
    id: 'check-availability',
    namespace: 'booking',
    category: 'scheduling',
    instance: checkAvailabilityTool,
  },
  'booking.checkAppointments': {
    id: 'check-patient-appointments',
    namespace: 'booking',
    category: 'scheduling',
    factory: (tenantId: string) => createCheckPatientAppointmentsTool(tenantId),
  },
  'booking.bookAppointment': {
    id: 'book-appointment',
    namespace: 'booking',
    category: 'scheduling',
    factory: (tenantId: string) => createBookAppointmentTool(tenantId),
  },
  'booking.sendConfirmation': {
    id: 'send-confirmation',
    namespace: 'booking',
    category: 'notification',
    factory: (tenantId: string) => createSendConfirmationTool(tenantId),
  },

  // ===== DENTAL-SPECIFIC TOOLS =====
  // (Future: add dental-specific tools here)

  // ===== LEGAL-SPECIFIC TOOLS =====
  'legal.contractAnalysis': {
    id: 'contract-analysis',
    namespace: 'legal',
    category: 'analysis',
    factory: async (_tenantId: string) => {
      // Placeholder implementation
      return {
        id: 'contract-analysis',
        name: 'Contract Analysis Tool',
        description: 'Analyzes legal contracts for key clauses and risks',
        execute: async () => {
          return { message: 'Contract analysis tool (placeholder)' };
        },
      };
    },
  },
  'legal.caseSearch': {
    id: 'case-search',
    namespace: 'legal',
    category: 'search',
    factory: async (_tenantId: string) => {
      // Placeholder implementation
      return {
        id: 'case-search',
        name: 'Case Search Tool',
        description: 'Searches past legal cases and precedents',
        execute: async () => {
          return { message: 'Case search tool (placeholder)' };
        },
      };
    },
  },
  'legal.scheduleConsultation': {
    id: 'schedule-consultation',
    namespace: 'legal',
    category: 'scheduling',
    factory: async (_tenantId: string) => {
      // Placeholder implementation
      return {
        id: 'schedule-consultation',
        name: 'Schedule Legal Consultation',
        description: 'Schedules consultations with attorneys',
        execute: async () => {
          return { message: 'Schedule consultation tool (placeholder)' };
        },
      };
    },
  },

  // ===== RETAIL-SPECIFIC TOOLS =====
  // (Future: add retail-specific tools here)
};

/**
 * Tool Bundle Definitions
 *
 * Pre-defined sets of tools for common use cases.
 * Bundles are referenced in tenant.industry.toolBundles configuration.
 */
const TOOL_BUNDLES: Record<string, string[]> = {
  // Common bundles
  booking: [
    'common.rag',
    'common.currentDateTime',
    'booking.checkAvailability',
    'booking.checkAppointments',
    'booking.bookAppointment',
    'booking.sendConfirmation',
  ],

  // Industry-specific bundles
  'dental-specific': [],
  'legal-specific': ['legal.contractAnalysis', 'legal.caseSearch', 'legal.scheduleConsultation'],
  'retail-specific': [],
};

/**
 * Resolve tool bundles to individual tool names
 *
 * @param toolNamesOrBundles - Array of tool names or bundle names
 * @returns Array of resolved tool names (deduplicated)
 */
function resolveBundles(toolNamesOrBundles: string[]): string[] {
  const resolved: string[] = [];

  for (const name of toolNamesOrBundles) {
    if (TOOL_BUNDLES[name]) {
      // It's a bundle - expand it
      resolved.push(...TOOL_BUNDLES[name]);
    } else {
      // It's an individual tool
      resolved.push(name);
    }
  }

  // Deduplicate
  return Array.from(new Set(resolved));
}

/**
 * Get tools for a tenant based on tool names/bundles
 *
 * Supports:
 * - Namespaced tool names (e.g., 'common.rag')
 * - Tool bundles (e.g., 'booking' expands to 6 tools)
 *
 * @param toolNamesOrBundles - Array of tool names or bundle names
 * @param tenantId - Tenant ID for tenant-specific tool configuration
 * @returns Array of instantiated tool objects
 */
export async function getTools(toolNamesOrBundles: string[], tenantId: string): Promise<any[]> {
  // Resolve bundles to individual tool names
  const toolNames = resolveBundles(toolNamesOrBundles);

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

/**
 * Get tools by namespace (for discovery/debugging)
 *
 * @param namespace - Namespace to filter by
 * @returns Array of tool definitions in that namespace
 */
export function getToolsByNamespace(namespace: string): ToolDefinition[] {
  return Object.values(TOOL_REGISTRY).filter(tool => tool.namespace === namespace);
}

/**
 * Get available bundles for an industry
 *
 * @param industryType - Industry type (e.g., 'dental', 'legal')
 * @returns Array of bundle names available for that industry
 */
export function getBundlesForIndustry(industryType: string): string[] {
  // Map industry types to their available bundles
  const industryBundles: Record<string, string[]> = {
    dental: ['booking', 'dental-specific'],
    legal: ['booking', 'legal-specific'],
    retail: ['retail-specific'],
    real_estate: ['booking'],
    healthcare: ['booking'],
    education: ['booking'],
    finance: ['booking'],
  };

  return industryBundles[industryType] || [];
}

/**
 * Get all available tool bundles
 *
 * @returns Array of bundle names
 */
export function getAllBundles(): string[] {
  return Object.keys(TOOL_BUNDLES);
}
