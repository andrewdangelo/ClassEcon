# Backpack and Redemption UI Fixes

## Issues Fixed

### 1. Teacher Redemption Page Badge Counts Show 0
**Problem**: Badge counts (Pending, Approved, Denied) were showing 0 or incorrect numbers because they were calculated from the filtered results for the current tab only.

**Solution**: 
- Added a separate query to fetch all redemption requests regardless of status
- Calculate badge counts from all requests, not just the filtered ones
- Display remains filtered by tab, but counts are accurate

**Files Changed**:
- `Frontend/src/modules/requests/RedemptionRequestsPage.tsx`
  - Added `allData` query for all statuses
  - Calculate counts from `allRequests` instead of filtered `requests`
  - Badge counts now accurate regardless of active tab

---

### 2. Student Backpack Shows Duplicate Items
**Problem**: If a student purchased the same item multiple times, each purchase showed as a separate card. This was cluttered and confusing.

**Solution**: 
- Group purchases by `storeItemId` to show unique items
- Display aggregated information:
  - Total quantity owned
  - Total value of all instances
  - Number available to redeem (excluding pending)
  - Number of pending redemption requests
- Show "Pending" badge when some instances have pending redemptions
- Disable redemption button when all instances are pending

**Implementation Details**:

#### Backend Changes:
1. **Added `hasPendingRedemption` field** to Purchase type
   - `Backend/src/schema.ts`: Added Boolean field
   - `Backend/src/resolvers/index.ts`: 
     - Added resolver that checks for pending RedemptionRequest
     - Queries database for redemption requests with status "pending"
     - Returns true/false for each purchase

2. **Query Enhancement**:
   - `Frontend/src/graphql/queries/backpack.ts`: 
     - Added `hasPendingRedemption` to STUDENT_BACKPACK query

#### Frontend Changes:
1. **Grouping Logic** (`Frontend/src/modules/students/BackpackPage.tsx`):
   ```typescript
   const groupedPurchases = purchases.reduce((acc, purchase) => {
     const key = purchase.storeItemId;
     if (!acc[key]) {
       acc[key] = {
         storeItem: purchase.storeItem,
         storeItemId: purchase.storeItemId,
         allItems: [],
         availableItems: [],
         totalQuantity: 0,
         totalValue: 0,
         availableCount: 0,
       };
     }
     // Add to allItems
     // Track availableItems (without pending redemption)
     // Calculate totals
   });
   ```

2. **Card Display Updates**:
   - Shows "Pending" badge when redemptions are pending
   - Displays three metrics:
     - **Total Owned**: All purchases combined
     - **Total Value**: Sum of all purchase values
     - **Available to Redeem**: Count excluding pending items
   - Available count shows in green when > 0
   - Shows warning message: "X redemption request(s) pending"
   - Button text changes: "Request Redemption" vs "All Items Pending"
   - Button disabled when no available items

3. **Redemption Selection**:
   - When user clicks "Request Redemption", selects first available item
   - Only items without pending redemptions can be selected
   - Each redemption request is for a specific purchase instance

---

## Benefits

### For Students:
✅ Clear view of unique items owned
✅ See total quantity of each item
✅ Know how many are available vs pending
✅ Can't accidentally create duplicate requests
✅ Better understanding of their inventory
✅ Clean, uncluttered interface

### For Teachers:
✅ Accurate badge counts at all times
✅ Can see counts without switching tabs
✅ Better overview of pending work
✅ Same detailed view per redemption request
✅ Each request tracked individually

---

## User Experience Flow

### Student Purchases Same Item Twice:
1. **Before**: Two separate cards showing "Free Homework Pass"
2. **After**: One card showing:
   - Free Homework Pass
   - Total Owned: 2
   - Total Value: $20
   - Available to Redeem: 2
   - [Request Redemption] button active

### Student Requests Redemption:
1. Student clicks "Request Redemption" on first instance
2. Card updates:
   - "Pending" badge appears
   - Available to Redeem: 1 (decreases)
   - Shows "1 redemption request pending"
   - Button still active (1 more available)

### After Second Redemption Request:
1. Card updates:
   - Available to Redeem: 0
   - Shows "2 redemption requests pending"
   - Button disabled: "All Items Pending"

### Teacher Approves/Denies:
1. **Approved**: Purchase removed from backpack
2. **Denied**: Purchase becomes available again
3. Badge counts update immediately
4. Student sees updated availability

---

## Technical Notes

### Performance:
- `hasPendingRedemption` resolver queries database per purchase
- For large inventories, consider caching or batch loading
- Current implementation is fine for typical use cases (<50 items)

### Data Integrity:
- Each purchase maintains individual identity via itemId
- Grouping is display-only, doesn't affect database
- Redemption requests still reference specific purchase IDs
- History maintains complete audit trail

### Edge Cases Handled:
- Deleted store items show "(Deleted Item)"
- Mixed pending/available items work correctly
- Zero available items disable button
- Badge counts work with empty states
- Legacy purchases without itemId handled gracefully
