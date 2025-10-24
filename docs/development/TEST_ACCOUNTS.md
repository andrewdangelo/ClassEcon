# 🧪 Test Account Credentials

## Quick Setup

Run the seed script:
```bash
cd Backend
node scripts/seed-tier-accounts.js
```

## 👨‍🏫 Teacher Accounts

All teacher passwords: **Test1234!**

| Tier | Email | Features |
|------|-------|----------|
| **FREE** | `teacher+free@test.com` | 10 students max, 1 class, basic features |
| **TRIAL** | `teacher+trial@test.com` | Unlimited, all features, 14 days |
| **STARTER** | `teacher+starter@test.com` | 30 students max, 1 class |
| **PROFESSIONAL** | `teacher+pro@test.com` | Unlimited students, 3 classes, all features |
| **FOUNDING MEMBER** | `teacher+founding@test.com` | Pro tier at 50% off ($9.50/mo) |
| **SCHOOL** | `teacher+school@test.com` | Unlimited everything, enterprise |

## 👨‍🎓 Student Accounts

All student passwords: **Student123!**

### Pattern
```
[name]+[tier]@test.com
```

### Examples by Tier

#### FREE Tier Students
- `alice+free@test.com`
- `bob+free@test.com`
- `charlie+free@test.com`

#### TRIAL Tier Students
- `alice+trial@test.com`
- `bob+trial@test.com`
- `charlie+trial@test.com`
- `david+trial@test.com`
- `eve+trial@test.com`

#### STARTER Tier Students
- `alice+starter@test.com`
- `bob+starter@test.com`
- `charlie+starter@test.com`
- `david+starter@test.com`
- `eve+starter@test.com`
- `frank+starter@test.com`

#### PROFESSIONAL Tier Students
- `alice+pro@test.com`
- `bob+pro@test.com`
- `charlie+pro@test.com`
- `david+pro@test.com`
- `eve+pro@test.com`
- `frank+pro@test.com`
- `grace+pro@test.com`
- `henry+pro@test.com`

#### FOUNDING MEMBER Students
- `alice+founding@test.com`
- `bob+founding@test.com`
- `charlie+founding@test.com`
- `david+founding@test.com`
- `eve+founding@test.com`

#### SCHOOL Tier Students
- `alice+school@test.com`
- `bob+school@test.com`
- `charlie+school@test.com`
- `david+school@test.com`
- `eve+school@test.com`
- `frank+school@test.com`
- `grace+school@test.com`
- `henry+school@test.com`
- `ivy+school@test.com`
- `jack+school@test.com`

## 🧪 Testing Workflow

### Test Feature Gates
1. Login as: `teacher+free@test.com` / `Test1234!`
2. Go to dashboard
3. Verify premium features show upgrade prompts
4. Logout
5. Login as: `teacher+pro@test.com` / `Test1234!`
6. Verify all features are accessible

### Test Student View
1. Login as: `alice+free@test.com` / `Student123!`
2. Go to dashboard
3. Verify Balance Chart shows upgrade prompt
4. Verify Activity Widget shows upgrade prompt
5. Logout
6. Login as: `alice+pro@test.com` / `Student123!`
7. Verify both widgets are visible

### Test Limits
1. Login as: `teacher+free@test.com`
2. Try to add 11th student (should fail or warn)
3. Try to create 2nd class (should fail or warn)
4. Logout
5. Login as: `teacher+pro@test.com`
6. Verify can add many students
7. Verify can create up to 3 classes

### Test Trial
1. Login as: `teacher+trial@test.com`
2. Verify trial banner shows "14 days left"
3. Verify all features unlocked
4. Verify tier badge shows "Trial"

### Test Founding Member
1. Login as: `teacher+founding@test.com`
2. Go to subscription settings
3. Verify price shows $9.50/mo (not $19/mo)
4. Verify "Founding Member" badge visible

## 🔍 What Each Tier Should Show

### FREE
- ❌ Balance History Chart (upgrade prompt)
- ❌ Activity Widget (upgrade prompt)
- ❌ Analytics (when implemented)
- ✅ Basic features only
- 📊 3 students in class
- 🎯 Limit: 10 students, 1 class

### TRIAL
- ✅ Balance History Chart
- ✅ Activity Widget
- ✅ All features unlocked
- 🎉 Trial banner with countdown
- 📊 5 students in class
- 🎯 No limits during trial

### STARTER
- ❌ Balance History Chart (upgrade prompt)
- ❌ Activity Widget (upgrade prompt)
- ✅ Basic features + email support
- 📊 6 students in class
- 🎯 Limit: 30 students, 1 class

### PROFESSIONAL
- ✅ Balance History Chart
- ✅ Activity Widget
- ✅ All premium features
- 📊 8 students in class
- 🎯 Limit: Unlimited students, 3 classes

### SCHOOL
- ✅ All features unlocked
- ✅ Enterprise access
- 📊 10 students in class
- 🎯 No limits

## 📝 Quick Commands

```bash
# Run seed script
cd Backend
node scripts/seed-tier-accounts.js

# Check what was created (MongoDB shell)
mongosh classecon
db.users.find({ email: /@test\.com$/ }).pretty()
db.classes.find({ name: /Tier Economics/ }).pretty()

# Delete all test accounts
db.users.deleteMany({ email: /@test\.com$/ })
db.classes.deleteMany({ name: /Tier Economics/ })
db.classrooms.deleteMany({ name: /Tier Economics/ })
```

## 🎯 Testing Checklist

### Teacher View
- [ ] FREE tier shows limited features
- [ ] TRIAL tier shows trial banner
- [ ] PROFESSIONAL tier shows tier badge
- [ ] FOUNDING tier shows discounted price
- [ ] SCHOOL tier has no restrictions

### Student View
- [ ] FREE students see upgrade prompts
- [ ] TRIAL students see all widgets
- [ ] PRO students see all widgets
- [ ] Balance history visible in premium tiers
- [ ] Activity tracking visible in premium tiers

### Limits
- [ ] FREE can't exceed 10 students
- [ ] STARTER can't exceed 30 students
- [ ] PRO can add unlimited students
- [ ] FREE can't create 2nd class
- [ ] PRO can create up to 3 classes

---

**All accounts have beta access enabled by default**

Password reminder:
- Teachers: `Test1234!`
- Students: `Student123!`
