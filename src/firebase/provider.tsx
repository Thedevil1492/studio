'use client';

import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, type Auth, type User } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';
import { AppSidebar } from '@/components/app-sidebar';
import { FirebaseErrorListener } from '@/components/FirebaseErrorListener';
import { SidebarProvider } from '@/components/ui/sidebar';

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
      <SidebarProvider>
        <div className="flex h-screen">
          <AppSidebar />
          <main className="flex-1">
            {children}
          </main>
          <FirebaseErrorListener />
        </div>
      </SidebarProvider>
    </FirebaseContext.Provider>
  );
}

// Specific hooks for accessing parts of the context
export const useFirebaseApp = () => useFirebase().firebaseApp;
export const useAuth = () => useFirebase().auth;
export const useFirestore = () => useFirebase().firestore;
