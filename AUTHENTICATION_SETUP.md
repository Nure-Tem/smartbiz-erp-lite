# Authentication Setup - SmartBiz ERP Lite

## Overview
The SmartBiz ERP Lite frontend has been successfully connected to Supabase Authentication. This document outlines the implementation details and how the authentication system works.

## Files Created

### 1. `src/lib/auth.ts`
Core authentication utilities that interface with Supabase Auth:
- `getCurrentUser()` - Fetches the authenticated user from Supabase
- `getStoredUser()` - Gets cached user from localStorage  
- `signIn(email, password)` - Email/password authentication
- `signUp(email, password, metadata)` - User registration with custom metadata
- `signOut()` - Logout functionality
- `initAuthListener()` - Monitors auth state changes

### 2. `src/hooks/use-auth.ts`
React hook for managing authentication state:
- Returns `{ user, ready, loading }` to components
- Initializes auth state listener on mount
- Listens for auth changes across browser tabs
- Automatically refreshes on storage events

### 3. `src/lib/route-guards.ts`
Route protection utilities:
- `requireAuth()` - Protects routes requiring authentication
- `redirectIfAuthenticated()` - Redirects logged-in users from auth pages

## Files Updated

### Authentication Pages (Already Existed)
1. **`src/routes/login.tsx`**
   - Connected to Supabase `signIn()` API
   - Added `beforeLoad: redirectIfAuthenticated` guard
   - Loading and error states
   - Updated subtitle to remove "demo" messaging

2. **`src/routes/register.tsx`**
   - Connected to Supabase `signUp()` API  
   - Added `beforeLoad: redirectIfAuthenticated` guard
   - Passes name and company to user metadata
   - Updated subtitle to remove "mock" messaging

3. **`src/routes/forgot-password.tsx`**
   - Connected to Supabase password reset
   - Added `beforeLoad: redirectIfAuthenticated` guard
   - Sends reset email via `supabase.auth.resetPasswordForEmail()`

### Protected Routes (All Updated)
Added `beforeLoad: requireAuth` to protect these routes:
- `src/routes/index.tsx` (Dashboard)
- `src/routes/products.tsx`
- `src/routes/categories.tsx`
- `src/routes/customers.tsx`
- `src/routes/inventory.tsx`
- `src/routes/sales.tsx`
- `src/routes/reports.tsx`
- `src/routes/settings.tsx`

### Layout Components
- **`src/components/layout/app-layout.tsx`**
  - Updated to use `useAuth()` instead of `useMockAuth()`
  - Displays authenticated user's name/email
  - Sign out button connected to Supabase `signOut()`

## How Authentication Works

### 1. Session Management
- Uses `supabase.auth.getSession()` to check for existing sessions
- `supabase.auth.onAuthStateChange()` monitors auth events
- Session persists in Supabase (secure HttpOnly cookies)
- User data cached in localStorage for synchronous access

### 2. Route Protection
```typescript
// Protected routes check for session before loading
beforeLoad: async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    throw redirect({ to: '/login' });
  }
}

// Auth pages redirect if already logged in  
beforeLoad: async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    throw redirect({ to: '/' });
  }
}
```

### 3. User Registration Flow
When a user registers via `/register`:
1. Form data (name, company, email, password) is submitted
2. `signUp()` calls `supabase.auth.signUp()` with user metadata
3. Supabase creates user in `auth.users` table
4. User metadata (name, company, role) stored in `user.user_metadata`
5. **Check your database for triggers/functions** that may auto-create profile records

### 4. Session Persistence
- User stays logged in after browser refresh
- Session checked on every protected route access
- Token automatically refreshed by Supabase client
- Cross-tab synchronization via storage events

### 5. Sign Out
- Clears Supabase session
- Removes localStorage cache
- Redirects to `/login`
- Broadcasts auth change event to all tabs

## Profile Management

### User Metadata Storage
User registration stores this metadata in `auth.users.user_metadata`:
```json
{
  "name": "John Doe",
  "company": "Acme Corp", 
  "role": "admin"
}
```

### Profile Table Integration
**IMPORTANT:** Check if your Supabase project has:

1. **A `profiles` table** - Common pattern for storing extended user data
2. **Database triggers** - May auto-create profile on user signup
3. **Database functions** - `handle_new_user()` is a common name

To check for existing triggers/functions:
```sql
-- Check for triggers
SELECT * FROM pg_trigger WHERE tgname LIKE '%user%' OR tgname LIKE '%profile%';

-- Check for functions
SELECT proname, prosrc FROM pg_proc WHERE proname LIKE '%user%' OR proname LIKE '%profile%';
```

**If auto-profile creation exists:** The current implementation will work seamlessly.

**If it doesn't exist:** You may need to:
- Create a profile manually after registration, OR
- Add a database trigger to auto-create profiles

## Testing Instructions

### 1. Test Registration
1. Navigate to `/register`
2. Fill in:
   - Full name: "Test User"
   - Business name: "Test Business"
   - Email: "test@example.com"
   - Password: "test1234"
   - Confirm password: "test1234"
3. Click "Create account"
4. Expected behavior:
   - Success toast appears
   - Redirected to dashboard `/`
   - Top-right shows user name/email
5. Check Supabase Dashboard:
   - Authentication > Users
   - Should see new user with metadata

### 2. Test Login
1. Sign out if logged in
2. Navigate to `/login`
3. Enter registered credentials
4. Click "Sign in"
5. Expected behavior:
   - Success toast appears
   - Redirected to dashboard
   - User name displayed in header

### 3. Test Route Protection
1. Sign out
2. Try to access `/products` directly
3. Expected behavior:
   - Redirected to `/login`
   - Can login and access `/products`

### 4. Test Forgot Password
1. Navigate to `/forgot-password`
2. Enter registered email
3. Click "Send reset link"
4. Expected behavior:
   - Success toast appears
   - Check email for reset link
   - Reset link should go to `/reset-password` (needs to be implemented if password reset page is needed)

### 5. Test Session Persistence
1. Login successfully
2. Refresh the browser
3. Expected behavior:
   - User stays logged in
   - Dashboard loads normally

### 6. Test Cross-Tab Sync
1. Login in one browser tab
2. Open another tab with the app
3. Sign out in one tab
4. Expected behavior:
   - Both tabs redirect to `/login`

## Environment Variables

Required in `.env.local`:
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Security Notes

1. **RLS (Row Level Security)** - Not modified in this implementation
2. **Password validation** - Minimum 6 characters (Supabase default: 6-72 chars)
3. **Email verification** - Controlled by Supabase project settings
4. **Session tokens** - Managed by Supabase (1 hour default, auto-refresh)

## Next Steps

1. **Verify profile creation:**
   - Register a test user
   - Check if a `profiles` table record was auto-created
   - If not, decide whether to create triggers or handle profiles in app code

2. **Diagnose RLS issues:**
   - Once auth is working, test database queries
   - Check RLS policies on `products`, `categories`, etc.
   - May need to update policies to work with authenticated users

3. **Implement reset password page** (optional):
   - Create `/reset-password` route
   - Handle password update via `supabase.auth.updateUser()`

4. **Email verification flow** (if enabled in Supabase):
   - Update registration success message
   - Handle email confirmation redirect

## Removed Features

- ✅ Mock authentication (`useMockAuth`, `mockSignIn`, `mockSignOut`)
- ✅ Guest user behavior
- ✅ Demo credentials messaging
- ✅ Browser-only storage of auth state

## Current Status

✅ **Implemented:**
- Supabase Auth integration
- Login, Register, Forgot Password pages
- Route protection for all dashboard pages
- Session persistence across page refreshes
- Cross-tab authentication sync
- Real user display in app header
- Proper sign out functionality

⚠️ **Needs Verification:**
- Profile table auto-creation (check database)
- RLS policies compatibility with auth
- Email verification flow (if enabled)

🔜 **Optional Enhancements:**
- Password reset page (`/reset-password`)
- Email verification reminder
- Social auth providers (Google, GitHub, etc.)
- Multi-factor authentication
