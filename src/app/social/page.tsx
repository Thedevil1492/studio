import { PageHeader } from '@/components/page-header';
import { SocialForm } from './components/social-form';

export default function SocialPage() {
  return (
    <div className="container max-w-4xl py-8">
      <PageHeader
        title="Social Media Guru"
        description="Analyze a social media profile to get AI-powered suggestions for content, captions, and strategy."
      />
      <div className="mt-8">
        <SocialForm />
      </div>
    </div>
  );
}
