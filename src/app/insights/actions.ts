'use server';

import {
  getPersonalizedLifeInsights,
  type PersonalizedLifeInsightsInput,
} from '@/ai/flows/personalized-life-insights';
import {z} from 'zod';

const FormSchema = z.object({
  textInput: z.string().optional(),
  socialLinks: z.string().optional(),
  birthDate: z.string().optional(),
  birthTime: z.string().optional(),
  birthLocation: z.string().optional(),
  photoDataUri: z.string().optional(),
});

export type InsightsState = {
  result?: any;
  error?: string;
  formErrors?: z.ZodError['formErrors'];
};

export async function generateInsightsAction(
  prevState: InsightsState,
  formData: FormData
): Promise<InsightsState> {
  const validatedFields = FormSchema.safeParse({
    textInput: formData.get('textInput'),
    socialLinks: formData.get('socialLinks'),
    birthDate: formData.get('birthDate'),
    birthTime: formData.get('birthTime'),
    birthLocation: formData.get('birthLocation'),
    photoDataUri: formData.get('photoDataUri'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid form data.',
      formErrors: validatedFields.error.flatten().formErrors,
    };
  }

  const data = validatedFields.data;

  const input: PersonalizedLifeInsightsInput = {
    textInput: data.textInput,
    photoDataUri: data.photoDataUri,
    socialLinks: data.socialLinks
      ? data.socialLinks.split(',').map(link => link.trim())
      : undefined,
    birthDetails:
      data.birthDate && data.birthTime && data.birthLocation
        ? {
            date: data.birthDate,
            time: data.birthTime,
            location: data.birthLocation,
          }
        : undefined,
    consentFlags: {
      birthData: !!(data.birthDate && data.birthTime && data.birthLocation),
      osintSocialScan: !!data.socialLinks,
      photoFaceAnalysis: !!data.photoDataUri,
    },
  };

  try {
    const result = await getPersonalizedLifeInsights(input);
    return {result};
  } catch (e: any) {
    console.error(e);
    return {error: e.message || 'Failed to generate insights.'};
  }
}
