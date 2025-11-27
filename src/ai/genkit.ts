import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/google-genai';

const plugins = [];
if (process.env.GEMINI_API_KEY) {
  plugins.push(googleAI({apiKey: process.env.GEMINI_API_KEY}));
} else {
  // Only log a warning to the console, do not throw an error.
  // This allows the server to start and the app to run without the API key.
  if (typeof window === 'undefined') {
    // Log only on the server-side to avoid console noise in the browser.
    console.warn(
      'GEMINI_API_KEY environment variable not set. AI features will be disabled. Please get a key from https://aistudio.google.com/app/apikey and add it to your .env file.'
    );
  }
}

export const ai = genkit({
  plugins,
});

export const isAiEnabled = !!process.env.GEMINI_API_KEY;
