import { redirect } from '@tanstack/react-router';
import { supabase } from './supabase';

/**
 * Supabase persists the session in browser storage, which the SSR server
 * cannot read. Running the session check on the server therefore always
 * failed and bounced the user to /login on refresh.
 *
 * These guards run on the client only; the real security boundary is
 * Supabase RLS, which validates the user's JWT on every request.
 */
const isBrowser = () => typeof window !== 'undefined';

/**
 * Check if user is authenticated (client-side only).
 */
export async function requireAuth() {
  if (!isBrowser()) return;

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
  if (!isBrowser()) return;

  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    throw redirect({ to: '/' });
  }
}
