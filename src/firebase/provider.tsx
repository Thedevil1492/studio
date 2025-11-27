'use client';

import React, { createContext, useContext, useEffect, useState, type ReactNode, Suspense } from 'react';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, type Auth, type User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { AppSidebar } from '@/components/app-sidebar';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { Sidebar, SidebarContent, SidebarHeader, SidebarFooter } from '@/components/ui/sidebar';

// Define the shape of the context value
interface FirebaseContextValue {
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Define the shape of the result for user-related hooks
export interface UserHookResult {
  user: User | null;
  isUserLoading: boolean;
  userError: Error | null;
}

// Create the context with a null initial value
const FirebaseContext = createContext<FirebaseContextValue | null>(null);

// Custom hook to use the Firebase context
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

// Provider component props
interface FirebaseProviderProps {
  children: ReactNode;
  firebaseApp: FirebaseApp | null;
  auth: Auth | null;
  firestore: Firestore | null;
}

function SidebarLoading() {
    return (
        <Sidebar>
            <SidebarHeader className="p-4">
                <div className="h-9 w-full bg-sidebar-accent/50 animate-pulse rounded-md" />
            </SidebarHeader>
            <SidebarContent className="flex-1 overflow-y-auto px-2">
                <div className="p-2 space-y-2">
                  <div className="h-8 w-full bg-sidebar-accent/50 animate-pulse rounded-md" />
                  <div className="h-8 w-full bg-sidebar-accent/50 animate-pulse rounded-md" />
                  <div className="h-8 w-full bg-sidebar-accent/50 animate-pulse rounded-md" />
                </div>
            </SidebarContent>
            <SidebarFooter className="p-4">
                <div className="h-12 w-full bg-sidebar-accent/50 animate-pulse rounded-md" />
            </SidebarFooter>
        </Sidebar>
    )
}

export function FirebaseProvider({
  children,
  firebaseApp,
  auth,
  firestore,
}: FirebaseProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [userError, setUserError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auth) {
      setIsUserLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setIsUserLoading(false);
      },
      (error) => {
        setUserError(error);
        setIsUserLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  const value = { firebaseApp, auth, firestore, user, isUserLoading, userError };

  return (
    <FirebaseContext.Provider value={value}>
        <div className="flex h-screen">
          <Suspense fallback={<SidebarLoading />}>
            <AppSidebar />
          </Suspense>
          <main className="flex-1">{children}</main>
          <FirebaseErrorListener />
        </div>
    </FirebaseContext.Provider>
  );
}

// Specific hooks for accessing parts of the context
export const useFirebaseApp = () => useFirebase().firebaseApp;
export const useAuth = () => useFirebase().auth;
export const useFirestore = () => useFirebase().firestore;
