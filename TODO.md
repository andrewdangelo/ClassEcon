# ClassEcon TODO List

## High Priority Issues

### 1. Student Payment Request Page - Reasons Not Loading
- **Issue**: Students cannot see fine reasons in the dropdown on the payment request page
- **Status**: ✅ Fixed
- **Root Cause**: Backend resolver `reasonsByClass` was using `requireClassTeacher()` which only allowed teachers to query reasons, blocking students from accessing them
- **Solution**: Changed the resolver to use `requireAuth()` instead, allowing authenticated students to view reasons while still protecting the data
- **Details**: 
  - Teachers can add fine reasons in the class management page
  - Cache invalidation has been implemented with `refetchQueries` for `REASONS_BY_CLASS` query
  - Students can now query reasons to populate the dropdown
- **Components Affected**:
  - ✅ `Backend/src/resolvers/Query.ts` - Changed auth requirement from teacher-only to authenticated users

### 2. Data Persistence Issues on Page Reload
- **Issue**: Dashboard, Requests, and Store pages don't maintain their data on reload
- **Status**: ✅ Fixed
- **Root Causes Found**:
  1. Redux state (accessToken, user) was not persisted to storage - lost on reload
  2. ProtectedRoute didn't update Redux when ME query succeeded with refresh token
  3. Apollo cache wasn't optimally configured for list merging
- **Solutions Implemented**:
  1. ✅ Updated `ProtectedRoute.tsx` to dispatch user data to Redux when ME query succeeds on reload
  2. ✅ Enhanced Apollo Client cache with proper merge policies for all query fields
  3. ✅ Verified all affected pages use `cache-and-network` fetch policy
- **Pages Verified**:
  - ✅ Dashboard page (already using cache-and-network)
  - ✅ Requests page (already using cache-and-network)  
  - ✅ Store page (uses useApi hook with proper caching)
- **How It Works Now**:
  - On page reload, ProtectedRoute makes ME query using refresh token cookie
  - When ME query succeeds, user data is stored in Redux for app-wide access
  - Apollo cache retains query results and merges updates properly
  - Pages can show cached data instantly while fetching fresh data in background

## Additional Notes

- **Cache Invalidation**: Recently implemented `refetchQueries` for fine reasons synchronization
- **Authentication**: May need to review auth token persistence and user context restoration
- **Apollo Client**: Consider implementing cache persistence or adjusting fetchPolicy for better user experience

## New Issues - October 7, 2025, 11:30 PM

### 1. Notification Modal Empty Issue
- **Issue**: When a notification comes through, nothing populates the notification modal even though there is a notification indicator
- **Status**: 🔴 Open
- **Priority**: High
- **Details**: 
  - Notification bell shows unread count
  - Clicking bell opens modal but no notifications are displayed
  - Need to investigate notification query and rendering logic
- **Components to Check**:
  - `Frontend/src/components/notifications/NotificationBell.tsx`
  - `Frontend/src/graphql/queries/notifications.ts`
  - Backend notification resolvers

### 2. Purchase Transaction Validation Error
- **Issue**: Purchase fails with validation error even when student has sufficient funds
- **Status**: 🔴 Open
- **Priority**: High
- **Error Message**: "Purchase failed - Transaction validation failed: amount: Path `amount` (-10) is less than minimum allowed value (0)."
- **Details**:
  - Student has enough funds but purchase is rejected
  - Transaction model validation is treating negative amount (debit) as invalid
  - Need to allow negative amounts for purchases/debits
- **Root Cause**: Transaction model may have min: 0 validation on amount field
- **Components to Check**:
  - `Backend/src/models/Transaction.ts` - Check amount field validation
  - Purchase mutation resolver - Ensure amount is being set correctly (should be negative for debits)

### 3. Double Payment Investigation
- **Issue**: When a teacher pays out a student, the amount might be getting doubled
- **Status**: 🔴 Open
- **Priority**: High
- **Details**:
  - Need to verify payment logic to ensure amount isn't being applied twice
  - Check if payment creates multiple transactions
- **Components to Check**:
  - `Backend/src/resolvers/Mutation.ts` - payRequest mutation
  - Account balance update logic
  - Transaction creation for payments

### 4. Student Purchase History & Backpack Feature
- **Feature Request**: Comprehensive purchase tracking and redemption system
- **Status**: 🔴 Open
- **Priority**: Medium
- **Requirements**:
  1. **Student "Backpack" Feature**:
     - Purchased items go into student's "Backpack"
     - Backpack shown in sidebar
     - Students can view their purchased items
  
  2. **Item Redemption System**:
     - Student clicks "Redeem" on an item in their backpack
     - Creates a redemption request that requires teacher approval
     - Teacher must comment on what the item was used for (history tracking)
     - Once approved, item is removed from backpack and marked as redeemed
  
  3. **History Tracking**:
     - Both students and teachers can view purchase/redemption history
     - Teachers can view inside any student's backpack
     - Teachers have a dedicated page showing all redemption requests
     - Redemption page organized by class and student
  
  4. **Implementation Tasks**:
     - [ ] Create `PurchasedItem` model with fields: studentId, itemId, purchaseDate, status (in-backpack, redeemed, expired), redemptionDate, redemptionNote
     - [ ] Create `RedemptionRequest` model with fields: purchasedItemId, studentId, requestDate, status (pending, approved, denied), teacherComment
     - [ ] Add GraphQL schema for PurchasedItem and RedemptionRequest
     - [ ] Create mutations: createRedemptionRequest, approveRedemption, denyRedemption
     - [ ] Create queries: studentBackpack, redemptionRequests (for teachers), purchaseHistory
     - [ ] Build Backpack component for sidebar
     - [ ] Build redemption request UI for students
     - [ ] Build teacher redemption approval page
     - [ ] Add purchase history view for both roles

## Recently Completed

- ✅ Enhanced class management page with missing fields
- ✅ Added fine reasons management functionality  
- ✅ Fixed React Select empty string value errors
- ✅ Implemented missing GraphQL resolvers (`addReasons`, `setReasons`)
- ✅ Added cache invalidation for cross-component data consistency
- ✅ Implemented comprehensive notification system with real-time updates
- ✅ Added theme switching (light/dark mode) with profile menu
- ✅ Fixed subscription errors with proper null handling
- ✅ Made User.name nullable to handle missing user data gracefully
