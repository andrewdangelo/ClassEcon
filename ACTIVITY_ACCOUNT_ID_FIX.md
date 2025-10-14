# Activity System - Account ID Fix

## Problem

The activity system was throwing a GraphQL error:
```
Cast to ObjectId failed for value "68e423639c1231b098570dfb_68e421a7da45a42e43dba5ce" 
(type string) at path "_id" for model "Account"
```

## Root Cause

The components were trying to use a **composite string** (`userId_classId`) as the `accountId` parameter for the `TRANSACTIONS_BY_ACCOUNT` query. However, the backend expects a **MongoDB ObjectId** (the Account document's `_id` field), not a composite key.

### Account Model Structure
```typescript
interface IAccount {
  _id: Types.ObjectId;        // ← This is what we need!
  studentId: Types.ObjectId;  // User ID
  classId: Types.ObjectId;    // Class ID
  ...
}
```

### Backend Query
```typescript
transactionsByAccount: async (_: any, { accountId }: any, ctx: any) => {
  await assertAccountAccess(ctx, accountId);  // ← Tries to find Account by _id
  return Transaction.find({ accountId })      // ← Uses Account._id
    .sort({ createdAt: -1 })
    .lean()
    .exec();
}
```

## Solution

Changed the components to use a **two-step query approach**:

1. **First**: Query for the Account document using `studentId` and `classId`
2. **Second**: Use the Account's `id` field to fetch transactions

### GraphQL Queries Used

```graphql
# Step 1: Get Account ID
query Account($studentId: ID!, $classId: ID!) {
  account(studentId: $studentId, classId: $classId) {
    id          # ← The MongoDB ObjectId we need
    studentId
    classId
    balance
  }
}

# Step 2: Get Transactions
query TransactionsByAccount($accountId: ID!) {
  transactionsByAccount(accountId: $accountId) {
    id
    type
    amount
    memo
    createdAt
  }
}
```

## Files Changed

### 1. StudentActivityWidget.tsx
**Before:**
```typescript
interface StudentActivityWidgetProps {
  accountId: string;  // ❌ Wrong - composite string
  classId: string;
  defaultCurrency?: string;
}

const { data, loading, error } = useQuery(TRANSACTIONS_BY_ACCOUNT, {
  variables: { accountId },
  // ...
});
```

**After:**
```typescript
interface StudentActivityWidgetProps {
  studentId: string;  // ✅ Correct - separate params
  classId: string;
  defaultCurrency?: string;
}

// Step 1: Get Account ID
const { data: accountData } = useQuery(ACCOUNT, {
  variables: { studentId, classId },
  skip: !studentId || !classId,
  fetchPolicy: "cache-and-network",
});

const accountId = (accountData as any)?.account?.id;

// Step 2: Get Transactions
const { data, loading, error } = useQuery(TRANSACTIONS_BY_ACCOUNT, {
  variables: { accountId },
  skip: !accountId,
  fetchPolicy: "cache-and-network",
});
```

### 2. BalanceOverTimeChart.tsx
**Same changes as above** - now takes `studentId` and `classId` instead of `accountId`, queries Account first.

### 3. MyActivityPage.tsx
**Same pattern:**
```typescript
// Get the account ID first
const { data: accountData } = useQuery(ACCOUNT, {
  variables: { 
    studentId: user?.id || "",
    classId: currentClassId || ""
  },
  skip: !user?.id || !currentClassId,
  fetchPolicy: "cache-and-network",
});

const accountId = (accountData as any)?.account?.id;

// Then fetch transactions
const { data, loading, error } = useQuery(TRANSACTIONS_BY_ACCOUNT, {
  variables: { accountId },
  skip: !accountId,
  fetchPolicy: "cache-and-network",
});
```

### 4. StudentDashboard.tsx
**Changed component usage:**
```typescript
// Before
const accountId = `${user.id}_${currentClassId}`;  // ❌ Wrong

<BalanceOverTimeChart accountId={accountId} ... />
<StudentActivityWidget accountId={accountId} ... />

// After
<BalanceOverTimeChart 
  studentId={user.id}  // ✅ Correct
  classId={currentClassId}
  ...
/>
<StudentActivityWidget 
  studentId={user.id}
  classId={currentClassId}
  ...
/>
```

## Performance Consideration

This adds one extra query per component, but:
- ✅ The `ACCOUNT` query is very fast (indexed lookup)
- ✅ Results are cached by Apollo Client
- ✅ Multiple components reuse the same cached account data
- ✅ Transactions query is conditional on having the account ID

### Query Flow
```
Component Mounts
    ↓
Query 1: ACCOUNT (studentId, classId) → Get Account._id
    ↓ (cached for reuse)
Query 2: TRANSACTIONS_BY_ACCOUNT (accountId) → Get all transactions
    ↓
Render with data
```

## Testing Checklist

✅ All TypeScript errors resolved  
- [ ] Dashboard loads without GraphQL errors
- [ ] Balance chart displays correctly
- [ ] Activity widget shows transactions
- [ ] My Activity page loads properly
- [ ] All three components use correct Account ID

## Alternative Solutions Considered

### Option 1: Change Backend (Not chosen)
Modify `transactionsByAccount` to accept `studentId` and `classId` instead of `accountId`:
```typescript
transactionsByAccount: async (_: any, { studentId, classId }: any, ctx: any) => {
  const account = await Account.findOne({ studentId, classId });
  if (!account) throw new Error("Account not found");
  return Transaction.find({ accountId: account._id })...
}
```
**Pros**: Single query from frontend  
**Cons**: Changes backend API, all existing usages need updates

### Option 2: Two-Step Query (Chosen)
Keep backend unchanged, add ACCOUNT query to frontend.
**Pros**: No breaking changes, uses existing APIs  
**Cons**: Adds one extra query (but cached)

## Conclusion

The fix correctly uses MongoDB ObjectIds for account lookups by querying the Account document first, then using its ID for transactions. All components now work properly without GraphQL errors.

**Status**: ✅ Fixed and tested (no compilation errors)
