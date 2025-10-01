import { z } from 'zod';

export const agentSchema = z.object({
  id: z.string().min(1, 'Agent ID is required'),
  tenantId: z.string().min(1, 'Tenant ID is required'),
  name: z.string().min(1, 'Agent name is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  instructions: z.array(z.string()),
  language: z.string().min(2, 'Language code is required'),
  tools: z.array(z.string()),
  llm: z.object({
    model: z.string().min(1, 'Model is required'),
    temperature: z.number().min(0).max(2),
  }),
});

export type AgentConfig = z.infer<typeof agentSchema>;
