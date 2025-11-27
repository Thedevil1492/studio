'use client';

import React from 'react';
import {
  Plus,
  MessageSquare,
  Settings,
  LogOut,
  Trash2,
  User,
  Zap,
  Shield,
  Orbit,
  AtSign,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from './ui/avatar';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarMenuAction,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import {usePathname, useRouter, useSearchParams} from 'next/navigation';
import { useAuth, useUser, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { toast } from '@/hooks/use-toast';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { SheetTitle, SheetDescription } from './ui/sheet';


type Chat = {
    id: string;
    title: string;
}

type AppSidebarProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    openMobile: boolean;
    onOpenChangeMobile: (open: boolean) => void;
};


export function AppSidebar({ open, onOpenChange, openMobile, onOpenChangeMobile }: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id');
  const router = useRouter();
  const auth = useAuth();
  const { user } = useUser();
  const firestore = useFirestore();

  const chatsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(collection(firestore, 'users', user.uid, 'chats'), orderBy('createdAt', 'desc'));
  }, [user, firestore]);

  const { data: chatHistory, isLoading: isHistoryLoading } = useCollection<Chat>(chatsQuery);

  const handleNewChat = () => {
    onOpenChange(false);
    onOpenChangeMobile(false);
    router.push('/');
  };
  
  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      router.push('/login');
    }
  };

  const handleDeleteChat = async (chatIdToDelete: string) => {
    if (!user || !firestore) return;
    const chatRef = doc(firestore, 'users', user.uid, 'chats', chatIdToDelete);
    try {
        await deleteDoc(chatRef);
        toast({
            title: "Chat Deleted",
            description: "The conversation has been removed."
        })
        if (chatId === chatIdToDelete) {
          router.push('/');
        }
    } catch (error) {
        console.error("Error deleting chat: ", error);
        toast({
            title: "Error",
            description: "Could not delete chat. Please try again.",
            variant: "destructive"
        })
    }
  };

  return (
    <Sidebar open={open} onOpenChange={onOpenChange} openMobile={openMobile} onOpenChangeMobile={onOpenChangeMobile}>
      <VisuallyHidden>
        <SheetTitle>App Navigation</SheetTitle>
        <SheetDescription>Contains main navigation links, chat history, and user settings.</SheetDescription>
      </VisuallyHidden>
      <SidebarHeader className="p-4">
          <Button className="w-full justify-start text-base" onClick={handleNewChat}>
            <Plus className="mr-2" />
            New Chat
          </Button>
      </SidebarHeader>

      <SidebarContent className="flex-1 overflow-y-auto px-2">
         <SidebarMenu>
          <p className="px-2 text-xs font-semibold text-muted-foreground/80 mb-2">Recent Chats</p>
          {isHistoryLoading ? (
            <div className="p-2 space-y-2">
              <div className="h-8 w-full bg-sidebar-accent/50 animate-pulse rounded-md" />
              <div className="h-8 w-full bg-sidebar-accent/50 animate-pulse rounded-md" />
              <div className="h-8 w-full bg-sidebar-accent/50 animate-pulse rounded-md" />
            </div>
          ) : (
            chatHistory?.map((chat) => (
                <SidebarMenuItem key={chat.id}>
                    <SidebarMenuButton
                      variant="ghost"
                      className="w-full justify-start text-sidebar-foreground/80 hover:text-sidebar-foreground"
                      asChild
                      isActive={chatId === chat.id}
                    >
                    <Link href={`/?id=${chat.id}`}>
                        <MessageSquare className="mr-2 shrink-0" />
                        <span className="truncate">{chat.title}</span>
                    </Link>
                    </SidebarMenuButton>
                    <SidebarMenuAction onClick={() => handleDeleteChat(chat.id)} showOnHover>
                        <Trash2 />
                    </SidebarMenuAction>
                </SidebarMenuItem>
            ))
          )}
        </SidebarMenu>
        <SidebarSeparator />
         <SidebarMenu>
          <p className="px-2 text-xs font-semibold text-muted-foreground/80 mb-2">Tools</p>
             <SidebarMenuItem>
                 <SidebarMenuButton variant="ghost" className="w-full justify-start" asChild isActive={pathname === '/insights'}>
                     <Link href="/insights"><Zap className="mr-2 shrink-0" />Personalized Insights</Link>
                 </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
                 <SidebarMenuButton variant="ghost" className="w-full justify-start" asChild isActive={pathname === '/social'}>
                     <Link href="/social"><AtSign className="mr-2 shrink-0" />Social Guru</Link>
                 </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
                 <SidebarMenuButton variant="ghost" className="w-full justify-start" asChild isActive={pathname === '/visualizer'}>
                     <Link href="/visualizer"><Orbit className="mr-2 shrink-0" />Aura Visualizer</Link>
                 </SidebarMenuButton>
             </SidebarMenuItem>
             <SidebarMenuItem>
                 <SidebarMenuButton variant="ghost" className="w-full justify-start" asChild isActive={pathname === '/moderation'}>
                     <Link href="/moderation"><Shield className="mr-2 shrink-0" />Moderation Tools</Link>
                 </SidebarMenuButton>
             </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4">
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start p-2 h-auto">
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user.photoURL || `https://avatar.vercel.sh/${user.uid}.png`}
                      alt={user.displayName || 'User Avatar'}
                      data-ai-hint="user avatar"
                    />
                    <AvatarFallback>
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : <User />}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-sidebar-foreground truncate">{user.displayName || user.email}</span>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.displayName}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
