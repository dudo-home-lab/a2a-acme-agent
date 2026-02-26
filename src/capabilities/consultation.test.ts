import assert from 'node:assert';
import { describe, it } from 'node:test';
import type { Message, TaskStatusUpdateEvent } from '@a2a-js/sdk';
import type { ExecutionEventBus } from '@a2a-js/sdk/server';
import { v4 as uuidv4 } from 'uuid';
import type { Agent } from '../agent.js';
import { ConsultationExecutor } from './consultation.js';

describe('ConsultationExecutor', () => {
  it('should publish a working status update then a response message', async () => {
    // Create a mock Agent
    const mockAgent = {
      processMessage: async (text: string) => `Mock response to: ${text}`,
      generateGreeting: async (name?: string) => `Hello ${name || 'World'}!`,
    } as Agent;

    const executor = new ConsultationExecutor(mockAgent);
    const publishedEvents: unknown[] = [];

    const mockEventBus = {
      publish: (event: unknown) => publishedEvents.push(event),
      finished: () => {},
      on: () => mockEventBus,
      off: () => mockEventBus,
      once: () => mockEventBus,
      removeAllListeners: () => mockEventBus,
    } as unknown as ExecutionEventBus;

    const taskId = uuidv4();
    const contextId = uuidv4();

    const mockContext = {
      taskId,
      contextId,
      userMessage: {
        kind: 'message' as const,
        messageId: uuidv4(),
        role: 'user' as const,
        parts: [{ kind: 'text' as const, text: 'Hello' }],
      },
      task: undefined,
    };

    await executor.execute(mockContext, mockEventBus);

    assert.strictEqual(publishedEvents.length, 2);

    // First event: working status update
    const statusUpdate = publishedEvents[0] as TaskStatusUpdateEvent;
    assert.strictEqual(statusUpdate.kind, 'status-update');
    assert.strictEqual(statusUpdate.status.state, 'working');
    assert.strictEqual(statusUpdate.final, false);
    assert.strictEqual(statusUpdate.taskId, taskId);
    assert.strictEqual(statusUpdate.contextId, contextId);

    // Second event: final message
    const message = publishedEvents[1] as Message;
    assert.strictEqual(message.kind, 'message');
    assert.strictEqual(message.role, 'agent');
    assert.ok(message.parts[0].kind === 'text');
    assert.ok((message.parts[0] as { text: string }).text.includes('Mock response'));
  });
});
