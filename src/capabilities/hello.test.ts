import { describe, it } from 'node:test';
import assert from 'node:assert';
import { v4 as uuidv4 } from 'uuid';
import { HelloExecutor } from './hello.js';
import type { Message } from '@a2a-js/sdk';
import type { ExecutionEventBus } from '@a2a-js/sdk/server';

describe('HelloExecutor', () => {
  it('should publish a hello message', async () => {
    const executor = new HelloExecutor();
    const publishedEvents: unknown[] = [];

    const mockEventBus: ExecutionEventBus = {
      publish: (event: unknown) => publishedEvents.push(event),
      finished: () => {},
    };

    const mockContext = {
      taskId: uuidv4(),
      contextId: uuidv4(),
      userMessage: {
        kind: 'message' as const,
        messageId: uuidv4(),
        role: 'user' as const,
        parts: [{ kind: 'text' as const, text: 'Hello' }],
      },
      task: undefined,
    };

    await executor.execute(mockContext, mockEventBus);

    assert.strictEqual(publishedEvents.length, 1);
    const message = publishedEvents[0] as Message;
    assert.strictEqual(message.kind, 'message');
    assert.strictEqual(message.role, 'agent');
    assert.ok(message.parts[0].kind === 'text');
    assert.ok((message.parts[0] as { text: string }).text.includes('Hello'));
  });
});
