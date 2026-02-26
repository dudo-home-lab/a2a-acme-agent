import { readFileSync } from 'node:fs';
import type { AgentCard } from '@a2a-js/sdk';
import type { Request } from 'express';
import { chatSkill } from './capabilities/hello.js';

/** Read package.json for agent metadata */
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));

/**
 * Generate AgentCard dynamically or statically
 * @param req Optional request to derive base URL from
 * @returns AgentCard with appropriate URLs
 */
export function generateAgentCard(req?: Request): AgentCard {
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
    skills: [chatSkill],
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
