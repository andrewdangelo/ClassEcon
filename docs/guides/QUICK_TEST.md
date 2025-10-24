# 🎯 Quick Test - Feature Gates

## 🚀 Instant Test (2 minutes)

### 1. Start
```bash
# Already running? Skip to step 2
cd Frontend && pnpm dev
```

### 2. Navigate
**Go to**: http://localhost:5173/dev/tier-testing

### 3. Login
```
Email: teacher+carter@demo.school
```

### 4. Test

#### Click "Free" → See Restrictions
- Balance chart: ❌ HIDDEN (shows upgrade prompt)
- Activity widget: ❌ HIDDEN (shows upgrade prompt)
- Tier badge: "Free" (gray)

#### Click "Trial" → See Everything
- Balance chart: ✅ VISIBLE
- Activity widget: ✅ VISIBLE
- Tier badge: "Trial (14d left)" (purple)
- Trial banner appears

#### Click "Professional" → See Premium
- Balance chart: ✅ VISIBLE
- Activity widget: ✅ VISIBLE
- Tier badge: "Professional" (green)
- All features unlocked

## 📍 Where to Look

### Student Dashboard (`/`)
- **Balance Over Time Chart** - Above main stats
- **Activity Widget** - Bottom of page

### Teacher Dashboard (`/`)
- **Tier Badge** - In page header next to title
- **Trial Banner** - At very top of page

## ✅ Quick Verification

| Action | Expected Result |
|--------|----------------|
| Set to FREE | Premium widgets show orange "Premium Feature" box |
| Set to TRIAL | Trial banner appears with "14 days left" |
| Set to PROFESSIONAL | Tier badge shows green "Professional" badge |
| Refresh page | Returns to FREE (changes don't persist) |

## 🎨 Visual Guide

```
FREE Tier:
┌─────────────────────────────────────┐
│ ❌ Balance Over Time Chart          │
│ ┌─────────────────────────────────┐ │
│ │ 🔒 Premium Feature              │ │
│ │ This feature requires a         │ │
│ │ Professional plan.              │ │
│ │ [Upgrade Plan] button           │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘

PROFESSIONAL Tier:
┌─────────────────────────────────────┐
│ ✅ Balance Over Time Chart          │
│ ┌─────────────────────────────────┐ │
│ │   📊 Line chart showing         │ │
│ │   balance history over time     │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

## 🔍 Troubleshooting

**Not seeing tier badge?**
→ You're on the student dashboard. Switch to teacher dashboard.

**Changes not working?**
→ Check Redux DevTools. Look for `auth.user.subscriptionTier`

**Features still restricted?**
→ Navigate away from testing page then back to dashboard.

---

**That's it!** 5 tiers, 2 feature gates, fully testable in dev mode.
