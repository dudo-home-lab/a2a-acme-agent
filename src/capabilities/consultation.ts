import type { Message, TaskStatusUpdateEvent, TextPart, AgentSkill } from '@a2a-js/sdk';
import type { AgentExecutor, ExecutionEventBus, RequestContext } from '@a2a-js/sdk/server';
import { v4 as uuidv4 } from 'uuid';
import type { Agent } from '../agent.js';

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
 * Implements the AgentExecutor interface for providing expert consultation
 * Domain expertise (goat farming) is configured via the Agent
 */
export class ConsultationExecutor implements AgentExecutor {
  constructor(private agent: Agent) {}

  async execute(requestContext: RequestContext, eventBus: ExecutionEventBus): Promise<void> {
    const { userMessage, contextId, taskId } = requestContext;

    // Extract the user's message text for logging
    const userText = userMessage.parts
      .filter((part): part is TextPart => part.kind === 'text')
      .map((part) => part.text)
      .join(' ');

    console.log(`\n🔵 [Task ${taskId.substring(0, 8)}] Executing skill 'goat-farming-consultation'`);
    console.log(`   Context: ${contextId || 'none'}`);
    console.log(`   Message: "${userText.substring(0, 100)}${userText.length > 100 ? '...' : ''}"}`);

    // Signal to the client that the task is being processed.
    // referenceTasks (also in requestContext) carries prior turns for multi-turn contexts.
    const workingUpdate: TaskStatusUpdateEvent = {
      kind: 'status-update',
      taskId,
      contextId,
      status: { state: 'working' },
      final: false,
    };
    eventBus.publish(workingUpdate);

    try {
      // Use AI agent to generate intelligent response
      const startTime = Date.now();
      const responseText = await this.agent.processMessage(userText);
      const duration = Date.now() - startTime;

      console.log(`✅ [Task ${taskId.substring(0, 8)}] Response generated in ${duration}ms`);
      console.log(`   Response: "${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}"}`);

      // Create a response message
      const responseMessage: Message = {
        kind: 'message',
        messageId: uuidv4(),
        role: 'agent',
        parts: [
          {
            kind: 'text',
            text: responseText,
          },
        ],
        contextId,
      };

      eventBus.publish(responseMessage);
      eventBus.finished();
    } catch (error) {
      console.error(`❌ [Task ${taskId.substring(0, 8)}] Failed:`, error);
      const failedUpdate: TaskStatusUpdateEvent = {
        kind: 'status-update',
        taskId,
        contextId,
        status: {
          state: 'failed',
          message: {
            kind: 'message',
            messageId: uuidv4(),
            role: 'agent',
            parts: [
              { kind: 'text', text: `An error occurred: ${error instanceof Error ? error.message : String(error)}` },
            ],
            contextId,
          },
        },
        final: true,
      };
      eventBus.publish(failedUpdate);
      eventBus.finished();
    }
  }

  async cancelTask(): Promise<void> {
    // No-op: this executor is stateless and completes synchronously
  }
}
