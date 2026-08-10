import { supabase } from './supabase';
import type { AuthUser } from './mock/types';

const STORAGE_KEY = 'smartbiz.auth.user';

/**
 * Get the currently authenticated user from Supabase Auth + Profiles table
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    // Get authenticated user from Supabase Auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    // Fetch user profile from profiles table (source of truth for role)
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Failed to fetch profile:', profileError);
      // Fallback to basic user info if profile fetch fails
      const authUser: AuthUser = {
        id: user.id,
        name: user.user_metadata?.['name'] || user.email?.split('@')[0]?.replace(/[._-]/g, ' ') || 'User',
        email: user.email || '',
        role: 'admin', // Default fallback
      };
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
      }
      
      return authUser;
    }

    // Map profile data to AuthUser type
    // Handle both camelCase and snake_case column names
    const authUser: AuthUser = {
      id: profile.id,
      name: profile.full_name || profile.name || profile.email?.split('@')[0]?.replace(/[._-]/g, ' ') || 'User',
      email: profile.email || user.email || '',
      role: (profile.role?.toLowerCase() === 'cashier' ? 'cashier' : 'admin') as 'admin' | 'cashier',
    };

    // Store user in localStorage for synchronous access
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    }

    return authUser;
  } catch (err) {
    console.error('Unexpected error in getCurrentUser:', err);
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
export async function signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: Error | null }> {
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

    const authUser = await getCurrentUser();
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('smartbiz-auth'));
    }

    return { user: authUser, error: null };
  } catch (err) {
    return { 
      user: null, 
      error: err instanceof Error ? err : new Error('Failed to sign in') 
    };
  }
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string, 
  password: string, 
  metadata?: { name?: string; company?: string }
): Promise<{ user: AuthUser | null; error: Error | null }> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: metadata?.name,
          company: metadata?.company,
          role: 'admin', // Default role for new signups
        },
      },
    });

    if (error) {
      return { user: null, error };
    }

    if (!data.user) {
      return { user: null, error: new Error('No user returned from sign up') };
    }

    const authUser = await getCurrentUser();
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('smartbiz-auth'));
    }

    return { user: authUser, error: null };
  } catch (err) {
    return { 
      user: null, 
      error: err instanceof Error ? err : new Error('Failed to sign up') 
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

    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new Event('smartbiz-auth'));
    }

    return { error: null };
  } catch (err) {
    return { 
      error: err instanceof Error ? err : new Error('Failed to sign out') 
    };
  }
}

/**
 * Initialize auth state listener
 */
export function initAuthListener() {
  if (typeof window === 'undefined') return;

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      await getCurrentUser();
    } else if (event === 'SIGNED_OUT') {
      window.localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new Event('smartbiz-auth'));
  });
}
