import type { AgentCard } from '@a2a-js/sdk';
import { AGENT_CARD_PATH } from '@a2a-js/sdk';
import { DefaultRequestHandler, InMemoryTaskStore } from '@a2a-js/sdk/server';
import { agentCardHandler, jsonRpcHandler, restHandler, UserBuilder } from '@a2a-js/sdk/server/express';
import type { Express } from 'express';
import express from 'express';
import { HelloExecutor } from './capabilities/hello.js';

/** Configure logging level from environment */
const logLevel = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
console.log(`A2A Agent initialized with log level: ${logLevel}`);

/** Base URL used in the agent card — must be reachable by other agents */
const baseUrl = process.env.PUBLIC_URL || `http://localhost:${process.env.PORT || 4000}`;

/** Define the agent card */
const agentCard: AgentCard = {
  name: 'ACME Agent',
  description: 'An A2A agent for the ACME system',
  url: `${baseUrl}/a2a/jsonrpc`,
  protocolVersion: '0.3.0',
  version: '0.1.0',
  provider: {
    organization: 'ACME Corp',
    url: 'https://acme.example.com',
  },
  documentationUrl: 'https://acme.example.com/docs/a2a-agent',
  skills: [
    {
      id: 'hello',
      name: 'Hello',
      description: 'Returns a friendly greeting for any name or salutation',
      tags: ['greeting', 'chat'],
      examples: ['Hello', 'Hi Alice', 'Hey there', 'Say hello to Bob'],
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

/** Create the agent executor and request handler */
const agentExecutor = new HelloExecutor();
const requestHandler = new DefaultRequestHandler(agentCard, new InMemoryTaskStore(), agentExecutor);

/** Setup Express app */
const app: Express = express();

// Register A2A endpoints
app.use(`/${AGENT_CARD_PATH}`, agentCardHandler({ agentCardProvider: requestHandler }));
app.use('/a2a/jsonrpc', jsonRpcHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));
app.use('/a2a/rest', restHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));

export default app;
