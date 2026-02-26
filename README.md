# A2A ACME Agent

An AI-powered [Agent-to-Agent (A2A) protocol](https://github.com/google/A2A) agent built with TypeScript, Express, and the Vercel AI SDK.

## Getting Started

### Prerequisites

- Node.js 24+ (or Docker)
- Anthropic API key

### Installation

```bash
npm install
cp .env.sample .env
# Add your ANTHROPIC_API_KEY to .env
```

### Development

```bash
npm run dev
```

The agent starts on port `4000` by default.

## Configuration

| Variable | Required | Default | Description |
| --- | --- | --- | --- |
| `ANTHROPIC_API_KEY` | Yes | - | Your Anthropic API key |
| `ANTHROPIC_MODEL` | Yes | `claude-haiku-4-5` | Claude model to use |
| `PORT` | No | `4000` | Port the server listens on |
| `LOG_LEVEL` | No | `INFO` | Logging level |

## A2A Endpoints

| Endpoint | Description |
| --- | --- |
| `GET /.well-known/agent-card.json` | Agent card with dynamic URLs |
| `POST /a2a/jsonrpc` | JSON-RPC 2.0 transport |
| `POST /a2a/rest` | HTTP+JSON (REST) transport |

### Example

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
        "parts": [{ "kind": "text", "text": "Hello, how can you help me?" }]
      }
    },
    "id": 1
  }'
```
