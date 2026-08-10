import { redirect, isRedirect } from '@tanstack/react-router';
import { supabase } from './supabase';

/**
 * Check if user is authenticated.
 * Called in beforeLoad — runs on both server and client.
 */
export async function requireAuth() {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    throw redirect({ to: '/login' });
  }

  return { session };
}

/**
 * Redirect already-authenticated users away from auth pages (login/register).
 */
export async function redirectIfAuthenticated() {
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    throw redirect({ to: '/' });
  }
}
