import { IAgentRepository } from './agent-repository.interface';
import { AgentConfig } from '../../config/schemas/agent.schema';

/**
 * In-Memory Implementation of Agent Repository
 *
 * This implementation stores agent data directly in memory.
 * Uses Map data structure for O(1) lookups by ID.
 * Uses secondary index for tenant lookups.
 *
 * Data is defined inline - no external JSON files needed.
 * Perfect for development, testing, and production (no database needed).
 */
export class InMemoryAgentRepository implements IAgentRepository {
  private agents: Map<string, AgentConfig> = new Map();
  private tenantIndex: Map<string, Set<string>> = new Map();

  constructor() {
    // Initialize with agent data
    this.seedAgents();
  }

  /**
   * Seed initial agent data
   */
  private seedAgents(): void {
    const agents: AgentConfig[] = [
      {
        id: 'ortofaccia-booking',
        tenantId: 'ortofaccia',
        name: 'ORTOFACCIA - Agente de Agendamento',
        prompt: 'Você é um assistente profissional de agendamento para ORTOFACCIA Odontologia.',
        instructions: [
          '⚠️ REGRA CRÍTICA: SEJA CONCISO',
          'NUNCA faça information dumping - não despeje todas as informações de uma vez',
          'Responda APENAS o que foi perguntado',
          'Progressive disclosure - revele informações passo a passo',
          'Conversa natural - fale como recepcionista humana, não como folheto',
          'Brevidade - máximo 2-3 linhas para perguntas simples',
          '',
          '# O QUE VOCÊ PODE FAZER',
          '- Agendar consultas (consultando disponibilidade)',
          '- Fornecer informações gerais da base de conhecimento',
          '- Explicar políticas e procedimentos',
          '- Responder perguntas frequentes',
          '',
          '# O QUE VOCÊ NÃO PODE FAZER',
          '- Fazer diagnósticos',
          '- Receitar medicamentos',
          '- Fornecer orçamentos (exceto valor da consulta inicial se fornecido)',
          '- Garantir resultados de tratamentos',
          '',
          '# WORKFLOW',
          '1. Saudação calorosa (1 linha apenas)',
          '2. Deixar paciente explicar a necessidade',
          '3. Responder a pergunta específica',
          '4. Fazer perguntas de acompanhamento se necessário',
          '5. Divulgação progressiva: mencionar políticas apenas quando relevante',
          '',
          '# BUSCA NA BASE DE CONHECIMENTO',
          '- SEMPRE consulte a base de conhecimento (ragTool) antes de responder',
          "- Se não encontrar informação específica: 'Não encontrei essa informação no momento. Vou encaminhar para um atendente humano'",
          '- NUNCA invente informações',
          '',
          '# QUANDO TRANSFERIR PARA HUMANO',
          '1. Cliente expressa insatisfação explícita com atendimento por IA',
          '2. Perguntas complexas não encontradas na base de conhecimento',
          '3. Negociações financeiras especiais',
          '4. Reclamações sobre serviços prestados',
          '5. Situações de emergência',
          '',
          'Lembre-se: Seja acolhedor, preciso e conciso. Consulte a base antes de responder.',
        ],
        language: 'pt-BR',
        tools: [
          'rag',
          'currentDateTime',
          'checkAvailability',
          'checkPatientAppointments',
          'bookAppointment',
          'sendConfirmation',
        ],
        llm: {
          model: 'gpt-4o-mini',
          temperature: 0.7,
        },
      },
    ];

    for (const agent of agents) {
      this.agents.set(agent.id, agent);

      // Update tenant index
      if (!this.tenantIndex.has(agent.tenantId)) {
        this.tenantIndex.set(agent.tenantId, new Set());
      }
      this.tenantIndex.get(agent.tenantId)!.add(agent.id);
    }
  }

  async findById(agentId: string): Promise<AgentConfig | undefined> {
    return this.agents.get(agentId);
  }

  async findByTenantId(tenantId: string): Promise<AgentConfig[]> {
    const agentIds = this.tenantIndex.get(tenantId);
    if (!agentIds) {
      return [];
    }

    return Array.from(agentIds)
      .map(id => this.agents.get(id))
      .filter((agent): agent is AgentConfig => agent !== undefined);
  }

  async getAll(): Promise<AgentConfig[]> {
    return Array.from(this.agents.values());
  }

  async save(agent: AgentConfig): Promise<void> {
    this.agents.set(agent.id, agent);

    // Update tenant index
    if (!this.tenantIndex.has(agent.tenantId)) {
      this.tenantIndex.set(agent.tenantId, new Set());
    }
    this.tenantIndex.get(agent.tenantId)!.add(agent.id);
  }

  async delete(agentId: string): Promise<boolean> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      return false;
    }

    // Remove from tenant index
    const agentIds = this.tenantIndex.get(agent.tenantId);
    if (agentIds) {
      agentIds.delete(agentId);
    }

    return this.agents.delete(agentId);
  }

  async exists(agentId: string): Promise<boolean> {
    return this.agents.has(agentId);
  }
}
