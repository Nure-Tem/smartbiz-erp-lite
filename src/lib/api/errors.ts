import type { PostgrestError } from '@supabase/supabase-js';

/**
 * Translate raw Supabase/PostgREST errors into user-friendly messages.
 * RLS denials surface as 42501 (insert/update/delete) or as an empty
 * result set on `.select().single()` (PGRST116) when the row exists but
 * the policy hides it from the current user.
 */
export function describeSupabaseError(
  error: PostgrestError,
  action: 'create' | 'update' | 'delete' | 'load',
  entity: string,
): string {
  const code = error.code ?? '';

  if (code === '42501' || /row-level security/i.test(error.message)) {
    return `You do not have permission to ${action} ${entity}. Ask an administrator.`;
  }

  if (code === 'PGRST116' || /coerce the result to a single JSON object/i.test(error.message)) {
    return action === 'update'
      ? `The ${entity} could not be updated — it no longer exists or your role is not allowed to change it.`
      : `The ${entity} could not be found.`;
  }

  if (code === '23505') {
    return `That ${entity} already exists.`;
  }

  if (code === '23503') {
    return `This ${entity} is still referenced by other records and cannot be ${
      action === 'delete' ? 'deleted' : 'changed'
    }.`;
  }

  return error.message || `Failed to ${action} ${entity}.`;
}
