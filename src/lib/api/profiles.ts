import { supabase } from '../supabase';

/**
 * Profile type based on database schema.
 * Covers the most common column naming conventions.
 */
export interface Profile {
  id: string;
  email: string;
  name?: string;
  full_name?: string;
  role: string;           // Raw value from DB e.g. "Admin", "Cashier"
  company?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get the current user's profile from the profiles table
 */
export async function getCurrentUserProfile(): Promise<Profile | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) return null;

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return null;
    }

    return profile as Profile;
  } catch (err) {
    console.error('Unexpected error fetching profile:', err);
    return null;
  }
}

/**
 * List all profiles from the profiles table.
 * Used by Settings → Users to display real team members.
 */
export async function listProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('listProfiles error:', error);
    throw new Error(`Failed to fetch profiles: ${error.message}`);
  }

  return (data ?? []) as Profile[];
}

/**
 * Derive a display name from a profile row,
 * handling both full_name and name columns.
 */
export function profileDisplayName(profile: Profile): string {
  return (
    profile.full_name?.trim() ||
    profile.name?.trim() ||
    profile.email.split('@')[0].replace(/[._-]/g, ' ')
  );
}

/**
 * Derive initials for the avatar fallback.
 */
export function profileInitials(profile: Profile): string {
  return profileDisplayName(profile)
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
