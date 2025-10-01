/**
 * Mastra Tools
 * All tools available for agents
 */

// RAG tool
export { createRAGTool, getRagTool, formatRAGResultsForAgent } from './rag-tool';

// Booking tools
export {
  checkAvailabilityTool,
  createCheckPatientAppointmentsTool,
  createBookAppointmentTool,
  createSendConfirmationTool,
} from './booking';
