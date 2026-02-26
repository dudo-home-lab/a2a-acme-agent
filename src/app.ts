import { readFileSync } from 'node:fs';
import type { AgentCard } from '@a2a-js/sdk';
import { AGENT_CARD_PATH } from '@a2a-js/sdk';
import { DefaultRequestHandler, InMemoryTaskStore } from '@a2a-js/sdk/server';
import { jsonRpcHandler, restHandler, UserBuilder } from '@a2a-js/sdk/server/express';
import type { Express, Request } from 'express';
import express from 'express';
import { createAgent } from './agent.js';
import { HelloExecutor } from './capabilities/hello.js';

/** Read package.json for agent metadata */
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));

/** Configure logging level from environment */
const logLevel = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
console.log(`A2A Agent initialized with log level: ${logLevel}`);

/**
 * Generate AgentCard dynamically or statically
 * @param req Optional request to derive base URL from
 * @returns AgentCard with appropriate URLs
 */
function generateAgentCard(req?: Request): AgentCard {
  // If request provided, use it to determine base URL
  // Otherwise, fallback to localhost (for initial setup)
  const baseUrl = req ? `${req.protocol}://${req.get('host')}` : `http://localhost:${process.env.PORT || 4000}`;

  return {
    name: pkg.name || 'ACME Agent',
    description: pkg.description,
    url: `${baseUrl}/a2a/jsonrpc`,
    protocolVersion: '0.3.0',
    version: pkg.version,
    provider: {
      organization: 'ACME Corp',
      url: 'https://acme.example.com',
    },
    documentationUrl: 'https://acme.example.com/docs/a2a-agent',
    skills: [
      {
        id: 'chat',
        name: 'Chat',
        description: 'AI-powered conversational responses for any query or topic',
        tags: ['chat', 'assistant', 'general'],
        examples: ['Hello', 'Tell me about ACME', 'What can you help me with?', 'How does this work?'],
      },
    ],
    capabilities: {
      streaming: false,
      pushNotifications: false,
    },
    defaultInputModes: ['text'],
    defaultOutputModes: ['text'],
    additionalInterfaces: [
      { url: `${baseUrl}/a2a/jsonrpc`, transport: 'JSONRPC' },
      { url: `${baseUrl}/a2a/rest`, transport: 'HTTP+JSON' },
    ],
  };
}

/** Create the AI agent and executor */
const agent = createAgent();
const agentExecutor = new HelloExecutor(agent);
const requestHandler = new DefaultRequestHandler(generateAgentCard(), new InMemoryTaskStore(), agentExecutor);

/** Setup Express app */
const app: Express = express();

// Request logging middleware
app.use((req, res, next) => {
  const caller = req.get('user-agent') || 'unknown';
  const method = req.method;
  const path = req.path;
  console.log(`[${new Date().toISOString()}] ${method} ${path} from ${caller}`);
  next();
});

// Dynamic AgentCard endpoint - generates URLs based on incoming request
app.get(`/${AGENT_CARD_PATH}`, (req, res) => {
  const agentCard = generateAgentCard(req);
  console.log(`📋 AgentCard requested from ${req.get('user-agent') || 'unknown'}`);
  res.json(agentCard);
});

// Register A2A protocol endpoints
app.use('/a2a/jsonrpc', jsonRpcHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));
app.use('/a2a/rest', restHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));

export default app;
