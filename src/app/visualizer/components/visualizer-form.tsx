'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import {generateAuraAction, type VisualizerState} from '../actions';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Loader2, Orbit, Upload} from 'lucide-react';
import {toast} from '@/hooks/use-toast';
import {useEffect, useRef, useState} from 'react';
import Image from 'next/image';

function SubmitButton() {
  const {pending} = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="animate-spin" /> : <Orbit className="mr-2" />}
      Generate 3D Aura
    </Button>
  );
}

const fileToDataUri = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export function VisualizerForm() {
  const initialState: VisualizerState = {};
  const [state, formAction] = useActionState(generateAuraAction, initialState);
  const [photoDataUri, setPhotoDataUri] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state?.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state]);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const dataUri = await fileToDataUri(file);
      setPhotoDataUri(dataUri);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <form action={formAction}>
          <input type="hidden" name="photoDataUri" value={photoDataUri} />
          <CardHeader>
            <CardTitle className="font-headline">Create your 3D Aura</CardTitle>
            <CardDescription>Upload a photo and customize the visual effects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="photo">Upload Photo</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
                required
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="mr-2" />
                {photoDataUri ? 'Change Photo' : 'Select Photo'}
              </Button>
              {photoDataUri && (
                <div className="w-full aspect-square relative mt-4 rounded-lg overflow-hidden border border-border">
                  <Image src={photoDataUri} alt="Uploaded preview" fill objectFit="cover" />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="auraColor">Aura Color</Label>
              <Input
                id="auraColor"
                name="auraColor"
                placeholder="e.g., Electric Blue, Golden Yellow"
                required
                defaultValue="Vibrant Purple"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="background">Background</Label>
              <Input
                id="background"
                name="background"
                placeholder="e.g., Cosmic Nebula, Cyberpunk City"
                required
                defaultValue="Deep Space"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="outfitOverlay">Outfit Overlay</Label>
              <Input
                id="outfitOverlay"
                name="outfitOverlay"
                placeholder="e.g., Futuristic Armor, Mystical Robes"
                required
                defaultValue="Glowing Neon"
              />
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state?.result?.modelDataUri && (
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="font-headline text-accent">Your 3D Creation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full aspect-square relative rounded-lg overflow-hidden border-2 border-accent shadow-2xl shadow-accent/20">
              <Image
                src={state.result.modelDataUri}
                alt="Generated 3D Model"
                fill
                objectFit="cover"
              />
            </div>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground text-center w-full">
              Right-click or long-press to save and share your creation!
            </p>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
