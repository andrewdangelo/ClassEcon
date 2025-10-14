# OAuth Quick Start Guide

## 🚀 Quick Setup for Testing

### Step 1: Start All Services

```bash
# Terminal 1 - Auth Service
cd AuthService
pnpm install  # if not already done
pnpm run dev

# Terminal 2 - Backend
cd Backend
pnpm run dev

# Terminal 3 - Frontend
cd Frontend
pnpm run dev
```

### Step 2: Verify Services Running

- Auth Service: http://localhost:4001/health (should return `{"status":"ok","service":"auth-service"}`)
- Backend: http://localhost:4000/graphql (GraphQL Playground)
- Frontend: http://localhost:5173 (React app)

### Step 3: Test New UI (Without OAuth)

1. Navigate to http://localhost:5173/auth
2. You should see the new modern auth UI with:
   - Tabs for Login/Signup
   - Password visibility toggles
   - OAuth buttons (disabled until configured)
   - Gradient background design

3. Test regular login/signup:
   - Switch between Login and Signup tabs
   - Toggle password visibility
   - Submit forms - should work as before

### Step 4: Configure OAuth (Optional)

To enable OAuth buttons, follow the detailed setup in `OAUTH_SETUP_GUIDE.md`:

#### Quick OAuth Setup (Development)

1. **Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 Client ID
   - Add redirect URI: `http://localhost:5173/auth/callback/google`
   - Copy Client ID and Secret

2. **Add to `AuthService/.env`**:
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback/google
```

3. **Add to `Frontend/.env`**:
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

4. **Restart services** to pick up new environment variables

### Step 5: Test OAuth Flow

1. Click "Continue with Google" button
2. Select Google account
3. Grant permissions
4. Should redirect back and log you in
5. Check that you're redirected to dashboard

### Step 6: Verify Database

Check MongoDB to see new user with OAuth fields:
```javascript
db.users.find({ email: "your-google-email@gmail.com" })
```

Should see:
```json
{
  "email": "your-email@gmail.com",
  "name": "Your Name",
  "role": "STUDENT",
  "oauthProvider": "google",
  "oauthProviderId": "google_123456789",
  "profilePicture": "https://lh3.googleusercontent.com/...",
  "passwordHash": null
}
```

---

## 🧪 Testing Checklist

### UI Testing
- [ ] Login tab displays correctly
- [ ] Signup tab displays correctly
- [ ] Tab switching works smoothly
- [ ] Password visibility toggle works
- [ ] OAuth buttons display (when configured)
- [ ] Form validation shows errors
- [ ] Dark mode works
- [ ] Mobile responsive design

### Regular Auth Testing
- [ ] Can login with existing account
- [ ] Can signup new account
- [ ] Can select role (Teacher/Student/Parent)
- [ ] Student can enter join code
- [ ] Login redirects to dashboard
- [ ] Logout works

### OAuth Testing (After Configuration)
- [ ] Google OAuth button redirects to Google
- [ ] Can authenticate with Google account
- [ ] Redirects back to callback
- [ ] Creates new user if email doesn't exist
- [ ] Links to existing user if email exists
- [ ] JWT tokens generated correctly
- [ ] Redirected to dashboard after OAuth
- [ ] Microsoft OAuth works (if configured)

### Error Handling
- [ ] Shows error if OAuth code missing
- [ ] Shows error if OAuth denied
- [ ] Shows error if invalid credentials
- [ ] Shows error if network fails
- [ ] Error messages are clear and helpful

---

## 🐛 Troubleshooting

### OAuth Buttons Don't Show
**Cause**: Environment variables not set
**Fix**: Add `VITE_GOOGLE_CLIENT_ID` or `VITE_MICROSOFT_CLIENT_ID` to `Frontend/.env`

### "OAuth is not configured" Error
**Cause**: Auth Service missing OAuth credentials
**Fix**: Add credentials to `AuthService/.env` and restart service

### "Redirect URI mismatch" Error
**Cause**: URI in OAuth console doesn't match environment variable
**Fix**: Ensure exact match including protocol and trailing slashes

### OAuth Works But User Not Created
**Cause**: Backend schema issue or database connection
**Fix**: Check Backend logs, verify MongoDB connection, check User model

### Type Errors in Frontend
**Cause**: GraphQL types not generated
**Fix**: Run `cd Frontend && pnpm run codegen`

### Services Not Starting
**Cause**: Port conflicts or missing dependencies
**Fix**: 
- Check ports 4000, 4001, 5173 are free
- Run `pnpm install` in each service directory
- Check environment variables are set

---

## 📊 API Testing with curl

Test Auth Service directly:

```bash
# Health check
curl http://localhost:4001/health

# Test Google OAuth (after getting code from Google)
curl -X POST http://localhost:4001/oauth/google \
  -H "Content-Type: application/json" \
  -H "x-service-api-key: YOUR_SERVICE_API_KEY" \
  -d '{"code":"4/0AcvDMrA..."}'

# Test Microsoft OAuth
curl -X POST http://localhost:4001/oauth/microsoft \
  -H "Content-Type: application/json" \
  -H "x-service-api-key: YOUR_SERVICE_API_KEY" \
  -d '{"code":"M.C123..."}'
```

Test Backend GraphQL:

```graphql
# In GraphQL Playground: http://localhost:4000/graphql

mutation TestOAuth {
  oauthLogin(provider: GOOGLE, code: "test-code") {
    user {
      id
      email
      name
      oauthProvider
      profilePicture
    }
    accessToken
  }
}
```

---

## 🎯 Success Criteria

You'll know everything is working when:

1. ✅ New ModernAuth UI loads at `/auth`
2. ✅ Can switch between Login/Signup tabs smoothly
3. ✅ Password visibility toggles work
4. ✅ OAuth buttons show when configured
5. ✅ Clicking OAuth button redirects to provider
6. ✅ After OAuth, redirected back with code
7. ✅ User created/found in database with OAuth fields
8. ✅ JWT tokens generated and stored
9. ✅ Redirected to dashboard successfully
10. ✅ Can navigate app as authenticated user

---

## 📝 Next Steps After Testing

1. **Production Setup**:
   - Get production OAuth credentials
   - Update redirect URIs for production domain
   - Enable HTTPS
   - Add monitoring

2. **User Experience**:
   - Add profile picture display
   - Show OAuth provider in profile
   - Allow account linking/unlinking

3. **Additional Features**:
   - Add more OAuth providers
   - Implement state parameter for CSRF protection
   - Add remember me functionality

---

## 🎉 You're All Set!

The OAuth integration is complete and ready to test. Start with the regular UI testing, then configure OAuth providers as needed. Refer to `OAUTH_SETUP_GUIDE.md` for detailed provider setup instructions.

Happy testing! 🚀
