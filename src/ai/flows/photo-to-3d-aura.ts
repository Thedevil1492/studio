'use server';
/**
 * @fileOverview Transforms a user-uploaded photo into a 3D model with a customizable aura for social media sharing.
 *
 * - generate3DAura - A function that takes a photo data URI and generates a 3D model with an aura.
 * - Generate3DAuraInput - The input type for the generate3DAura function.
 * - Generate3DAuraOutput - The return type for the generate3DAura function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const Generate3DAuraInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be transformed into a 3D model with a customizable aura, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  auraColor: z.string().describe('The desired color of the aura.'),
  background: z.string().describe('The desired background for the 3D model.'),
  outfitOverlay: z
    .string()
    .describe('The desired outfit overlay for the 3D model.'),
});
export type Generate3DAuraInput = z.infer<typeof Generate3DAuraInputSchema>;

const Generate3DAuraOutputSchema = z.object({
  modelDataUri: z
    .string()
    .describe('The data URI of the generated 3D model with aura.'),
});
export type Generate3DAuraOutput = z.infer<typeof Generate3DAuraOutputSchema>;

export async function generate3DAura(
  input: Generate3DAuraInput
): Promise<Generate3DAuraOutput> {
  return generate3DAuraFlow(input);
}

const generate3DAuraPrompt = ai.definePrompt({
  name: 'generate3DAuraPrompt',
  input: {schema: Generate3DAuraInputSchema},
  output: {schema: Generate3DAuraOutputSchema},
  prompt: `You are a 3D artist specializing in creating avatars with auras.

  The user will upload a photo, and you will generate a 3D model of the person in the photo with a glowing aura.

  Use the following information to create the 3D model:

  Photo: {{media url=photoDataUri}}
  Aura Color: {{{auraColor}}}
  Background: {{{background}}}
  Outfit Overlay: {{{outfitOverlay}}}

  Return the 3D model with the aura as a data URI.
`,
});

const generate3DAuraFlow = ai.defineFlow(
  {
    name: 'generate3DAuraFlow',
    inputSchema: Generate3DAuraInputSchema,
    outputSchema: Generate3DAuraOutputSchema,
  },
  async input => {
    // Simulate 3D model generation and aura application using image generation
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.5-flash-image-preview',
      prompt: [
        {
          text: `Generate a 3D model of the person in this photo with a glowing ${input.auraColor} aura, ${input.background} background, and ${input.outfitOverlay} outfit overlay.`,
        },
        {media: {url: input.photoDataUri}},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // IMAGE only won't work
      },
    });

    if (!media) {
      throw new Error('No media returned from image generation.');
    }

    return {modelDataUri: media.url};
  }
);
