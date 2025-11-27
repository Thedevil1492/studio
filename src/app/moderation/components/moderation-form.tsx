'use client';

import {useActionState} from 'react';
import {useFormStatus} from 'react-dom';
import {configureModerationAction, type ModerationState} from '../actions';
import {Button} from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {Label} from '@/components/ui/label';
import {Loader2, ShieldCheck} from 'lucide-react';
import {toast} from '@/hooks/use-toast';
import {useEffect} from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function SubmitButton() {
  const {pending} = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? <Loader2 className="animate-spin" /> : <ShieldCheck className="mr-2" />}
      Save Configuration
    </Button>
  );
}

const thresholdOptions = [
  {value: 'BLOCK_LOW_AND_ABOVE', label: 'Block Low & Above'},
  {value: 'BLOCK_MEDIUM_AND_ABOVE', label: 'Block Medium & Above'},
  {value: 'BLOCK_ONLY_HIGH', label: 'Block Only High'},
  {value: 'BLOCK_NONE', label: 'Block None'},
];

type ModerationSelectProps = {
  id: string;
  label: string;
  description: string;
  defaultValue: string;
};

function ModerationSelect({id, label, description, defaultValue}: ModerationSelectProps) {
  return (
    <div className="grid grid-cols-3 items-center gap-4">
      <div className="col-span-1">
        <Label htmlFor={id} className="font-semibold">
          {label}
        </Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="col-span-2">
        <Select name={id} defaultValue={defaultValue}>
          <SelectTrigger id={id}>
            <SelectValue placeholder="Select threshold" />
          </SelectTrigger>
          <SelectContent>
            {thresholdOptions.map(option => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function ModerationForm() {
  const initialState: ModerationState = {};
  const [state, formAction] = useActionState(configureModerationAction, initialState);

  useEffect(() => {
    if (state?.error) {
      toast({
        title: 'Error',
        description: state.error,
        variant: 'destructive',
      });
    }
    if (state?.result?.success) {
      toast({
        title: 'Success',
        description: state.result.message,
      });
    }
  }, [state]);

  const categories = [
    {
      id: 'hateSpeechThreshold',
      label: 'Hate Speech',
      description: 'Content that promotes violence or incites hatred.',
      defaultValue: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      id: 'dangerousContentThreshold',
      label: 'Dangerous Content',
      description: 'Content that encourages serious harm.',
      defaultValue: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      id: 'harassmentThreshold',
      label: 'Harassment',
      description: 'Content that targets individuals with abuse.',
      defaultValue: 'BLOCK_MEDIUM_AND_ABOVE',
    },
    {
      id: 'sexuallyExplicitThreshold',
      label: 'Sexually Explicit',
      description: 'Content containing nudity or sexual acts.',
      defaultValue: 'BLOCK_MEDIUM_AND_ABOVE',
    },
  ];

  return (
    <Card className="bg-card/60 backdrop-blur-sm border-border/50">
      <form action={formAction}>
        <CardHeader>
          <CardTitle className="font-headline">Content Safety Thresholds</CardTitle>
          <CardDescription>
            Set the blocking sensitivity for different categories of potentially harmful content.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {categories.map(cat => (
            <ModerationSelect key={cat.id} {...cat} />
          ))}
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
