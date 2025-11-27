import { PageHeader } from '@/components/page-header';
import { VisualizerForm } from './components/visualizer-form';

export default function VisualizerPage() {
  return (
    <div className="container max-w-2xl py-8">
      <PageHeader
        title="3D Aura Visualizer"
        description="Transform your photo into a stunning 3D avatar with a customizable glowing aura. Share your unique creation with the world."
      />
      <div className="mt-8">
        <VisualizerForm />
      </div>
    </div>
  );
}
