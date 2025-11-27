'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Paperclip, Send, Bot, User, Sun, Menu, Loader2, LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { generateChatResponseAction } from '../actions';
import { toast } from '@/hooks/use-toast';
import { useUser, useAuth, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, query, orderBy, where, doc, setDoc } from 'firebase/firestore';
import { AppSidebar } from '@/components/app-sidebar';
import { nanoid } from 'nanoid';

type Message = {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  createdAt?: any;
};

export function ChatInterface() {
  const [input, setInput] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id');

  // Memoize the query to prevent re-renders
  const messagesQuery = useMemoFirebase(() => {
    if (!user || !firestore || !chatId) return null;
    return query(collection(firestore, 'users', user.uid, 'messages'), where('chatId', '==', chatId), orderBy('createdAt', 'asc'));
  }, [user, firestore, chatId]);

  const { data: messages, isLoading: isHistoryLoading } = useCollection<Message>(messagesQuery);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleSend = async () => {
    if (input.trim() === '' || isAiLoading || !user || !firestore) return;

    const userMessageText = input;
    setInput('');

    let currentChatId = chatId;

    // Create a new chat if one doesn't exist
    if (!currentChatId) {
        const newChatRef = doc(collection(firestore, 'users', user.uid, 'chats'));
        const newChat = {
            title: userMessageText.slice(0, 30),
            createdAt: serverTimestamp(),
            userId: user.uid,
        };
        await setDoc(newChatRef, newChat);
        currentChatId = newChatRef.id;
        
        // Redirect to the new chat page. The rest of the logic will be handled
        // by the hooks listening to the new chat ID.
        router.push(`/?id=${currentChatId}`, { scroll: false });
        // The rest of the logic will now run on the new page after redirect
        return;
    }
    
    // Save user message to Firestore
    const userMessage: Omit<Message, 'id'> = { text: userMessageText, sender: 'user' };
    const messagesColRef = collection(firestore, 'users', user.uid, 'messages');
    
    try {
        await addDoc(messagesColRef, {
            ...userMessage,
            chatId: currentChatId,
            createdAt: serverTimestamp(),
            userId: user.uid,
        });
    } catch (error) {
        console.error("Error saving user message:", error);
        toast({
            title: 'Error',
            description: 'Could not save your message. Please try again.',
            variant: 'destructive',
        });
        return;
    }

    setIsAiLoading(true);

    const fullHistory = messages || [];
    const response = await generateChatResponseAction([...fullHistory, { ...userMessage, id: nanoid() }]);
    
    setIsAiLoading(false);

    if (response.error) {
      toast({
        title: 'Error',
        description: response.error,
        variant: 'destructive',
      });
      return;
    }

    if (response.result) {
        const aiResponse: Omit<Message, 'id'> = { text: response.result, sender: 'ai' };
        // Save AI message to Firestore
        try {
            await addDoc(messagesColRef, {
                ...aiResponse,
                chatId: currentChatId,
                createdAt: serverTimestamp(),
                userId: user.uid,
            });
        } catch(error) {
             console.error("Error saving AI message:", error);
             // Don't revert UI, just log the error
        }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  const handleThemeCycle = () => {
    // A bit of a hack to call the function defined in the layout
    if (typeof (window as any).cycleTheme === 'function') {
      (window as any).cycleTheme();
    }
  };

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const isLoading = isUserLoading;

  if (isLoading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const showWelcomeScreen = !chatId;

  return (
    <div className="flex h-screen bg-background text-foreground">
      <AppSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} openMobile={sidebarOpenMobile} onOpenChangeMobile={setSidebarOpenMobile} />
      <main className="flex flex-1 flex-col transition-all duration-300">
        <header className="flex h-14 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
           <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSidebarOpenMobile(true)}>
             <Menu className="h-6 w-6" />
             <span className="sr-only">Toggle Sidebar</span>
           </Button>
           <div className="flex items-center gap-2">
             <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSidebarOpen(true)}>
               <Menu className="h-6 w-6" />
               <span className="sr-only">Toggle Sidebar</span>
             </Button>
             <h1 className="text-lg font-semibold md:text-xl font-headline">
                CosmicMind AI
             </h1>
           </div>
           <div className="ml-auto flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleThemeCycle}>
                <Sun className="h-6 w-6" />
                <span className="sr-only">Cycle Theme</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleLogout}>
                 <LogOut className="h-6 w-6" />
                 <span className="sr-only">Log Out</span>
              </Button>
           </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <AnimatePresence>
              {isHistoryLoading && chatId ? (
                  <div className="flex h-full items-center justify-center pt-20">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                  </div>
              ) : showWelcomeScreen ? (
                <div className="flex flex-col items-center justify-center h-full text-center pt-20">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse"></div>
                    <h1 className="relative text-5xl font-bold font-headline tracking-tighter text-primary">
                      CosmicMind AI
                    </h1>
                  </div>
                  <p className="max-w-md text-lg text-muted-foreground">
                    How can I help you unlock your potential today?
                  </p>
                </div>
              ) : (
                messages?.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : ''}`}
                  >
                    {msg.sender === 'ai' && (
                      <div className="p-2 rounded-full bg-primary/20 text-primary">
                        <Bot className="w-6 h-6" />
                      </div>
                    )}
                    <div className={`rounded-lg p-3 max-w-[75%] ${
                        msg.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                     {msg.sender === 'user' && (
                      <div className="p-2 rounded-full bg-secondary text-secondary-foreground">
                        <User className="w-6 h-6" />
                      </div>
                    )}
                  </motion.div>
                ))
              )}
               {isAiLoading && (
                 <motion.div
                    key="ai-loading"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                     className="flex items-start gap-4"
                  >
                     <div className="p-2 rounded-full bg-primary/20 text-primary">
                        <Bot className="w-6 h-6" />
                      </div>
                      <div className="rounded-lg p-3 max-w-[75%] bg-muted flex items-center space-x-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span className="text-sm">CosmicMind is thinking...</span>
                      </div>
                  </motion.div>
               )}
            </AnimatePresence>
          </div>
        </div>

        <div className="border-t bg-background/80 backdrop-blur-sm p-4">
          <div className="relative max-w-2xl mx-auto">
            <Input
              placeholder="Message CosmicMind AI..."
              className="w-full h-12 pr-24 pl-12 rounded-full bg-muted border-border/50 focus-visible:ring-primary"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              disabled={isAiLoading}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2">
              <Button variant="ghost" size="icon" className="rounded-full">
                <Paperclip />
                <span className="sr-only">Attach file</span>
              </Button>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <Button size="icon" className="rounded-full w-9 h-9" onClick={handleSend} disabled={!input.trim() || isAiLoading}>
                <Send className="w-5 h-5" />
                <span className="sr-only">Send Message</span>
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
