'use server';

import {
  getSocialMediaCaptionSuggestions,
  type SocialMediaCaptionSuggestionsInput,
} from '@/ai/flows/social-media-caption-suggestions';
import {z} from 'zod';

const FormSchema = z.object({
  profileLink: z.string().url({message: 'Please enter a valid URL.'}),
});

export type SocialState = {
  result?: any;
  error?: string;
  formErrors?: z.ZodError['formErrors'];
};

export async function getSocialSuggestionsAction(
  prevState: SocialState,
  formData: FormData
): Promise<SocialState> {
  const validatedFields = FormSchema.safeParse({
    profileLink: formData.get('profileLink'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid form data.',
      formErrors: validatedFields.error.flatten().formErrors,
    };
  }

  const input: SocialMediaCaptionSuggestionsInput = {
    profileLink: validatedFields.data.profileLink,
  };

  try {
    const result = await getSocialMediaCaptionSuggestions(input);
    return {result};
  } catch (e: any) {
    console.error(e);
    return {error: e.message || 'Failed to generate suggestions.'};
  }
}
