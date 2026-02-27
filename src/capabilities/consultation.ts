import type { AgentSkill } from '@a2a-js/sdk';
import type { Agent } from '../agent.js';
import { AIAgentExecutor } from './ai-agent-executor.js';

/**
 * Skill metadata for the goat farming consultation capability
 * This is the single source of truth for what this capability advertises
 */
export const chatSkill: AgentSkill = {
  id: 'goat-farming-consultation',
  name: 'Goat Farming Consultation',
  description: 'Expert advice on goat farming: breeds, health, feeding, breeding, dairy production, and farm management',
  tags: ['goats', 'farming', 'agriculture', 'livestock', 'dairy', 'expert'],
  examples: [
    'What breed of goat is best for dairy production?',
    'How much space do I need for 5 goats?',
    'What should I feed my pregnant doe?',
    'How do I prevent parasites in goats?',
  ],
};

/**
 * Consultation Executor
 * Provides expert consultation using AI
 * Domain expertise (goat farming) is configured via the Agent
 * Extends AIAgentExecutor to handle all A2A protocol boilerplate
 */
export class ConsultationExecutor extends AIAgentExecutor {
  constructor(agent: Agent) {
    super(agent, chatSkill.id);
  }
}
