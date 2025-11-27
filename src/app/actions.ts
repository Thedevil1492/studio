'use server';

import { getChatResponse } from '@/ai/flows/chat';
import { isAiEnabled } from '@/ai/genkit';

export async function generateChatResponseAction(
  chatHistory: { text: string; sender: 'user' | 'ai' }[]
) {
  if (!isAiEnabled) {
    return {
      result:
        'The AI service is not configured. Please set the `GEMINI_API_KEY` in your .env file to enable chat functionality.',
    };
  }

  const lastUserMessage = chatHistory.findLast(
    (msg) => msg.sender === 'user'
  )?.text;
  if (!lastUserMessage) {
    return { error: 'No user message found.' };
  }
  try {
    const result = await getChatResponse(lastUserMessage);
    return { result };
  } catch (e: any) {
    console.error(e);
    // Provide a more specific error if the key is invalid
    if (e.message?.includes('API key not valid')) {
       return { error: 'The provided GEMINI_API_KEY is invalid. Please check your .env file.' };
    }
    return { error: e.message || 'Failed to get a response from the AI.' };
  }
}
