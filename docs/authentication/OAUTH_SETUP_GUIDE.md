# OAuth Integration Guide for ClassEcon

Complete guide to enable Google and Microsoft OAuth authentication in ClassEcon.

## 📋 Overview

ClassEcon now supports OAuth authentication with:
- **Google OAuth 2.0** - Sign in with Google accounts
- **Microsoft OAuth 2.0** - Sign in with Microsoft/Azure AD accounts

## 🎨 UI Improvements

### New Modern Auth UI
- ✅ Tabbed interface (Login/Signup)
- ✅ Password visibility toggles
- ✅ Gradient backgrounds
- ✅ Improved validation messages
- ✅ OAuth provider buttons
- ✅ Responsive design
- ✅ Dark mode support

## 🔐 OAuth Setup

### Prerequisites
- Google Cloud Console account (for Google OAuth)
- Microsoft Azure account (for Microsoft OAuth)
- Auth Service running
- Frontend running

---

## Google OAuth Setup

### Step 1: Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Configure consent screen if prompted:
   - **Application name**: ClassEcon
   - **User support email**: Your email
   - **Authorized domains**: `localhost` (for development)
6. Create OAuth client ID:
   - **Application type**: Web application
   - **Name**: ClassEcon Web Client
   - **Authorized JavaScript origins**:
     ```
     http://localhost:5173
     ```
   - **Authorized redirect URIs**:
     ```
     http://localhost:5173/auth/callback/google
     http://localhost:4001/oauth/google/callback
     ```
7. Save the **Client ID** and **Client Secret**

### Step 2: Configure Auth Service

Add to `AuthService/.env`:

```env
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret-here
GOOGLE_REDIRECT_URI=http://localhost:4001/oauth/google/callback
```

### Step 3: Configure Frontend

Add to `Frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id-here.apps.googleusercontent.com
VITE_AUTH_SERVICE_URL=http://localhost:4001
```

---

## Microsoft OAuth Setup

### Step 1: Register Azure AD Application

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Click **New registration**
4. Configure application:
   - **Name**: ClassEcon
   - **Supported account types**: 
     - Choose "Accounts in any organizational directory and personal Microsoft accounts"
   - **Redirect URI**: 
     - Platform: **Web**
     - URI: `http://localhost:5173/auth/callback/microsoft`
5. Click **Register**

### Step 2: Configure Application

1. In the app overview, note the **Application (client) ID**
2. Go to **Certificates & secrets**
3. Click **New client secret**
   - **Description**: ClassEcon Secret
   - **Expires**: Choose duration (e.g., 24 months)
4. Save the **secret value** (you won't see it again!)
5. Go to **API permissions**
   - **Add permission** → **Microsoft Graph** → **Delegated permissions**
   - Add these permissions:
     - `openid`
     - `email`
     - `profile`
     - `User.Read`
6. Click **Grant admin consent** (if you have admin rights)

### Step 3: Configure Auth Service

Add to `AuthService/.env`:

```env
# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-azure-app-client-id-here
MICROSOFT_CLIENT_SECRET=your-client-secret-value-here
MICROSOFT_REDIRECT_URI=http://localhost:4001/oauth/microsoft/callback
```

### Step 4: Configure Frontend

Add to `Frontend/.env`:

```env
VITE_MICROSOFT_CLIENT_ID=your-azure-app-client-id-here
VITE_AUTH_SERVICE_URL=http://localhost:4001
```

---

## 🚀 Testing OAuth Flow

### Google OAuth Test

1. Start Auth Service and Frontend
2. Navigate to http://localhost:5173/auth
3. Click **Continue with Google**
4. Select Google account
5. Grant permissions
6. Should redirect back and create/login user

### Microsoft OAuth Test

1. Start Auth Service and Frontend
2. Navigate to http://localhost:5173/auth
3. Click **Continue with Microsoft**
4. Enter Microsoft account credentials
5. Grant permissions
6. Should redirect back and create/login user

---

## 🔄 OAuth Flow Diagram

```
┌─────────┐         ┌──────────┐         ┌────────────┐         ┌─────────┐
│ Browser │         │ Frontend │         │Auth Service│         │ Provider│
└────┬────┘         └─────┬────┘         └──────┬─────┘         └────┬────┘
     │                    │                     │                    │
     │ Click Google/MS    │                     │                    │
     │───────────────────▶│                     │                    │
     │                    │                     │                    │
     │                    │ Redirect to OAuth   │                    │
     │                    │────────────────────────────────────────▶│
     │                    │                     │                    │
     │                    │      User authenticates                  │
     │                    │◀────────────────────────────────────────│
     │                    │                     │                    │
     │ Redirect with code │                     │                    │
     │◀──────────────────────────────────────────                   │
     │                    │                     │                    │
     │    Send code       │                     │                    │
     │───────────────────▶│  Exchange code      │                    │
     │                    │────────────────────▶│                    │
     │                    │                     │ Verify with OAuth  │
     │                    │                     │───────────────────▶│
     │                    │                     │                    │
     │                    │                     │ User info          │
     │                    │                     │◀───────────────────│
     │                    │                     │                    │
     │                    │  JWT tokens         │                    │
     │                    │◀────────────────────│                    │
     │                    │                     │                    │
     │   Login success    │                     │                    │
     │◀───────────────────│                     │                    │
     │                    │                     │                    │
```

---

## 🛠️ Implementation Details

### Frontend OAuth Handler

Located in `Frontend/src/components/auth/ModernAuth.tsx`:

```typescript
const handleGoogleAuth = () => {
  const redirectUri = `${window.location.origin}/auth/callback/google`;
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid%20email%20profile`;
  window.location.href = authUrl;
};
```

### Backend OAuth Callback

Located in `AuthService/src/oauth.ts`:

```typescript
async handleGoogleCallback(code: string): Promise<OAuthUserInfo> {
  // Exchange code for tokens
  // Fetch user info
  // Return standardized user data
}
```

---

## 🔒 Security Considerations

### OAuth Best Practices

1. **Never expose client secrets in frontend**
   - Only use client ID in frontend
   - Keep secrets in Auth Service

2. **Use HTTPS in production**
   - OAuth providers require HTTPS for redirect URIs
   - Update redirect URIs for production domains

3. **Validate state parameter**
   - Implement CSRF protection with state parameter
   - Verify state matches on callback

4. **Secure token storage**
   - Store tokens in httpOnly cookies
   - Never store tokens in localStorage for OAuth

5. **Implement token refresh**
   - OAuth tokens expire
   - Implement refresh token flow

### Production Checklist

- [ ] Register production domains in OAuth provider
- [ ] Update redirect URIs to use HTTPS
- [ ] Enable state parameter validation
- [ ] Implement proper error handling
- [ ] Add logging for OAuth events
- [ ] Set up monitoring for failed OAuth attempts
- [ ] Document user consent screens
- [ ] Test with multiple account types

---

## 📝 Environment Variables Summary

### Auth Service (.env)

```env
# Required
JWT_SECRET=<32-byte-hex>
REFRESH_JWT_SECRET=<32-byte-hex>
SERVICE_API_KEY=<32-byte-hex>

# Google OAuth (optional)
GOOGLE_CLIENT_ID=<from-google-console>
GOOGLE_CLIENT_SECRET=<from-google-console>
GOOGLE_REDIRECT_URI=http://localhost:4001/oauth/google/callback

# Microsoft OAuth (optional)
MICROSOFT_CLIENT_ID=<from-azure-portal>
MICROSOFT_CLIENT_SECRET=<from-azure-portal>
MICROSOFT_REDIRECT_URI=http://localhost:4001/oauth/microsoft/callback
```

### Frontend (.env)

```env
VITE_GRAPHQL_URL=http://localhost:4000/graphql
VITE_AUTH_SERVICE_URL=http://localhost:4001

# OAuth (optional - leave empty to hide buttons)
VITE_GOOGLE_CLIENT_ID=<from-google-console>
VITE_MICROSOFT_CLIENT_ID=<from-azure-portal>
```

---

## 🎨 UI Customization

### Disable OAuth Buttons

Leave environment variables empty:

```env
VITE_GOOGLE_CLIENT_ID=
VITE_MICROSOFT_CLIENT_ID=
```

OAuth buttons will be automatically disabled.

### Custom OAuth Providers

To add more providers (GitHub, LinkedIn, etc.):

1. Add provider configuration to `AuthService/src/config.ts`
2. Implement provider handler in `AuthService/src/oauth.ts`
3. Add route in `AuthService/src/routes.ts`
4. Add button in `Frontend/src/components/auth/ModernAuth.tsx`

---

## 🐛 Troubleshooting

### "OAuth is not configured"

- Check environment variables are set
- Verify client IDs are not empty
- Restart services after updating .env

### "Redirect URI mismatch"

- Ensure redirect URI in OAuth provider matches exactly
- Include protocol (http/https)
- Check for trailing slashes

### "Invalid client ID"

- Verify client ID is correct
- Check for extra spaces in .env file
- Ensure OAuth app is enabled in console

### "Access denied"

- User didn't grant required permissions
- Check OAuth scopes are correct
- Verify consent screen is configured

---

## 📚 Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Microsoft Identity Platform](https://docs.microsoft.com/en-us/azure/active-directory/develop/)
- [OAuth 2.0 Security Best Practices](https://oauth.net/2/security/)

---

## 🎉 Summary

You now have:

✅ Modern, professional auth UI
✅ Google OAuth integration (ready to configure)
✅ Microsoft OAuth integration (ready to configure)
✅ Secure token management
✅ Production-ready architecture

To enable OAuth:
1. Follow setup steps for your chosen provider(s)
2. Add credentials to environment variables
3. Test the OAuth flow
4. Deploy with HTTPS in production
