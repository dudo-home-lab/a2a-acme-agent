import { v4 as uuidv4 } from 'uuid';
import type { Message } from '@a2a-js/sdk';
import type { AgentExecutor, RequestContext, ExecutionEventBus } from '@a2a-js/sdk/server';

/**
 * Hello Agent Executor
 * Implements the AgentExecutor interface from the A2A SDK
 */
export class HelloExecutor implements AgentExecutor {
  async execute(requestContext: RequestContext, eventBus: ExecutionEventBus): Promise<void> {
    const { userMessage, contextId } = requestContext;

    // Extract the user's message text
    const userText = userMessage.parts
      .filter((part) => part.kind === 'text')
      .map((part) => (part as { text: string }).text)
      .join(' ');

    // Extract optional name parameter (simple greeting logic)
    const name = userText.replace(/hello|hi|hey/gi, '').trim() || 'World';

    // Create a response message
    const responseMessage: Message = {
      kind: 'message',
      messageId: uuidv4(),
      role: 'agent',
      parts: [
        { 
          kind: 'text', 
          text: `Hello, ${name}! This is an A2A agent. The time is ${new Date().toISOString()}.` 
        },
      ],
      contextId: contextId,
    };

    // Publish the message and signal completion
    eventBus.publish(responseMessage);
    eventBus.finished();
  }

  // Not needed for this simple, stateless agent
  async cancelTask(): Promise<void> {
    // No-op for simple agents
  }
}
