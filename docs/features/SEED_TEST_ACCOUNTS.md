# 🚀 Run Test Account Seeder

## Quick Start

```bash
cd Backend
pnpm seed-tiers
```

This will:
1. Clean up any existing test accounts (@test.com)
2. Create 6 teacher accounts (one per tier)
3. Create 3-10 student accounts per tier
4. Create a class for each tier with students enrolled
5. Print all credentials to console

## Expected Output

```
🔗 Connecting to MongoDB...
✅ Connected to MongoDB

🗑️  Cleaning up existing test accounts...
✅ Cleanup complete

🌱 Creating test accounts for each tier...

📊 Creating FREE tier account...
   ✅ Teacher created: teacher+free@test.com
   ✅ 3 students created
   ✅ Classroom created
   ✅ Class created: Free Tier Economics (Join Code: FREE1A2B3C)
   ✅ Memberships and accounts created

[... similar output for each tier ...]

✅ All test accounts created successfully!

======================================================================
📋 TEST ACCOUNT CREDENTIALS
======================================================================

TEACHER ACCOUNTS:
----------------------------------------------------------------------

FREE:
  Email:    teacher+free@test.com
  Password: Test1234!
  Tier:     FREE
  Status:   ACTIVE
  Students: 3

TRIAL:
  Email:    teacher+trial@test.com
  Password: Test1234!
  Tier:     TRIAL
  Status:   TRIAL
  Trial:    11/7/2025
  Students: 5

[... etc for all tiers ...]
```

## After Seeding

### 1. Test Teacher Login
```
Email: teacher+free@test.com
Password: Test1234!
```

### 2. Navigate to Dashboard
- See tier badge in header
- Verify feature restrictions
- Check trial banner (for TRIAL tier)

### 3. Test Student Login
```
Email: alice+free@test.com
Password: Student123!
```

### 4. Verify Feature Gates
- FREE/STARTER: See upgrade prompts
- PROFESSIONAL/TRIAL: See all features

## Manual Database Verification

```bash
# Connect to MongoDB
mongosh classecon

# Check teachers
db.users.find({ 
  email: /@test\.com$/, 
  role: "TEACHER" 
}).pretty()

# Check students
db.users.find({ 
  email: /@test\.com$/, 
  role: "STUDENT" 
}).count()

# Check classes
db.classes.find({ 
  name: /Tier Economics/ 
}).pretty()

# Verify subscription tiers
db.users.find(
  { email: /@test\.com$/, role: "TEACHER" },
  { email: 1, subscriptionTier: 1, subscriptionStatus: 1 }
).pretty()
```

## Cleanup (If Needed)

```bash
# In MongoDB shell
db.users.deleteMany({ email: /@test\.com$/ })
db.classes.deleteMany({ name: /Tier Economics/ })
db.classrooms.deleteMany({ name: /Tier Economics/ })
db.memberships.deleteMany({})
db.accounts.deleteMany({})

# Or re-run the seed script (it cleans up automatically)
pnpm seed-tiers
```

## Troubleshooting

### Error: MongoDB connection failed
- Check if MongoDB is running
- Verify MONGO_URI in .env file
- Default: `mongodb://localhost:27017/classecon`

### Error: Module not found
- Run `pnpm install` in Backend directory
- Ensure all dependencies are installed

### Accounts not showing correct tier
- Check database directly (see verification above)
- Verify User model has subscription fields
- Check if migrations ran successfully

## What Gets Created

| Tier | Teacher Email | Students | Features |
|------|---------------|----------|----------|
| FREE | teacher+free@test.com | 3 | Basic only |
| TRIAL | teacher+trial@test.com | 5 | All (14 days) |
| STARTER | teacher+starter@test.com | 6 | Basic + support |
| PROFESSIONAL | teacher+pro@test.com | 8 | All premium |
| FOUNDING | teacher+founding@test.com | 5 | Pro + discount |
| SCHOOL | teacher+school@test.com | 10 | Enterprise |

Each class gets:
- ✅ Unique join code
- ✅ All students enrolled
- ✅ Starting balance of CE$ 100
- ✅ Default currency: CE$
- ✅ Weekly pay period

---

**Ready to test!** Run `pnpm seed-tiers` and start testing with any account.
