# How to Generate Beta Access Codes

## Method 1: Using the Admin UI (Recommended)

1. **Start the Backend Server:**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Start the Frontend Server:**
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Login as a Teacher:**
   - Go to http://localhost:5174/auth
   - Login with a teacher account

4. **Navigate to Beta Codes Management:**
   - Go to http://localhost:5174/admin/beta-codes
   - Fill out the form:
     - **Code**: e.g., "TEACHER2024" (will be auto-uppercase)
     - **Description**: e.g., "Code for Spring Valley teachers"
     - **Max Uses**: e.g., 10 (how many people can use this code)
     - **Expiration**: Optional - set a date/time when the code expires
   - Click "Create Beta Code"

5. **Share the Code:**
   - Give the code to your beta testers
   - They can use it on the landing page

## Method 2: Using Node.js Script

1. **Create a code with default settings:**
   ```bash
   cd Backend
   node scripts/generate-beta-code.js
   ```
   This creates code "BETA2024" with 10 max uses.

2. **Create a custom code:**
   ```bash
   node scripts/generate-beta-code.js MYCODE "My custom description" 50
   ```
   - First argument: Code name
   - Second argument: Description
   - Third argument: Max uses

## Method 3: Direct MongoDB Command

If you want to quickly add a code directly to the database:

```bash
# Connect to MongoDB
mongosh classecon

# Create a beta code
db.betaaccesscodes.insertOne({
  code: "QUICKCODE",
  description: "Quick beta access code",
  maxUses: 100,
  currentUses: 0,
  isActive: true,
  usedBy: [],
  createdAt: new Date()
})
```

## Method 4: Using MongoDB Compass

1. Open MongoDB Compass
2. Connect to your database (mongodb://localhost:27017/classecon)
3. Navigate to the `betaaccesscodes` collection
4. Click "Insert Document"
5. Paste this JSON:
   ```json
   {
     "code": "COMPASS2024",
     "description": "Created via Compass",
     "maxUses": 25,
     "currentUses": 0,
     "isActive": true,
     "usedBy": [],
     "createdAt": {"$date": "2024-10-14T00:00:00.000Z"}
   }
   ```
6. Click "Insert"

## Quick Start Example

**Fastest way to get started:**

1. Start your backend:
   ```bash
   cd Backend
   npm run dev
   ```

2. In another terminal, create a code:
   ```bash
   cd Backend
   node scripts/generate-beta-code.js BETA2024 "Beta testing" 100
   ```

3. You'll see output like:
   ```
   🎉 Beta access code created successfully!
   
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   📋 Code: BETA2024
   📝 Description: Beta testing
   🔢 Max Uses: 100
   📅 Created: 2024-10-14T...
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   ```

4. Test it:
   - Go to your landing page (http://localhost:3000)
   - Click "Sign In"
   - Enter "BETA2024"
   - Click "Verify Access"
   - You should be redirected to the main app!

## Code Features

- **Case Insensitive**: BETA2024, beta2024, Beta2024 all work the same
- **Max Uses**: Limit how many people can use each code
- **Expiration**: Optionally set when a code expires
- **Tracking**: See who has used which codes
- **Deactivation**: Turn codes off without deleting them

## Troubleshooting

**"Code already exists" error:**
- Choose a different code name
- Or check if you meant to use the existing code

**Can't create code in admin UI:**
- Make sure you're logged in as a teacher
- Check that the backend is running on port 4000
- Check browser console for errors

**Code not validating:**
- Verify the backend is running
- Check MongoDB is connected
- Verify the code exists: `db.betaaccesscodes.find()`
- Check the code is active: `isActive: true`
- Check it hasn't expired
- Check it hasn't reached max uses

## Example Codes

Here are some example codes you might create:

- `TEACHER2024` - For teachers (maxUses: 50)
- `EARLYBIRD` - For early adopters (maxUses: 100)
- `SCHOOLTEST` - For specific school (maxUses: 200)
- `VIPACCESS` - For VIP users (maxUses: 10)
- `TESTCODE` - For testing (maxUses: 1)
