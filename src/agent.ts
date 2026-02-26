import { anthropic } from '@ai-sdk/anthropic';
import { generateText } from 'ai';

/**
 * Autonomous AI agent for ACME A2A agent
 * Uses Vercel AI SDK to generate intelligent responses
 */
export class Agent {
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
  }

  /**
   * Process a user message and generate a response
   * @param text The user's message text
   * @returns The agent's response
   */
  async processMessage(text: string): Promise<string> {
    try {
      const result = await generateText({
        model: this.model,
        prompt: `You are a helpful ACME agent. Respond to the user's message in a friendly and professional way.

User message: ${text}

Generate a helpful response. Keep it concise (2-3 sentences).`,
      });

      return result.text;
    } catch (error) {
      console.error('Error processing message:', error);
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
      const prompt = name
        ? `Generate a warm, friendly greeting for someone named "${name}". Keep it to 1-2 sentences. Be professional but personable.`
        : 'Generate a warm, friendly greeting. Keep it to 1-2 sentences. Be professional but personable.';

      const result = await generateText({
        model: this.model,
        prompt,
      });

      return result.text;
    } catch (error) {
      console.error('Error generating greeting:', error);
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
