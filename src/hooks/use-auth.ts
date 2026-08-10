import { useEffect, useState } from 'react';
import { getCurrentUser, getStoredUser, initAuthListener } from '@/lib/auth';
import type { AuthUser } from '@/lib/mock/types';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state listener
    initAuthListener();

    // Check for existing session
    const initAuth = async () => {
      try {
        setLoading(true);
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        // Fallback to stored user if available
        setUser(getStoredUser());
      } finally {
        setLoading(false);
        setReady(true);
      }
    };

    initAuth();

    // Listen for auth changes
    const handleAuthChange = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Failed to sync auth state:', error);
        setUser(getStoredUser());
      }
    };

    window.addEventListener('smartbiz-auth', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('smartbiz-auth', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return { user, ready, loading };
}
