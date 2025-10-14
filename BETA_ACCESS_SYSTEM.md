# Beta Access System Documentation

## Overview

The Beta Access System gates the ClassEcon application during a closed beta period. Users must enter a valid beta access code on the landing page before they can access the main application.

## Architecture

### Backend Components

#### 1. BetaAccessCode Model (`Backend/src/models/BetaAccessCode.ts`)

Mongoose model for storing and managing beta access codes:

**Schema Fields:**
- `code`: String (unique, uppercase, required) - The actual access code
- `description`: String (optional) - Description/notes about the code
- `maxUses`: Number (default: 1) - Maximum number of times the code can be used
- `currentUses`: Number (default: 0) - Current number of times the code has been used
- `expiresAt`: Date (optional) - When the code expires
- `isActive`: Boolean (default: true) - Whether the code is currently active
- `usedBy`: Array of ObjectId - References to User IDs who have used this code
- `createdAt`: Date (auto-generated) - When the code was created

**Indexes:**
- `code` - For fast lookups
- `isActive` - For filtering active codes

#### 2. User Model Updates (`Backend/src/models/User.ts`)

Added `hasBetaAccess` field:
- `hasBetaAccess`: Boolean (default: false) - Whether the user has validated beta access

#### 3. GraphQL Schema (`Backend/src/schema.ts`)

**Types:**
```graphql
type BetaAccessCode {
  id: ID!
  code: String!
  description: String
  maxUses: Int!
  currentUses: Int!
  expiresAt: DateTime
  isActive: Boolean!
  usedBy: [User!]!
  createdAt: DateTime!
}

type BetaAccessValidation {
  valid: Boolean!
  message: String!
  code: BetaAccessCode
}
```

**Mutations:**
```graphql
validateBetaCode(code: String!): BetaAccessValidation!
createBetaCode(code: String!, description: String, maxUses: Int = 1, expiresAt: DateTime): BetaAccessCode!
deactivateBetaCode(id: ID!): BetaAccessCode!
```

#### 4. Resolvers (`Backend/src/resolvers/Mutation.ts`)

**validateBetaCode**
- Validates a beta access code
- Checks if code exists, is active, not expired, and under max uses
- If user is authenticated, marks them as having beta access
- Returns validation result with success/error message

**createBetaCode**
- Creates a new beta access code (teacher only)
- Converts code to uppercase
- Validates uniqueness
- Returns the created code

**deactivateBetaCode**
- Deactivates a beta access code (teacher only)
- Returns the updated code

### Frontend Components

#### 1. Landing Page Modal (`LandingPage/src/components/BetaAccessModal.tsx`)

Modal component shown when users click "Sign In" on the landing page:

**Features:**
- Input field for access code (auto-uppercase)
- Real-time validation with GraphQL mutation
- Success/error states with appropriate messages
- Stores validated code in localStorage
- Redirects to main app after successful validation
- Link to waitlist for users without codes

**States:**
- `idle` - Initial state
- `validating` - Code is being validated
- `success` - Code is valid, redirecting
- `error` - Invalid code or validation failed

#### 2. Header Updates (`LandingPage/src/components/Header.tsx`)

- Replaced "Sign In" link with button that opens BetaAccessModal
- Works on both desktop and mobile navigation
- Manages modal open/close state

#### 3. Beta Access Guard (`Frontend/src/components/auth/BetaAccessGuard.tsx`)

HOC that protects the entire main application:

**Flow:**
1. Checks localStorage for `betaAccessValidated` and `betaAccessCode`
2. If not found, redirects to landing page (localhost:3000)
3. If found, re-validates code with server
4. If code is invalid/expired/deactivated, clears localStorage and redirects
5. If code is valid, allows access to application

**UI States:**
- Loading: Shield icon with "Verifying Access" message
- Error: Alert icon with error message and auto-redirect
- Success: Renders children (app content)

#### 4. Beta Codes Management Page (`Frontend/src/modules/admin/BetaCodesManagement.tsx`)

Admin interface for teachers to create beta access codes:

**Features:**
- Form to create new codes with:
  - Code (required, auto-uppercase)
  - Description (optional)
  - Max uses (default: 1)
  - Expiration date (optional)
- Success/error notifications
- Apollo Client integration with GraphQL mutations
- Responsive design with Tailwind CSS
- Info box explaining how beta codes work

**Route:** `/admin/beta-codes` (teacher only)

## Flow Diagram

```
Landing Page (localhost:3000)
    |
    v
User clicks "Sign In"
    |
    v
Beta Access Modal Opens
    |
    v
User enters code
    |
    v
GraphQL validateBetaCode mutation
    |
    +-- Invalid -----> Error message
    |
    +-- Valid -------> Store in localStorage
                      |
                      v
                   Redirect to Main App (localhost:5174/auth)
                      |
                      v
                   BetaAccessGuard checks localStorage
                      |
                      +-- No code -----> Redirect to Landing Page
                      |
                      +-- Code exists --> Re-validate with server
                                         |
                                         +-- Invalid --> Clear storage, redirect
                                         |
                                         +-- Valid ----> Allow access to app
```

## localStorage Keys

- `betaAccessValidated`: "true" if user has validated a code
- `betaAccessCode`: The actual code that was validated (uppercase)

## Security Considerations

1. **Server-Side Validation**: Code validation happens on the server, not just client-side
2. **Re-Validation**: App re-validates the code on load to catch expired/deactivated codes
3. **Teacher-Only Creation**: Only teachers can create/deactivate codes
4. **Usage Tracking**: Codes track which users have used them
5. **Max Uses**: Prevents code sharing beyond intended audience
6. **Expiration**: Time-based access control

## Usage Instructions

### For Teachers

1. Navigate to `/admin/beta-codes` in the main app
2. Fill out the form:
   - Enter a memorable code (e.g., "TEACHER2024")
   - Add a description for tracking
   - Set max uses (default: 1 per code)
   - Optionally set expiration date
3. Click "Create Beta Code"
4. Share the code with beta testers
5. Users can use the code to access the application

### For Beta Testers

1. Visit the landing page (localhost:3000)
2. Click "Sign In" button
3. Enter the beta access code provided
4. Click "Verify Access"
5. If valid, you'll be redirected to the main application
6. The code is saved in your browser for future visits

## Database Migration

### Adding hasBetaAccess to Existing Users

If you have existing users in the database, you may want to grant them beta access:

```javascript
// MongoDB command to grant beta access to all existing users
db.users.updateMany(
  {},
  { $set: { hasBetaAccess: false } }
);

// Grant beta access to specific users
db.users.updateMany(
  { role: "TEACHER" },
  { $set: { hasBetaAccess: true } }
);
```

### Creating Initial Beta Codes

You can create beta codes directly in MongoDB:

```javascript
db.betaaccesscodes.insertOne({
  code: "BETA2024",
  description: "Initial beta access code",
  maxUses: 100,
  currentUses: 0,
  isActive: true,
  usedBy: [],
  createdAt: new Date()
});
```

## Testing

### Manual Testing Steps

1. **Create a Beta Code:**
   - Login as a teacher
   - Go to `/admin/beta-codes`
   - Create a code (e.g., "TEST123")

2. **Validate Code on Landing Page:**
   - Open landing page in incognito/private window
   - Click "Sign In"
   - Enter "TEST123"
   - Should redirect to main app

3. **Test Invalid Code:**
   - Open landing page
   - Click "Sign In"
   - Enter "INVALID"
   - Should show error message

4. **Test Max Uses:**
   - Create a code with maxUses: 1
   - Use it successfully
   - Try to use it again (should fail)

5. **Test Expiration:**
   - Create a code with past expiration date
   - Try to use it (should fail)

6. **Test Deactivation:**
   - Create a code
   - Deactivate it
   - Try to use it (should fail)

## Environment Variables

The system currently uses hardcoded URLs. For production, update:

**Landing Page (`BetaAccessModal.tsx`):**
- GraphQL endpoint: `http://localhost:4000/graphql`
- Redirect URL: `http://localhost:5174/auth`

**Main App (`BetaAccessGuard.tsx`):**
- GraphQL endpoint: `http://localhost:4000/graphql`
- Landing page URL: `http://localhost:3000`

## Future Enhancements

1. **Admin Dashboard:**
   - View all created codes
   - See usage statistics
   - Bulk create/deactivate codes
   - Export code list

2. **Code Analytics:**
   - Track who used which code
   - See conversion rates
   - Monitor code performance

3. **Email Integration:**
   - Send codes via email
   - Automated code generation
   - Invitation system

4. **Code Types:**
   - Single-use codes
   - Team codes
   - Role-specific codes (teacher vs student)
   - Time-limited access (not just expiration)

5. **Waitlist Integration:**
   - Auto-generate codes for waitlist users
   - Priority access system
   - Automated invitations

## Troubleshooting

### Code Not Validating

1. Check backend is running on port 4000
2. Check MongoDB connection
3. Verify code exists in database
4. Check code is active and not expired
5. Verify maxUses not exceeded

### Not Redirecting to Main App

1. Check localStorage has `betaAccessValidated` and `betaAccessCode`
2. Verify redirect URL in BetaAccessModal
3. Check console for errors

### Guard Blocking Access

1. Check localStorage keys exist
2. Verify code is still valid
3. Check backend connectivity
4. Clear localStorage and re-enter code

### Admin Page Not Accessible

1. Verify you're logged in as a teacher
2. Check route: `/admin/beta-codes`
3. Verify RequireTeacher guard is working
4. Check GraphQL mutations are defined

## Related Files

**Backend:**
- `Backend/src/models/BetaAccessCode.ts` - Database model
- `Backend/src/models/User.ts` - User model with beta access field
- `Backend/src/schema.ts` - GraphQL schema definitions
- `Backend/src/resolvers/Mutation.ts` - Resolver implementations
- `Backend/src/models/index.ts` - Model exports

**Frontend (Main App):**
- `Frontend/src/components/auth/BetaAccessGuard.tsx` - Access guard
- `Frontend/src/modules/admin/BetaCodesManagement.tsx` - Admin interface
- `Frontend/src/main.tsx` - Route configuration

**Frontend (Landing Page):**
- `LandingPage/src/components/BetaAccessModal.tsx` - Modal component
- `LandingPage/src/components/Header.tsx` - Header with modal trigger
