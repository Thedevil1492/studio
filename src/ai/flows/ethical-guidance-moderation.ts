'use server';

/**
 * @fileOverview A flow for configuring safety moderation with legal/compliance layers to ensure ethical and responsible AI use.
 *
 * - configureSafetyModeration - A function that aconfigures the safety moderation settings.
 * - ConfigureSafetyModerationInput - The input type for the configureSafetyModeration function.
 * - ConfigureSafetyModerationOutput - The return type for the configureSafetyModeration function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ConfigureSafetyModerationInputSchema = z.object({
  hateSpeechThreshold: z
    .enum([
      'BLOCK_LOW_AND_ABOVE',
      'BLOCK_MEDIUM_AND_ABOVE',
      'BLOCK_ONLY_HIGH',
      'BLOCK_NONE',
    ])
    .describe('The threshold for blocking hate speech.'),
  dangerousContentThreshold: z
    .enum([
      'BLOCK_LOW_AND_ABOVE',
      'BLOCK_MEDIUM_AND_ABOVE',
      'BLOCK_ONLY_HIGH',
      'BLOCK_NONE',
    ])
    .describe('The threshold for blocking dangerous content.'),
  harassmentThreshold: z
    .enum([
      'BLOCK_LOW_AND_ABOVE',
      'BLOCK_MEDIUM_AND_ABOVE',
      'BLOCK_ONLY_HIGH',
      'BLOCK_NONE',
    ])
    .describe('The threshold for blocking harassment.'),
  sexuallyExplicitThreshold: z
    .enum([
      'BLOCK_LOW_AND_ABOVE',
      'BLOCK_MEDIUM_AND_ABOVE',
      'BLOCK_ONLY_HIGH',
      'BLOCK_NONE',
    ])
    .describe('The threshold for blocking sexually explicit content.'),
  civicIntegrityThreshold: z
    .enum([
      'BLOCK_LOW_AND_ABOVE',
      'BLOCK_MEDIUM_AND_ABOVE',
      'BLOCK_ONLY_HIGH',
      'BLOCK_NONE',
    ])
    .describe('The threshold for blocking content related to civic integrity.'),
});
export type ConfigureSafetyModerationInput = z.infer<
  typeof ConfigureSafetyModerationInputSchema
>;

const ConfigureSafetyModerationOutputSchema = z.object({
  success: z.boolean().describe('Whether the configuration was successful.'),
  message: z
    .string()
    .describe('A message indicating the result of the configuration.'),
});
export type ConfigureSafetyModerationOutput = z.infer<
  typeof ConfigureSafetyModerationOutputSchema
>;

export async function configureSafetyModeration(
  input: ConfigureSafetyModerationInput
): Promise<ConfigureSafetyModerationOutput> {
  return configureSafetyModerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'configureSafetyModerationPrompt',
  input: {schema: ConfigureSafetyModerationInputSchema},
  output: {schema: ConfigureSafetyModerationOutputSchema},
  prompt: `You are an AI safety configuration tool.  Based on the user-provided thresholds for each category, return a success status and message.

Hate Speech Threshold: {{{hateSpeechThreshold}}}
Dangerous Content Threshold: {{{dangerousContentThreshold}}}
Harassment Threshold: {{{harassmentThreshold}}}
Sexually Explicit Threshold: {{{sexuallyExplicitThreshold}}}
Civic Integrity Threshold: {{{civicIntegrityThreshold}}}

Return a JSON object indicating success and a descriptive message.`,
});

const configureSafetyModerationFlow = ai.defineFlow(
  {
    name: 'configureSafetyModerationFlow',
    inputSchema: ConfigureSafetyModerationInputSchema,
    outputSchema: ConfigureSafetyModerationOutputSchema,
  },
  async input => {
    try {
      // Here, you might integrate with a real moderation system.
      // This example just returns a successful configuration message.

      const {output} = await prompt(input);
      return output!;
    } catch (error: any) {
      console.error('Error configuring safety moderation:', error);
      return {
        success: false,
        message: `Configuration failed: ${error.message ?? 'Unknown error'}`,
      };
    }
  }
);
