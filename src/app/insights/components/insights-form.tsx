'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import {generateInsightsAction, type InsightsState} from '../actions';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Loader2, Sparkles, Upload} from 'lucide-react';
import {toast} from '@/hooks/use-toast';
import {useEffect, useRef, useState} from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

function SubmitButton() {
  const {pending} = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="lg" className="w-full">
      {pending ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2" />}
      Generate My Insights
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

export function InsightsForm() {
  const initialState: InsightsState = {};
  const [state, formAction] = useActionState(generateInsightsAction, initialState);
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
            <CardTitle className="font-headline">Your Cosmic Data</CardTitle>
            <CardDescription>The more you share, the more accurate the reading.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="textInput">What's on your mind?</Label>
              <Textarea
                id="textInput"
                name="textInput"
                placeholder="Tell me about your current situation, your goals, or any challenges you're facing..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialLinks">Social Media Profiles (optional)</Label>
              <Input
                id="socialLinks"
                name="socialLinks"
                placeholder="e.g., https://instagram.com/username, https://linkedin.com/in/username"
              />
              <p className="text-xs text-muted-foreground">
                Separate multiple links with a comma. We only access public data.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">Birth Date (optional)</Label>
                <Input id="birthDate" name="birthDate" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthTime">Birth Time (optional)</Label>
                <Input id="birthTime" name="birthTime" type="time" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="birthLocation">Birth Location (optional)</Label>
                <Input id="birthLocation" name="birthLocation" placeholder="City, Country" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="photo">Upload Photo (optional)</Label>
              <Input
                id="photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
                className="hidden"
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
                <p className="text-sm text-green-400 text-center">
                  Photo selected and ready for analysis.
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      {state?.result && (
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="font-headline text-accent">Your Cosmic Mind Report</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="multiple" defaultValue={['summary', 'outlookShort', 'actionPlans']}>
              <AccordionItem value="summary">
                <AccordionTrigger>Summary of Past & Present</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2">
                    {state.result.summary.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="outlookShort">
                <AccordionTrigger>Short-Term Outlook (7 days)</AccordionTrigger>
                <AccordionContent>{state.result.outlookShort}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="outlookMedium">
                <AccordionTrigger>Medium-Term Outlook (6 months)</AccordionTrigger>
                <AccordionContent>{state.result.outlookMedium}</AccordionContent>
              </AccordionItem>
              <AccordionItem value="actionPlans">
                <AccordionTrigger>Action Plans</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-decimal pl-5 space-y-2">
                    {state.result.actionPlans.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="remedies">
                <AccordionTrigger>Spiritual & Remedial Suggestions</AccordionTrigger>
                <AccordionContent>
                  <ul className="list-disc pl-5 space-y-2">
                    {state.result.remedies.map((item: string, index: number) => (
                      <li key={index}>{item}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
              {state.result.socialSuggestions?.length > 0 && (
                <AccordionItem value="socialSuggestions">
                  <AccordionTrigger>Social Media Suggestions</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {state.result.socialSuggestions.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
              {state.result.d3Options?.length > 0 && (
                <AccordionItem value="d3Options">
                  <AccordionTrigger>3D Rendering Options</AccordionTrigger>
                  <AccordionContent>
                    <ul className="list-disc pl-5 space-y-2">
                      {state.result.d3Options.map((item: string, index: number) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
