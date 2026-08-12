import { useEffect, useState } from 'react';
import { getCurrentUser, getStoredUser, initAuthListener } from '@/lib/auth';
import type { AuthUser } from '@/lib/mock/types';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initAuthListener();

    let cancelled = false;

    const syncUser = async (showLoading: boolean) => {
      if (showLoading) setLoading(true);
      try {
        const currentUser = await getCurrentUser();
        if (!cancelled) setUser(currentUser);
      } catch (error) {
        console.error('Failed to sync auth state:', error);
        if (!cancelled) setUser(getStoredUser());
      } finally {
        if (!cancelled) {
          setLoading(false);
          setReady(true);
        }
      }
    };

    void syncUser(true);

    const handleAuthChange = () => {
      void syncUser(false);
    };

    window.addEventListener('smartbiz-auth', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      cancelled = true;
      window.removeEventListener('smartbiz-auth', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return { user, ready, loading };
}
