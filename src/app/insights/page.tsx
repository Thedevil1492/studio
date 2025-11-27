import { PageHeader } from '@/components/page-header';
import { InsightsForm } from './components/insights-form';

export default function InsightsPage() {
  return (
    <div className="container max-w-4xl py-8">
      <PageHeader
        title="Personalized Life Insights"
        description="Unlock deep analysis of your life path, potential, and purpose. The more data you provide, the more accurate and personalized your report will be."
      />
      <div className="mt-8">
        <InsightsForm />
      </div>
    </div>
  );
}
