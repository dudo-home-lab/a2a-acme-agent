# A2A ACME Agent

An [Agent-to-Agent (A2A) protocol](https://github.com/google/A2A) implementation for the ACME system, built with TypeScript, Express, and the [`@a2a-js/sdk`](https://www.npmjs.com/package/@a2a-js/sdk).

## Features

- **A2A protocol v0.3.0** compliant
- **Agent card** served at the standard `/.well-known/agent-card.json` path for discovery
- **JSON-RPC 2.0** and **HTTP+JSON (REST)** transports
- **Task lifecycle events** — publishes `working` status before responding
- **Extensible** executor pattern for adding new skills
- **TypeScript** with strict type checking
- **Docker** containerized for easy deployment

## Getting Started

### Prerequisites

- Node.js 24+ (or Docker)
- npm

### Installation

```bash
npm install

# Or using Docker Compose
docker compose run --rm install
```

### Development

```bash
# Run locally with hot reload
npm run dev

# Or using Docker Compose (with file watching)
docker compose up app
```

The agent starts on port `4000` by default (configurable via `PORT`).

### Building

```bash
npm run build

# Or using Docker Compose
docker compose run --rm npm run build
```

### Testing

```bash
npm test
```

## Configuration

Copy `.env.example` to `.env` and adjust as needed.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | Port the server listens on |
| `PUBLIC_URL` | `http://localhost:PORT` | Publicly reachable base URL advertised in the agent card. **Must be set in non-local environments** so other agents can reach this one. |
| `LOG_LEVEL` | `INFO` | Logging level: `DEBUG`, `INFO`, `WARN`, `ERROR` |

## A2A Endpoints

| Endpoint | Description |
|---|---|
| `GET /.well-known/agent-card.json` | Agent card — capabilities, skills, and transport URLs |
| `POST /a2a/jsonrpc` | JSON-RPC 2.0 transport |
| `POST /a2a/rest` | HTTP+JSON (REST) transport |

### Discover the Agent Card

```bash
curl http://localhost:4000/.well-known/agent.json
```

### Send a Message (JSON-RPC)

```bash
curl -X POST http://localhost:4000/a2a/jsonrpc \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "message/send",
    "params": {
      "message": {
        "kind": "message",
        "messageId": "msg-1",
        "role": "user",
        "parts": [{ "kind": "text", "text": "Hello Alice" }]
      }
    },
    "id": 1
  }'
```

### Send a Message (REST)

```bash
curl -X POST http://localhost:4000/a2a/rest/message/send \
  -H "Content-Type: application/json" \
  -d '{
    "message": {
      "kind": "message",
      "messageId": "msg-1",
      "role": "user",
      "parts": [{ "kind": "text", "text": "Hello Alice" }]
    }
  }'
```

## Project Structure

```
a2a-acme-agent/
├── src/
│   ├── app.ts                    # Express app, agent card, and A2A endpoint registration
│   ├── index.ts                  # Entry point
│   └── capabilities/             # Agent skills
│       ├── hello.ts              # HelloExecutor — example skill implementation
│       └── hello.test.ts         # Tests for HelloExecutor
├── dist/                         # Compiled JavaScript (generated)
├── biome.json                    # Biome linter/formatter config
├── compose.yaml                  # Docker Compose configuration
├── Dockerfile                    # Docker image definition
├── package.json                  # Dependencies and scripts
└── tsconfig.json                 # TypeScript configuration
```

## Adding New Skills

### 1. Create an executor in `src/capabilities/`

```typescript
// src/capabilities/my-skill.ts
import { v4 as uuidv4 } from 'uuid';
import type { Message, TaskStatusUpdateEvent, TextPart } from '@a2a-js/sdk';
import type { AgentExecutor, RequestContext, ExecutionEventBus } from '@a2a-js/sdk/server';

export class MySkillExecutor implements AgentExecutor {
  async execute(requestContext: RequestContext, eventBus: ExecutionEventBus): Promise<void> {
    const { contextId, taskId } = requestContext;

    // Signal that work has started
    const working: TaskStatusUpdateEvent = {
      kind: 'status-update',
      taskId,
      contextId,
      status: { state: 'working' },
      final: false,
    };
    eventBus.publish(working);

    // ... do your work ...

    const response: Message = {
      kind: 'message',
      messageId: uuidv4(),
      role: 'agent',
      parts: [{ kind: 'text', text: 'Done!' }],
      contextId,
    };
    eventBus.publish(response);
    eventBus.finished();
  }

  async cancelTask(): Promise<void> {}
}
```

### 2. Register the skill in `src/app.ts`

Add an entry to the `skills` array in the agent card:

```typescript
{
  id: 'my-skill',
  name: 'My Skill',
  description: 'What this skill does',
  tags: ['tag1', 'tag2'],
  examples: ['example prompt 1', 'example prompt 2'],
}
```

Then wire up the executor to handle that skill's requests. For multiple skills you'll want to route based on `requestContext.userMessage` content or add a routing layer in front of `DefaultRequestHandler`.

## Docker Commands

```bash
# Install dependencies
docker compose run --rm install

# Run the agent
docker compose up app

# Run tests
docker compose run --rm test

# Run linter
docker compose run --rm lint

# Access npm
docker compose run --rm npm <command>
```

## License

MIT
