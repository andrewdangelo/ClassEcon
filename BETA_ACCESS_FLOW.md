# Beta Access System - Complete Flow

## Updated Architecture (Fixed)

### Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     Landing Page (localhost:5174)                │
│                                                                   │
│  1. User clicks "Sign In"                                        │
│  2. Beta Access Modal opens                                      │
│  3. User enters access code (e.g., "TESTCODE")                  │
│  4. Code validated with backend GraphQL                          │
│  5. If valid:                                                    │
│     - Store code in localStorage                                 │
│     - Redirect to http://localhost:5173/auth                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Main App (localhost:5173)                     │
│                                                                   │
│  /auth route:                                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ BetaAccessGuard (checks localStorage for code)           │  │
│  │   ├─ Code exists? ✓                                      │  │
│  │   ├─ Re-validate with backend                            │  │
│  │   └─ Allow access to auth page                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                   │
│  6. User sees login/signup page                                 │
│  7. User logs in with credentials or OAuth                      │
│  8. ProtectedRoute validates authentication                     │
│  9. User enters main application                                │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Landing Page - BetaAccessModal
**Location:** `LandingPage/src/components/BetaAccessModal.tsx`

**Purpose:** Collect and validate beta access code

**Flow:**
1. User enters code
2. Validates with backend: `mutation validateBetaCode`
3. If valid:
   - Stores `betaAccessCode` in localStorage
   - Stores `betaAccessValidated='true'` in localStorage
   - Redirects to `http://localhost:5173/auth`
4. If invalid: Shows error message

### 2. Main App - BetaAccessGuard
**Location:** `Frontend/src/components/auth/BetaAccessGuard.tsx`

**Purpose:** Guard all routes requiring beta access

**Flow:**
1. Checks localStorage for `betaAccessCode` and `betaAccessValidated`
2. If missing → Redirect to landing page (`http://localhost:5174`)
3. If present → Re-validate with backend
4. If still valid → Allow access to wrapped route
5. If invalid/expired → Clear localStorage, redirect to landing page

**Applied to:**
- `/auth` - Login/signup page
- `/auth/callback/*` - OAuth callbacks
- `/onboarding` - Onboarding flow
- `/` - All authenticated routes

### 3. Protected Routes
**Location:** `Frontend/src/components/auth/ProtectedRoute.tsx`

**Purpose:** Require authentication (separate from beta access)

**Flow:**
1. User must have beta access (BetaAccessGuard)
2. AND must be authenticated (ProtectedRoute)
3. Both guards work together

## Complete User Journey

### First Time User
1. **Lands on**: `http://localhost:5174` (Landing Page)
2. **Clicks**: "Sign In" button
3. **Enters**: Beta code (e.g., "TESTCODE")
4. **Validates**: Backend checks code is valid, not expired, under max uses
5. **Redirects**: To `http://localhost:5173/auth`
6. **Sees**: Login/signup page (beta access granted)
7. **Logs in**: With email/password or OAuth
8. **Enters**: Main application

### Returning User (with code in localStorage)
1. **Goes to**: `http://localhost:5173` directly
2. **BetaAccessGuard**: Checks localStorage, finds code
3. **Re-validates**: Code with backend
4. **If valid**: Proceeds to route
5. **If not authenticated**: Redirects to `/auth`
6. **Logs in**: Proceeds to dashboard

### User Without Beta Access
1. **Tries**: `http://localhost:5173`
2. **BetaAccessGuard**: No code in localStorage
3. **Redirects**: To `http://localhost:5174` (Landing Page)
4. **Must**: Enter valid beta code to proceed

## Port Configuration

| Service | Port | URL |
|---------|------|-----|
| **Backend** | 4000 | http://localhost:4000 |
| **Frontend (Main App)** | 5173 | http://localhost:5173 |
| **Landing Page** | 5174 | http://localhost:5174 |
| **Auth Service** | 4001 | http://localhost:4001 |

## localStorage Keys

| Key | Value | Purpose |
|-----|-------|---------|
| `betaAccessCode` | "TESTCODE" | The validated beta code |
| `betaAccessValidated` | "true" | Flag that code was validated |
| `DISABLE_BETA_CHECK` | "true" | (Dev only) Bypass beta check |

## Backend CORS Configuration

**Location:** `Backend/src/index.ts`

**Allowed Origins:**
- `http://localhost:5173` - Main app
- `http://localhost:5174` - Landing page
- `http://localhost:3000` - Alternative port
- Custom origin from `CORS_ORIGIN` env var

## Development Mode

To bypass beta check during development:

```javascript
// In browser console on localhost:5173
localStorage.setItem('DISABLE_BETA_CHECK', 'true');
location.reload();
```

To re-enable:
```javascript
localStorage.removeItem('DISABLE_BETA_CHECK');
location.reload();
```

## Testing the Flow

### 1. Create a Beta Code
```bash
cd Backend
npm run generate-beta-code TESTCODE "Test code" 10
```

### 2. Test Landing Page
1. Go to `http://localhost:5174`
2. Click "Sign In"
3. Enter "TESTCODE"
4. Should see success message
5. Should redirect to `http://localhost:5173/auth`

### 3. Test Main App Direct Access
1. Clear localStorage: `localStorage.clear()`
2. Go to `http://localhost:5173`
3. Should redirect to `http://localhost:5174`
4. Enter code again
5. Should proceed to auth page

### 4. Test Code Persistence
1. Complete flow with valid code
2. Close browser
3. Open and go to `http://localhost:5173`
4. Should NOT redirect (code persists)
5. Should go to auth page or dashboard if logged in

## Security Considerations

✅ **Server-side validation**: Code validated on backend, not just client
✅ **Re-validation**: Code re-checked on every app load
✅ **Expiration**: Codes can have expiration dates
✅ **Max uses**: Limit how many people use each code
✅ **Deactivation**: Codes can be turned off instantly
✅ **Usage tracking**: Know who used which code

## Troubleshooting

### "Access Denied" on main app
- Check localStorage has `betaAccessCode`
- Try entering code again on landing page
- Check backend is running
- Check code hasn't expired

### Stuck in redirect loop
- Clear localStorage: `localStorage.clear()`
- Start fresh on landing page

### CORS errors
- Check backend CORS allows both 5173 and 5174
- Restart backend after config changes

### Code not validating
- Check backend is running on port 4000
- Check MongoDB is running
- Check code exists in database
- Check code is active and not expired

## Key Changes from Original Implementation

1. **Moved BetaAccessGuard**: From global wrapper to per-route basis
2. **Allows /auth route**: Users can reach login page with beta code
3. **Separation of concerns**: 
   - Beta access = Can see the app at all
   - Authentication = Logged in user
4. **Clear flow**: Landing → Beta → Auth → App
5. **Development mode**: Can bypass beta check for testing

## Next Steps for Production

1. Update URLs from localhost to production domains
2. Set environment variables for different environments
3. Add analytics to track beta code usage
4. Create admin dashboard for code management
5. Add email integration for sending codes
6. Consider removing beta system after launch
