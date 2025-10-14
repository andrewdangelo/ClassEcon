# Fine System Bug Fix - Missing ID Field

## Issue

When issuing a fine, the application threw this error:
```
CombinedGraphQLErrors: Cannot return null for non-nullable field Fine.id.
```

**Root Cause**: The Fine model was missing the `toJSON` and `toObject` virtual configuration that automatically adds the `id` field (derived from MongoDB's `_id`).

---

## Solution

### 1. Added Virtual Field Configuration to Fine Model

**File**: `Backend/src/models/Fine.ts`

**Before**:
```typescript
const FineSchema = new Schema<IFine>(
  { /* fields */ },
  { timestamps: true }
);
```

**After**:
```typescript
const FineSchema = new Schema<IFine>(
  { /* fields */ },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
```

This configuration:
- Enables the virtual `id` field in JSON serialization
- Converts MongoDB's `_id` (ObjectId) to a string `id` field
- Matches the pattern used by all other models in the codebase

### 2. Fixed Mutation Return Values

**File**: `Backend/src/resolvers/Mutation.ts`

**Changed** `issueFine` mutation:
```typescript
// Before
return fine.toObject();

// After
return fine;
```

**Changed** `waiveFine` mutation:
```typescript
// Before
return fine.toObject();

// After
return fine;
```

**Reason**: GraphQL resolvers work better with Mongoose documents directly. The virtual field configuration handles the `_id` → `id` conversion automatically during serialization.

---

## Technical Details

### Virtual Field in Mongoose

Mongoose schemas with `toJSON: { virtuals: true }` automatically create an `id` virtual getter:
```typescript
schema.virtual('id').get(function() {
  return this._id.toHexString();
});
```

This virtual:
- Converts `_id` (MongoDB ObjectId) → `id` (string)
- Only appears when document is serialized (`.toJSON()` or `.toObject()`)
- Required for GraphQL resolvers expecting a non-nullable `id` field

### Why This Pattern?

All other models in the codebase use this pattern:
- `User.ts` ✅
- `Class.ts` ✅
- `Transaction.ts` ✅
- `StoreItem.ts` ✅
- `Job.ts` ✅
- etc.

The Fine model was missing this configuration, causing the `id` field to be `undefined` when returned from mutations.

---

## Files Changed

1. ✅ `Backend/src/models/Fine.ts` - Added virtual field configuration
2. ✅ `Backend/src/resolvers/Mutation.ts` - Fixed return values in `issueFine` and `waiveFine`

---

## Testing

### Before Fix
```graphql
mutation IssueFine {
  issueFine(input: {
    studentId: "123"
    classId: "456"
    amount: 25
    reason: "Test"
  }) {
    id          # ❌ Returns null, causes error
    amount
    reason
  }
}
```

**Error**: `Cannot return null for non-nullable field Fine.id`

### After Fix
```graphql
mutation IssueFine {
  issueFine(input: {
    studentId: "123"
    classId: "456"
    amount: 25
    reason: "Test"
  }) {
    id          # ✅ Returns proper ID string
    amount
    reason
  }
}
```

**Success**: Fine is issued and returns with valid `id` field.

---

## Verification Checklist

- [x] Added `toJSON: { virtuals: true }` to Fine schema
- [x] Added `toObject: { virtuals: true }` to Fine schema
- [x] Changed `issueFine` to return document directly
- [x] Changed `waiveFine` to return document directly
- [x] Verified no TypeScript errors
- [x] Pattern matches other models in codebase

---

## Related Code Patterns

### Correct Pattern (All Models)
```typescript
const Schema = new Schema<IModel>(
  { /* fields */ },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);
```

### Resolver Return Pattern
```typescript
// ✅ Correct - Return Mongoose document directly
const doc = await Model.create({ /* data */ });
return doc;

// ❌ Avoid - Manual .toObject() not needed with virtual config
return doc.toObject();
```

---

## Additional Fixes

### Issue 2: Balance Calculation Error

**Problem**: When a $2 fine was issued to a student with $4 balance, their balance became -$4 instead of $2.

**Root Cause**: In `classStatistics` query, there was logic that inverted FINE transactions:
```typescript
// Old (incorrect)
{
  case: { $in: ["$type", ["WITHDRAWAL", "PURCHASE", "FINE", ...]] },
  then: { $multiply: [-1, "$amount"] }
}
```

Since FINE transactions are already stored as negative amounts (e.g., -2), multiplying by -1 made them positive, adding to the balance instead of subtracting.

**Solution**: Simplified the balance calculation to use direct sum, since FINE and PURCHASE are already stored as negative:

```typescript
// New (correct)
const balanceAgg = await Transaction.aggregate([
  { $match: { classId: classIdObj } },
  {
    $group: {
      _id: "$accountId",
      balance: { $sum: "$amount" }
    },
  },
]);
```

**Files Changed**:
- ✅ `Backend/src/resolvers/Query.ts` - Simplified balance calculation in `classStatistics`

### Issue 3: Query Resolvers Missing Virtual ID

**Problem**: `finesByStudent` and other fine queries returned `Cannot return null for non-nullable field Fine.id`

**Root Cause**: Query resolvers were using `.lean().exec()` which returns plain JavaScript objects without Mongoose virtuals (including the `id` field).

**Solution**: Removed `.lean()` from fine queries to return Mongoose documents with virtuals:

```typescript
// Before
return Fine.find(query).sort({ createdAt: -1 }).lean().exec();

// After
return Fine.find(query).sort({ createdAt: -1 }).exec();
```

**Files Changed**:
- ✅ `Backend/src/resolvers/Query.ts` - Removed `.lean()` from `finesByClass`, `finesByStudent`, and `fine` queries

---

## Impact

✅ **Fixed**: Fine creation now works correctly  
✅ **Fixed**: Fine waiving now works correctly  
✅ **Fixed**: GraphQL queries return proper `id` fields  
✅ **Fixed**: Balance calculation now correctly deducts fines  
✅ **Fixed**: Fine queries return documents with virtual `id` field  
✅ **Consistency**: Fine model now matches all other models  

---

**Status**: ✅ All Issues Fixed and Ready  
**Last Updated**: January 2025
