import { PageHeader } from '@/components/page-header';
import { ModerationForm } from './components/moderation-form';

export default function ModerationPage() {
  return (
    <div className="container max-w-4xl py-8">
      <PageHeader
        title="Content Safety & Moderation"
        description="Fine-tune the AI's sensitivity to potentially harmful content to align with your application's safety standards."
      />
      <div className="mt-8">
        <ModerationForm />
      </div>
    </div>
  );
}
