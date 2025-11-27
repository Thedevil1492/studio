import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const plugins = [];
if (process.env.GEMINI_API_KEY) {
  plugins.push(googleAI({apiKey: process.env.GEMINI_API_KEY}));
} else {
  console.warn(
    'GEMINI_API_KEY environment variable not set. AI features will be disabled. Please get a key from https://aistudio.google.com/app/apikey and add it to your .env file.'
  );
}

export const ai = genkit({
  plugins,
  model: 'googleai/gemini-2.5-flash',
});

export const isAiEnabled = !!process.env.GEMINI_API_KEY;
