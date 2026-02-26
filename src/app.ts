import { AGENT_CARD_PATH } from '@a2a-js/sdk';
import { DefaultRequestHandler, InMemoryTaskStore } from '@a2a-js/sdk/server';
import { jsonRpcHandler, restHandler, UserBuilder } from '@a2a-js/sdk/server/express';
import type { Express } from 'express';
import express from 'express';
import { createAgent } from './agent.js';
import { ConsultationExecutor } from './capabilities/consultation.js';
import { generateAgentCard } from './card.js';

/** Configure logging level from environment */
const logLevel = (process.env.LOG_LEVEL || 'INFO').toUpperCase();
console.log(`A2A Agent initialized with log level: ${logLevel}`);

/** Create the AI agent and executor */
const agent = createAgent();
const agentExecutor = new ConsultationExecutor(agent);
const requestHandler = new DefaultRequestHandler(generateAgentCard(), new InMemoryTaskStore(), agentExecutor);

/** Setup Express app */
const app: Express = express();

// Dynamic AgentCard endpoint - generates URLs based on incoming request
app.get(`/${AGENT_CARD_PATH}`, (req, res) => {
  console.log(`📋 AgentCard requested from ${req.get('user-agent') || 'unknown'}`);
  res.json(generateAgentCard(req));
});

// Register A2A protocol endpoints
app.use('/a2a/jsonrpc', jsonRpcHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));
app.use('/a2a/rest', restHandler({ requestHandler, userBuilder: UserBuilder.noAuthentication }));

export default app;
