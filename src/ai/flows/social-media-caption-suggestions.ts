'use server';

/**
 * @fileOverview Generates social media caption suggestions based on a social media profile link.
 *
 * - getSocialMediaCaptionSuggestions - A function that handles the generation of social media caption suggestions.
 * - SocialMediaCaptionSuggestionsInput - The input type for the getSocialMediaCaptionSuggestions function.
 * - SocialMediaCaptionSuggestionsOutput - The return type for the getSocialMediaCaptionSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SocialMediaCaptionSuggestionsInputSchema = z.object({
  profileLink: z
    .string()
    .describe('The link to the social media profile to analyze.'),
});
export type SocialMediaCaptionSuggestionsInput = z.infer<
  typeof SocialMediaCaptionSuggestionsInputSchema
>;

const SocialMediaCaptionSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(
      z.object({
        caption: z
          .string()
          .describe('A suggested caption for a social media post.'),
        contentIdea: z
          .string()
          .describe('A content idea for a social media post.'),
        postingTime: z
          .string()
          .describe('The best time to post the content.'),
        toneSuggestion: z.string().describe('A suggested tone for the post.'),
        viralScore: z
          .number()
          .describe('A score indicating the potential virality of the post.'),
      })
    )
    .describe('A list of social media caption and content suggestions.'),
});
export type SocialMediaCaptionSuggestionsOutput = z.infer<
  typeof SocialMediaCaptionSuggestionsOutputSchema
>;

export async function getSocialMediaCaptionSuggestions(
  input: SocialMediaCaptionSuggestionsInput
): Promise<SocialMediaCaptionSuggestionsOutput> {
  return socialMediaCaptionSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'socialMediaCaptionSuggestionsPrompt',
  input: {schema: SocialMediaCaptionSuggestionsInputSchema},
  output: {schema: SocialMediaCaptionSuggestionsOutputSchema},
  prompt: `You are a social media marketing expert. Analyze the following social media profile and suggest engaging captions and content ideas to improve the online presence.

Profile Link: {{{profileLink}}}

Provide a list of suggestions, each including a caption, content idea, best posting time, tone suggestion, and a viral score (out of 100).`,
});

const socialMediaCaptionSuggestionsFlow = ai.defineFlow(
  {
    name: 'socialMediaCaptionSuggestionsFlow',
    inputSchema: SocialMediaCaptionSuggestionsInputSchema,
    outputSchema: SocialMediaCaptionSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
