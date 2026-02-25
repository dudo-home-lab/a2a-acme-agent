# A2A ACME Agent

An Agent-to-Agent (A2A) protocol implementation for the ACME system, built with TypeScript and Express.

## Features

- **JSON-RPC 2.0** compatible agent communication
- **Capability Discovery** via `/capabilities` endpoint
- **Extensible** capability system for adding new agent functions
- **TypeScript** with strict type checking
- **Docker** containerized for easy deployment
- **Hot Reload** for development

## Getting Started

### Prerequisites

- Node.js 24+ (or Docker)
- npm

### Installation

```bash
# Install dependencies
npm install

# Or using Docker Compose
docker compose run --rm install
```

### Development

```bash
# Run locally with hot reload
npm run dev

# Or using Docker Compose
docker compose up app
```

The agent will start on port `4000` by default (configurable via `PORT` environment variable).

### Building

```bash
# Build TypeScript
npm run build

# Or using Docker Compose
docker compose run --rm npm run build
```

### Testing

```bash
# Run tests and linting
npm test

# Or using Docker Compose
docker compose run --rm test
```

## Usage

### Health Check

```bash
curl http://localhost:4000/
```

Response:

```json
{
  "agent": "a2a-acme-agent",
  "version": "0.1.0",
  "status": "running"
}
```

### Discover Capabilities

```bash
curl http://localhost:4000/capabilities
```

Response:

```json
{
  "capabilities": [
    {
      "id": "hello",
      "description": "Returns a hello world message with optional name parameter"
    }
  ]
}
```

### Invoke a Capability (JSON-RPC)

```bash
curl -X POST http://localhost:4000/a2a \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "method": "hello",
    "params": { "name": "Alice" },
    "id": 1
  }'
```

Response:

```json
{
  "jsonrpc": "2.0",
  "result": {
    "message": "Hello, Alice! This is an A2A agent.",
    "timestamp": "2026-02-25T12:00:00.000Z"
  },
  "id": 1
}
```

## Project Structure

```sh
a2a-acme-agent/
├── src/
│   ├── app.ts                    # Express app initialization
│   ├── index.ts                  # Entry point
│   └── capabilities/             # Agent capabilities
│       ├── helpers.ts            # Type definitions and helpers
│       ├── index.ts              # Capability registration
│       ├── hello.ts              # Sample capability
│       └── hello.test.ts         # Sample tests
├── dist/                         # Compiled JavaScript (generated)
├── node_modules/                 # Dependencies (generated)
├── biome.json                    # Biome linter/formatter config
├── compose.yaml                  # Docker Compose configuration
├── Dockerfile                    # Docker image definition
├── package.json                  # Node.js dependencies and scripts
└── tsconfig.json                 # TypeScript configuration
```

## Adding New Capabilities

1. Create a new file in `src/capabilities/` (e.g., `my-capability.ts`)
2. Define your capability:

    ```typescript
    import type { Capability, CapabilityHandler } from './helpers.js';

    const myHandler: CapabilityHandler = async (params) => {
      // Your capability logic here
      return { result: 'success' };
    };

    export const myCapability: Capability = {
      id: 'my-capability',
      description: 'Description of what this capability does',
      handler: myHandler,
    };
    ```

3. Register it in `src/capabilities/index.ts`:

```typescript
import { myCapability } from './my-capability.js';

const capabilities: Capability[] = [
  helloCapability,
  myCapability, // Add here
];
```

## Environment Variables

- `PORT` - Server port (default: 4000)
- `LOG_LEVEL` - Logging level: DEBUG, INFO, WARN, ERROR (default: INFO)

## Docker Commands

```bash
# Install dependencies
docker compose run --rm install

# Run the app
docker compose up app

# Run tests
docker compose run --rm test

# Run linter
docker compose run --rm lint

# Access npm
docker compose run --rm npm <command>

# Access node
docker compose run --rm node <command>
```

## License

MIT
