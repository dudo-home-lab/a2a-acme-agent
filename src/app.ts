import express from 'express';
import type { Express } from 'express';
import { AGENT_CARD_PATH } from '@a2a-js/sdk';
import type { AgentCard } from '@a2a-js/sdk';
import { DefaultRequestHandler, InMemoryTaskStore } from '@a2a-js/sdk/server';
import { agentCardHandler, jsonRpcHandler, restHandler, UserBuilder } from '@a2a-js/sdk/server/express';
import { HelloExecutor } from './capabilities/hello.js';

/** Configure logging level from environment */
const logLevel = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
console.log(`🤖 A2A Agent initialized with log level: ${logLevel}`);

/** Define the agent card */
const agentCard: AgentCard = {
  name: 'ACME Agent',
  description: 'An A2A agent for the ACME system',
  protocolVersion: '0.3.0',
  version: '0.1.0',
  url: `http://localhost:${process.env.PORT || 4000}/a2a/jsonrpc`,
  skills: [
    { 
      id: 'hello', 
      name: 'Hello', 
      description: 'Returns a friendly greeting', 
      tags: ['greeting', 'chat'] 
    },
  ],
  capabilities: {
    streaming: false,
    pushNotifications: false,
  },
  defaultInputModes: ['text'],
  defaultOutputModes: ['text'],
  additionalInterfaces: [
    { url: `http://localhost:${process.env.PORT || 4000}/a2a/jsonrpc`, transport: 'JSONRPC' },
    { url: `http://localhost:${process.env.PORT || 4000}/a2a/rest`, transport: 'HTTP+JSON' },
  ],
};

/** Create the agent executor and request handler */
const agentExecutor = new HelloExecutor();
const requestHandler = new DefaultRequestHandler(
  agentCard,
  new InMemoryTaskStore(),
  agentExecutor
);

/** Setup Express app */
const app: Express = express();

// Register A2A endpoints
app.use(`/${AGENT_CARD_PATH}`, agentCardHandler({ agentCardProvider: requestHandler }));
app.use('/a2a/jsonrpc', jsonRpcHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));
app.use('/a2a/rest', restHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));

export default app;
