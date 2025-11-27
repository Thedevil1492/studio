'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import {getSocialSuggestionsAction, type SocialState} from '../actions';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {AtSign, Loader2} from 'lucide-react';
import {toast} from '@/hooks/use-toast';
import {useEffect} from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function SubmitButton() {
  const {pending} = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="animate-spin" /> : <AtSign className="mr-2" />}
      Analyze Profile
    </Button>
  );
}

export function SocialForm() {
  const initialState: SocialState = {};
  const [state, formAction] = useActionState(getSocialSuggestionsAction, initialState);

  useEffect(() => {
    if (state?.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
    }
  }, [state]);

  return (
    <div className="space-y-8">
      <Card className="bg-card/60 backdrop-blur-sm border-border/50">
        <form action={formAction}>
          <CardHeader>
            <CardTitle className="font-headline">Analyze Social Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="profileLink">Profile Link</Label>
              <Input
                id="profileLink"
                name="profileLink"
                placeholder="https://instagram.com/username"
                required
              />
              {state.formErrors && (
                <p className="text-sm text-destructive">{state.formErrors.toString()}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>

      {state?.result?.suggestions && (
        <Card className="bg-card/60 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="font-headline text-accent">Content Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Caption</TableHead>
                  <TableHead>Content Idea</TableHead>
                  <TableHead>Tone</TableHead>
                  <TableHead>Best Time</TableHead>
                  <TableHead className="text-right">Viral Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {state.result.suggestions.map((s: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="max-w-xs break-words">{s.caption}</TableCell>
                    <TableCell>{s.contentIdea}</TableCell>
                    <TableCell>{s.toneSuggestion}</TableCell>
                    <TableCell>{s.postingTime}</TableCell>
                    <TableCell className="text-right text-accent font-bold">
                      {s.viralScore}/100
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
