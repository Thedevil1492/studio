'use client';

import { useFirebase, type UserHookResult } from '@/firebase/provider';
import type { User } from 'firebase/auth';

/**
 * Hook specifically for accessing the authenticated user's state.
 * This provides the User object, loading status, and any auth errors.
 * @returns {UserHookResult} Object with user, isUserLoading, userError.
 */
export const useUser = (): { user: User | null; isUserLoading: boolean; userError: Error | null } => { 
  const { user, isUserLoading, userError } = useFirebase();
  return { user, isUserLoading, userError };
};
