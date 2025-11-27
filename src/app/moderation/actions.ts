'use server';

import {
  configureSafetyModeration,
  type ConfigureSafetyModerationInput,
} from '@/ai/flows/ethical-guidance-moderation';
import {z} from 'zod';

const ThresholdEnum = z.enum([
  'BLOCK_LOW_AND_ABOVE',
  'BLOCK_MEDIUM_AND_ABOVE',
  'BLOCK_ONLY_HIGH',
  'BLOCK_NONE',
]);

const FormSchema = z.object({
  hateSpeechThreshold: ThresholdEnum,
  dangerousContentThreshold: ThresholdEnum,
  harassmentThreshold: ThresholdEnum,
  sexuallyExplicitThreshold: ThresholdEnum,
});

export type ModerationState = {
  result?: any;
  error?: string;
  formErrors?: z.ZodError['formErrors'];
};

export async function configureModerationAction(
  prevState: ModerationState,
  formData: FormData
): Promise<ModerationState> {
  const validatedFields = FormSchema.safeParse({
    hateSpeechThreshold: formData.get('hateSpeechThreshold'),
    dangerousContentThreshold: formData.get('dangerousContentThreshold'),
    harassmentThreshold: formData.get('harassmentThreshold'),
    sexuallyExplicitThreshold: formData.get('sexuallyExplicitThreshold'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid form data. Please select a valid option for all fields.',
      formErrors: validatedFields.error.flatten().formErrors,
    };
  }

  // The AI flow has civicIntegrityThreshold, but the form doesn't.
  // We will set a default value for it.
  const input: ConfigureSafetyModerationInput = {
    ...validatedFields.data,
    civicIntegrityThreshold: 'BLOCK_MEDIUM_AND_ABOVE',
  };

  try {
    const result = await configureSafetyModeration(input);
    return {result};
  } catch (e: any) {
    console.error(e);
    return {error: e.message || 'Failed to configure moderation settings.'};
  }
}
