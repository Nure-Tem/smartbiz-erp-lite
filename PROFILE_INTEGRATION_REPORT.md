# Profile Integration Report

## Changes Made

### 1. **Profiles Table Query**

**Query used to retrieve current user's profile:**
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();
```

**Expected Profile Columns:**
The code handles both common naming conventions:
- `id` (UUID, primary key, matches auth.users.id)
- `email` (user's email address)
- `name` or `full_name` (user's display name)
- `role` (application role: 'Admin' or 'Cashier', case-insensitive)
- `company` (optional, business name)
- `created_at`, `updated_at` (optional timestamps)

### 2. **Files Changed**

#### Created:
- **`src/lib/api/profiles.ts`**
  - New module for profile-related API functions
  - `getCurrentUserProfile()` - fetches profile from database
  - `inspectProfileColumns()` - utility for debugging column names

#### Modified:
- **`src/lib/auth.ts`**
  - Updated `getCurrentUser()` function
  - **Before:** Read role from `user.user_metadata.role` (set during signup)
  - **After:** Fetch profile from `profiles` table and read role from database
  - Handles both `name` and `full_name` columns
  - Normalizes role to lowercase for comparison
  - Falls back gracefully if profile fetch fails

- **`src/components/layout/app-layout.tsx`**
  - Removed "Demo workspace" section entirely
  - Removed "Running on sample data until your backend is connected" message
  - Sidebar now shows only navigation links

### 3. **How Cashier Role is Now Obtained**

**Previous (INCORRECT):**
```typescript
role: (user.user_metadata?.role as 'admin' | 'cashier') || 'admin'
```
- Read from user metadata set during registration
- Not the source of truth
- Could be out of sync with database

**Current (CORRECT):**
```typescript
// 1. Authenticate user via Supabase Auth
const { data: { user } } = await supabase.auth.getUser();

// 2. Fetch profile from database using auth.uid()
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

// 3. Read role from profiles table (source of truth)
role: (profile.role?.toLowerCase() === 'cashier' ? 'cashier' : 'admin')
```

**Flow:**
1. User logs in → Supabase Auth validates credentials
2. `getCurrentUser()` is called
3. Fetches authenticated user's `id` from Supabase Auth
4. Queries `profiles` table WHERE `id = auth.uid()`
5. Extracts `role` column value (e.g., "Cashier")
6. Normalizes to lowercase and maps to `'admin' | 'cashier'` type
7. Stores in localStorage and returns to UI

### 4. **Frontend Display of Real User Profile**

**User Information Now Displayed:**
- ✅ **Name**: Pulled from `profile.full_name` or `profile.name`
- ✅ **Email**: Pulled from `profile.email`
- ✅ **Role**: Pulled from `profile.role` (e.g., "Cashier")
- ✅ **ID**: Matches `auth.users.id`

**Where Displayed:**
- Top-right user avatar and dropdown (app-layout.tsx)
- "Guest user" replaced with actual user name
- Role badge correctly shows "Cashier" if that's the database value

**No Longer Displayed:**
- ❌ "Demo workspace" message
- ❌ "Running on sample data until your backend is connected"

### 5. **What Still Uses Demo/Hardcoded Data**

**Settings Page (Intentionally Not Changed):**
- Company information (Business name, Contact email, Phone, Tax number, Address)
- Team members list
- These are company-wide settings, not user-specific
- Will be connected to database in a separate task

**Dashboard & Reports:**
- Revenue trend data
- Sales by category
- Weekly orders chart
- Sample statistics
- These use mock data from `src/lib/mock/db.ts`

**Already Connected to Supabase:**
- ✅ Products (using real database)
- ✅ Categories (using real database)
- ✅ Authentication (using real Supabase Auth)
- ✅ User Profiles (using real database)

## Testing Instructions

1. **Login** at http://localhost:8081/login with your Cashier user
2. **Check top-right corner** - Should show your real name/email
3. **Click on avatar** - Should show your real email
4. **Look at sidebar** - "Demo workspace" message should be gone
5. **Open browser console** - Check for any profile fetch errors
6. **Verify role** - Console should log the role as "cashier" (lowercase)

## Technical Notes

### Role Handling
- Database role can be "Cashier" (capitalized)
- Code normalizes to "cashier" (lowercase) for type safety
- TypeScript type: `'admin' | 'cashier'`

### Fallback Behavior
If profile fetch fails:
- Uses auth user's email
- Derives name from email
- Defaults role to "admin"
- Logs error to console for debugging

### Column Name Flexibility
Code handles multiple naming conventions:
- `full_name` or `name` for display name
- Case-insensitive role matching
- Graceful handling of missing optional fields

## Conclusion

✅ **Frontend now reads user role from profiles table**  
✅ **Cashier role correctly displayed**  
✅ **Real user name/email shown in UI**  
✅ **Demo workspace message removed**  
✅ **Source of truth: profiles table, not user_metadata**  
✅ **Graceful error handling and fallbacks**  

The authentication layer is now fully integrated with the Supabase database profile system.
