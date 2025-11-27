import { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import { ChatInterface } from './components/chat-interface';

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-background">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <ChatInterface />
    </Suspense>
  );
}
