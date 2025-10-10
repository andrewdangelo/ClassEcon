# GraphQL Enum Format Fix

## Date: October 10, 2025

## Issue
**Error:** `Enum "PurchaseStatus" cannot represent value: "in-backpack"`

When clicking on a student from the teacher view, the StudentDetails query failed because of a mismatch between:
- **Database format:** `"in-backpack"` (lowercase with hyphens)
- **GraphQL schema:** `in_backpack` (lowercase with underscores)
- **Expected GraphQL format:** `IN_BACKPACK` (uppercase with underscores)

## Root Cause
GraphQL enum values should conventionally be in SCREAMING_SNAKE_CASE (all uppercase with underscores), but the database was storing values in kebab-case (lowercase with hyphens). The GraphQL schema initially used lowercase with underscores, creating a three-way mismatch.

---

## Solution

### 1. Updated GraphQL Schema Enums
**File:** `Backend/src/schema.ts`

Changed enum definitions to proper SCREAMING_SNAKE_CASE format:

```graphql
enum PurchaseStatus {
  IN_BACKPACK   # was: in_backpack
  REDEEMED      # was: redeemed
  EXPIRED       # was: expired
}

enum RedemptionStatus {
  PENDING       # was: pending
  APPROVED      # was: approved
  DENIED        # was: denied
}
```

### 2. Added Field Resolvers for Conversion
**File:** `Backend/src/resolvers/index.ts`

Added resolvers to convert database format to GraphQL format:

```typescript
Purchase: { 
  id: pickId,
  storeItem: (parent: any) => ({ _id: parent.storeItemId }),
  status: (parent: any) => {
    // Convert database format (kebab-case) to GraphQL enum format (SCREAMING_SNAKE_CASE)
    const statusMap: Record<string, string> = {
      "in-backpack": "IN_BACKPACK",
      "redeemed": "REDEEMED",
      "expired": "EXPIRED",
    };
    return statusMap[parent.status] || parent.status.toUpperCase().replace(/-/g, "_");
  },
},

RedemptionRequest: {
  id: pickId,
  purchase: (parent: any) => ({ _id: parent.purchaseId }),
  student: (parent: any) => ({ _id: parent.studentId }),
  reviewedBy: (parent: any) => parent.reviewedByUserId ? ({ _id: parent.reviewedByUserId }) : null,
  status: (parent: any) => {
    // Convert database format (lowercase) to GraphQL enum format (UPPERCASE)
    return parent.status?.toUpperCase() || parent.status;
  },
},
```

### 3. Updated Query Input Handling
**File:** `Backend/src/resolvers/Query.ts`

Modified `redemptionRequests` query to convert GraphQL enum input to database format:

```typescript
const query: any = { classId: toId(classId) };
if (status) {
  // Convert GraphQL enum (UPPERCASE) to database format (lowercase)
  query.status = status.toLowerCase();
}
```

### 4. Updated Frontend Status Display
**File:** `Frontend/src/modules/students/StudentDetail.tsx`

Made status comparison case-insensitive:

```typescript
const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  const normalizedStatus = status.toLowerCase().replace(/_/g, "-");
  switch (normalizedStatus) {
    case "in-backpack":
      return "default";
    case "redeemed":
      return "secondary";
    case "expired":
      return "destructive";
    default:
      return "outline";
  }
};
```

---

## Data Flow

### Reading from Database (Queries)
1. Database stores: `"in-backpack"`
2. GraphQL field resolver converts: `"in-backpack"` → `"IN_BACKPACK"`
3. Frontend receives: `"IN_BACKPACK"`
4. Frontend displays: Normalizes for UI rendering

### Writing to Database (Mutations)
1. Frontend sends: N/A (status changes happen on backend)
2. Backend mutations use database format: `"in-backpack"`
3. Database stores: `"in-backpack"`

### Filtering by Status
1. Frontend sends query variable: `status: "PENDING"` (uppercase)
2. Backend Query resolver converts: `"PENDING"` → `"pending"`
3. Database query uses: `{ status: "pending" }`

---

## Format Conversions

### Database → GraphQL (Field Resolvers)
```
"in-backpack" → "IN_BACKPACK"
"redeemed"    → "REDEEMED"
"expired"     → "EXPIRED"
"pending"     → "PENDING"
"approved"    → "APPROVED"
"denied"      → "DENIED"
```

### GraphQL → Database (Query Inputs)
```
"IN_BACKPACK" → "in-backpack"
"REDEEMED"    → "redeemed"
"EXPIRED"     → "expired"
"PENDING"     → "pending"
"APPROVED"    → "approved"
"DENIED"      → "denied"
```

---

## Why This Approach?

### Alternative 1: Change Database Values ❌
**Rejected because:**
- Requires data migration
- Existing data would break
- More complex to implement
- Risk of data loss

### Alternative 2: Use Lowercase GraphQL Enums ❌
**Rejected because:**
- Violates GraphQL best practices
- Enums should be SCREAMING_SNAKE_CASE by convention
- Makes API less intuitive
- Inconsistent with other GraphQL schemas

### Alternative 3: Add Field Resolvers ✅
**Chosen because:**
- No data migration needed
- Follows GraphQL conventions
- Maintains backward compatibility
- Centralized conversion logic
- Easy to maintain

---

## Testing Verification

### Test Cases
1. ✅ Query student backpack - returns `IN_BACKPACK` status
2. ✅ Query purchase history - returns all statuses in uppercase
3. ✅ Query redemption requests with status filter - converts to lowercase for DB query
4. ✅ Frontend displays status badges correctly
5. ✅ Status comparisons work in UI components

### Expected Behavior
- **StudentDetails query**: Returns purchases with status `IN_BACKPACK`, `REDEEMED`, or `EXPIRED`
- **RedemptionRequests query**: Filters correctly with `PENDING`, `APPROVED`, or `DENIED`
- **UI**: Displays status badges with correct colors regardless of case

---

## Files Modified

### Backend
1. `Backend/src/schema.ts`
   - Changed `PurchaseStatus` enum values to uppercase
   - Changed `RedemptionStatus` enum values to uppercase

2. `Backend/src/resolvers/index.ts`
   - Added `status` field resolver for `Purchase` type
   - Added `status` field resolver for `RedemptionRequest` type

3. `Backend/src/resolvers/Query.ts`
   - Updated `redemptionRequests` to convert status input to lowercase

### Frontend
1. `Frontend/src/modules/students/StudentDetail.tsx`
   - Updated `getStatusVariant` to normalize status for comparison

---

## Impact Assessment

### Breaking Changes
- None for clients using the GraphQL API correctly
- Frontend queries automatically updated via codegen
- Backend handles conversion transparently

### Performance Impact
- Minimal - field resolvers add negligible overhead
- Conversion happens in memory (no database impact)
- No additional queries needed

### Maintenance
- All conversion logic centralized in resolvers
- Easy to extend with new status values
- Self-documenting with inline comments

---

## Future Considerations

### If Adding New Status Values
1. Add to GraphQL schema in SCREAMING_SNAKE_CASE
2. Add to database model in kebab-case
3. Add mapping in field resolver
4. Update frontend UI components

### Example: Adding "RESERVED" Status
```typescript
// 1. Schema
enum PurchaseStatus {
  IN_BACKPACK
  REDEEMED
  EXPIRED
  RESERVED  // New status
}

// 2. Model
enum: ["in-backpack", "redeemed", "expired", "reserved"]

// 3. Resolver
const statusMap: Record<string, string> = {
  "in-backpack": "IN_BACKPACK",
  "redeemed": "REDEEMED",
  "expired": "EXPIRED",
  "reserved": "RESERVED",  // New mapping
};

// 4. Frontend
case "reserved":
  return "outline";
```

---

## Related Documentation
- GraphQL Best Practices: https://graphql.org/learn/best-practices/#naming-conventions
- Enum Naming Conventions: SCREAMING_SNAKE_CASE for enum values
- Field Resolvers: Used for data transformation between layers

---

## Summary

Fixed GraphQL enum serialization error by:
1. Standardizing GraphQL enums to SCREAMING_SNAKE_CASE (convention)
2. Adding field resolvers to convert between database format and GraphQL format
3. Updating query inputs to convert back to database format when filtering
4. Making frontend status comparisons case-insensitive

The solution maintains data consistency, follows GraphQL best practices, and requires no database migration. All conversions happen transparently in the GraphQL layer.
