# ItemID Backward Compatibility Fix

## Problem
After adding the `itemId` field to Purchase documents, existing purchases in the database didn't have this field, causing GraphQL errors:
```
Cannot return null for non-nullable field Purchase.itemId
```

## Solution
Implemented backward compatibility for legacy purchases without itemId:

### 1. Made itemId Optional in Schema
**File**: `Backend/src/schema.ts`
- Changed `itemId: String!` to `itemId: String` (nullable)

### 2. Updated Purchase Model
**File**: `Backend/src/models/Purchase.ts`
- Made `itemId` optional in TypeScript interface
- Changed schema field to `required: false`
- Added `sparse: true` to index (allows multiple null values)
- Default function still generates itemId for new purchases

### 3. Added Resolver for Legacy Purchases
**File**: `Backend/src/resolvers/index.ts`
- Added `itemId` resolver in Purchase type
- For purchases with itemId: returns the actual itemId
- For legacy purchases: generates a consistent ID based on MongoDB _id
  - Format: `LEGACY-{first12chars}`
  - Example: `LEGACY-68E930A2E908`
- Provides stable identifier for old purchases without modifying database

### 4. Updated Frontend to Handle Null
**Files**: 
- `Frontend/src/modules/students/BackpackPage.tsx`
- `Frontend/src/modules/requests/RedemptionRequestsPage.tsx`
- Display `'N/A'` if itemId is missing (fallback for edge cases)

### 5. Created Migration Script (Optional)
**File**: `Backend/scripts/migrate-itemIds.ts`
- Can be run to backfill itemIds for existing purchases
- Usage: `cd Backend && npx tsx scripts/migrate-itemIds.ts`
- Generates real itemIds for all legacy purchases
- Not required but recommended for clean data

## How It Works

### For New Purchases
1. Purchase created with auto-generated itemId
2. Format: `ITEM-{timestamp}-{random}`
3. Example: `ITEM-1728581234567-ABC123XYZ`

### For Legacy Purchases
1. No itemId in database
2. Resolver generates: `LEGACY-{_id.substring(0,12)}`
3. Consistent across queries (same _id = same legacy ID)
4. Example: `LEGACY-68E930A2E908`

### Benefits of This Approach
✅ No breaking changes - existing data works immediately
✅ No forced migration required
✅ New purchases get proper itemIds
✅ Legacy purchases have consistent identifiers
✅ Can migrate later if desired
✅ UI gracefully handles both formats

## Testing
1. **Existing purchases** - Will show LEGACY-XXX format itemId
2. **New purchases** - Will show ITEM-XXX-XXX format itemId
3. **After migration** - All will show ITEM-XXX-XXX format

## Running the Migration (Optional)

If you want to convert all legacy purchases to have real itemIds:

```bash
cd Backend
npx tsx scripts/migrate-itemIds.ts
```

This will:
- Find all purchases without itemId
- Generate unique itemIds for them
- Save to database
- Report success/failure counts

**Note**: This is optional. The system works fine with the resolver-generated legacy IDs.
