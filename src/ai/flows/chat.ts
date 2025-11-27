'use server';

/**
 * @fileOverview A simple conversational flow for the CosmicMind AI.
 *
 * - getChatResponse - A function that takes a user's prompt and returns an AI-generated response.
 */

import { ai } from '@/ai/genkit';
import { googleSearch } from '@/ai/tools/google-search';
import { z } from 'genkit';

export async function getChatResponse(prompt: string): Promise<string> {
  const chat = await ai.generate({
    prompt: prompt,
    model: 'googleai/gemini-2.5-flash',
    tools: [googleSearch],
    history: [
        {
            role: 'system',
            content: 'You are CosmicMind AI, a friendly and super-intelligent assistant. You are an expert in a vast range of topics. You have access to a live Google Search tool for real-time information. Use it whenever you need to find current data, facts, or information you do not possess. Keep your responses concise and helpful.',
        }
    ],
  });

  return chat.text;
}

const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (prompt) => {
    return getChatResponse(prompt);
  }
);
