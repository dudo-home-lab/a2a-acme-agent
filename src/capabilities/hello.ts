import type { Message, TaskStatusUpdateEvent, TextPart } from '@a2a-js/sdk';
import type { AgentExecutor, ExecutionEventBus, RequestContext } from '@a2a-js/sdk/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hello Agent Executor
 * Implements the AgentExecutor interface from the A2A SDK
 */
export class HelloExecutor implements AgentExecutor {
  async execute(requestContext: RequestContext, eventBus: ExecutionEventBus): Promise<void> {
    const { userMessage, contextId, taskId } = requestContext;

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
      // Extract the user's message text
      const userText = userMessage.parts
        .filter((part): part is TextPart => part.kind === 'text')
        .map((part) => part.text)
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
            text: `Hello, ${name}! This is an A2A agent. The time is ${new Date().toISOString()}.`,
          },
        ],
        contextId,
      };

      eventBus.publish(responseMessage);
      eventBus.finished();
    } catch (error) {
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
