'use server';

import {generate3DAura, type Generate3DAuraInput} from '@/ai/flows/photo-to-3d-aura';
import {z} from 'zod';

const FormSchema = z.object({
  photoDataUri: z
    .string()
    .refine(val => val.startsWith('data:image/'), {message: 'A photo is required.'}),
  auraColor: z.string().min(1, 'Aura color is required.'),
  background: z.string().min(1, 'Background is required.'),
  outfitOverlay: z.string().min(1, 'Outfit overlay is required.'),
});

export type VisualizerState = {
  result?: any;
  error?: string;
  formErrors?: z.ZodError['formErrors'];
};

export async function generateAuraAction(
  prevState: VisualizerState,
  formData: FormData
): Promise<VisualizerState> {
  const validatedFields = FormSchema.safeParse({
    photoDataUri: formData.get('photoDataUri'),
    auraColor: formData.get('auraColor'),
    background: formData.get('background'),
    outfitOverlay: formData.get('outfitOverlay'),
  });

  if (!validatedFields.success) {
    return {
      error: 'Invalid form data. Please fill all fields and upload a photo.',
      formErrors: validatedFields.error.flatten().formErrors,
    };
  }

  const input: Generate3DAuraInput = validatedFields.data;

  try {
    const result = await generate3DAura(input);
    return {result};
  } catch (e: any) {
    console.error(e);
    return {error: e.message || 'Failed to generate 3D aura.'};
  }
}
