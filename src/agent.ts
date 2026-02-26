import { anthropic } from '@ai-sdk/anthropic';
import { generateText, ToolLoopAgent, tool } from 'ai';
import { z } from 'zod';

/**
 * Autonomous AI agent for ACME A2A agent
 * Uses Vercel AI SDK ToolLoopAgent for proper agentic interactions
 */
export class Agent {
  private toolLoopAgent;
  private model: ReturnType<typeof anthropic>;

  constructor() {
    // Environment validation
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is required but not set');
    }
    if (!process.env.ANTHROPIC_MODEL) {
      throw new Error('ANTHROPIC_MODEL is required but not set');
    }

    // Initialize Anthropic model
    this.model = anthropic(process.env.ANTHROPIC_MODEL);

    // Initialize ToolLoopAgent with ACME-specific capabilities
    this.toolLoopAgent = new ToolLoopAgent({
      model: this.model,
      instructions: `You are a helpful ACME agent. You provide friendly, professional assistance to users.

Your role is to:
1. Understand user requests and respond helpfully
2. Use available tools when needed to provide better assistance
3. Keep responses concise and conversational (2-3 sentences)
4. Be professional but personable

Available tools:
- getCompanyInfo: Get information about ACME company
- generateCustomGreeting: Create personalized greetings for users`,
      tools: {
        getCompanyInfo: tool({
          description: 'Get information about ACME company, products, or services',
          inputSchema: z.object({
            topic: z.string().describe('The topic to get information about (e.g., company, products, services)'),
          }),
          execute: async (input: { topic: string }) => {
            // Placeholder for actual company info lookup
            return {
              topic: input.topic,
              info: 'ACME is a leading technology company specializing in AI-powered solutions and agent-to-agent communication systems.',
            };
          },
        }),
        generateCustomGreeting: tool({
          description: 'Generate a personalized greeting for a user',
          inputSchema: z.object({
            name: z.string().optional().describe('The name of the user to greet'),
          }),
          execute: async (input: { name?: string }) => {
            if (input.name) {
              return { greeting: `Hello ${input.name}! Welcome to ACME. How can I help you today?` };
            }
            return { greeting: 'Hello! Welcome to ACME. How can I assist you?' };
          },
        }),
      },
    });
  }

  /**
   * Process a user message using ToolLoopAgent
   * @param text The user's message text
   * @returns The agent's response
   */
  async processMessage(text: string): Promise<string> {
    try {
      console.log('   🤖 AI Agent processing request...');
      const result = await this.toolLoopAgent.generate({
        prompt: text,
      });
      console.log(`   🤖 AI Agent completed (${result.usage?.totalTokens || 0} tokens)`);
      return result.text;
    } catch (error) {
      console.error('   ❌ AI Agent error:', error);
      throw error;
    }
  }

  /**
   * Generate a greeting response for a user
   * @param name Optional name to greet
   * @returns A personalized greeting
   */
  async generateGreeting(name?: string): Promise<string> {
    try {
      const prompt = name ? `Generate a warm greeting for ${name}` : 'Generate a warm greeting for a new user';

      const result = await generateText({
        model: this.model,
        prompt,
      });

      return result.text;
    } catch (error) {
      console.error('   ❌ Error generating greeting:', error);
      throw error;
    }
  }
}

/**
 * Factory function to create an Agent instance
 */
export function createAgent(): Agent {
  return new Agent();
}
