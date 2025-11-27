'use server';

import { getChatResponse } from '@/ai/flows/chat';

export async function generateChatResponseAction(
  chatHistory: { text: string; sender: 'user' | 'ai' }[]
) {
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
    return { error: e.message || 'Failed to get a response from the AI.' };
  }
}
