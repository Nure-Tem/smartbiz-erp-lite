import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { AuthUser } from './mock/types';

const STORAGE_KEY = 'smartbiz.auth.user';

type ProfileRow = {
  id: string;
  full_name?: string | null;
  name?: string | null;
  role?: string | null;
  phone?: string | null;
  avatar_url?: string | null;
};

function normalizeRole(role: unknown): 'admin' | 'cashier' | null {
  const raw = String(role ?? '').trim().toLowerCase();
  if (raw === 'admin' || raw === 'cashier') return raw;
  return null;
}

function mapAuthUser(user: User, profile: ProfileRow): AuthUser | null {
  const role = normalizeRole(profile.role);
  if (!role) {
    console.error('Profile has unknown or missing role:', profile.role);
    return null;
  }

  const email = user.email || '';
  const nameFromProfile = (profile.full_name || profile.name || '').trim();
  const nameFromEmail = email.split('@')[0]?.replace(/[._-]/g, ' ') || 'User';

  return {
    id: profile.id || user.id,
    name: nameFromProfile || nameFromEmail,
    email,
    role,
  };
}

function persistUser(authUser: AuthUser | null) {
  if (typeof window === 'undefined') return;
  if (authUser) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
  } else {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * Load role/display info from profiles using an already-known auth user.
 * Does not call getUser() again (avoids auth lock contention after sign-in).
 */
export async function loadAuthUserFromSessionUser(user: User): Promise<AuthUser | null> {
  // Select only columns that exist on public.profiles (no email column).
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, full_name, role, phone, avatar_url')
    .eq('id', user.id)
    .maybeSingle();

  if (profileError) {
    console.error('Failed to fetch profile:', profileError);
    persistUser(null);
    return null;
  }

  if (!profile) {
    console.error('No profile row found for authenticated user:', user.id);
    persistUser(null);
    return null;
  }

  const authUser = mapAuthUser(user, profile as ProfileRow);
  persistUser(authUser);
  return authUser;
}

/**
 * Get the currently authenticated user from Supabase Auth + Profiles table.
 * Fail closed: never invent an admin role when the profile is unavailable.
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      persistUser(null);
      return null;
    }

    return loadAuthUserFromSessionUser(user);
  } catch (err) {
    console.error('Unexpected error in getCurrentUser:', err);
    persistUser(null);
    return null;
  }
}

/**
 * Get stored user from localStorage (for synchronous access)
 */
export function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

/**
 * Sign in with email and password
 */
export async function signIn(
  email: string,
  password: string,
): Promise<{ user: AuthUser | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error };
    }

    if (!data.user) {
      return { user: null, error: new Error('No user returned from sign in') };
    }

    // Use the user returned by sign-in — avoid a second getUser() round-trip.
    const authUser = await loadAuthUserFromSessionUser(data.user);

    if (!authUser) {
      return {
        user: null,
        error: new Error(
          'Signed in, but your profile could not be loaded. Please try again or contact an administrator.',
        ),
      };
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('smartbiz-auth'));
    }

    return { user: authUser, error: null };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err : new Error('Failed to sign in'),
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  metadata?: { name?: string; company?: string },
): Promise<{ user: AuthUser | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: metadata?.name,
          company: metadata?.company,
          role: 'admin',
        },
      },
    });

    if (error) {
      return { user: null, error };
    }

    if (!data.user) {
      return { user: null, error: new Error('No user returned from sign up') };
    }

    const authUser = await loadAuthUserFromSessionUser(data.user);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('smartbiz-auth'));
    }

    return { user: authUser, error: null };
  } catch (err) {
    return {
      user: null,
      error: err instanceof Error ? err : new Error('Failed to sign up'),
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { error };
    }

    persistUser(null);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('smartbiz-auth'));
    }

    return { error: null };
  } catch (err) {
    return {
      error: err instanceof Error ? err : new Error('Failed to sign out'),
    };
  }
}

let authListenerStarted = false;

/**
 * Initialize auth state listener once.
 * IMPORTANT: Do not await other Supabase auth/DB calls inside the callback —
 * that can deadlock the auth client lock and hang sign-in.
 */
export function initAuthListener() {
  if (typeof window === 'undefined' || authListenerStarted) return;
  authListenerStarted = true;

  supabase.auth.onAuthStateChange((event) => {
    if (event === 'SIGNED_OUT') {
      persistUser(null);
    }

    // Defer so listeners run outside the auth lock.
    window.setTimeout(() => {
      window.dispatchEvent(new Event('smartbiz-auth'));
    }, 0);
  });
}
