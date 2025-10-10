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
- **Status**: ✅ Fixed
- **Priority**: High
- **Root Cause**: Missing `Notification` resolver in backend - GraphQL couldn't map MongoDB's `_id` to GraphQL's `id` field
- **Solutions Implemented**:
  1. ✅ Added `Notification: { id: pickId }` to backend resolvers - **THIS WAS THE KEY FIX**
  2. ✅ Fixed subscription resolver to handle undefined payloads properly
  3. ✅ Added Apollo cache policies (Notification type policy and notifications merge policy)
  4. ✅ Updated mutations with refetchQueries
- **Details**: 
  - Backend query was returning 4 notifications from MongoDB
  - But GraphQL couldn't serialize them because `_id` wasn't mapped to `id`
  - Frontend expected `id` field but was getting `_id`, causing the data to be unusable
  - All other models had `id: pickId` resolver but Notification was missing
- **Files Modified**:
  - `Backend/src/resolvers/index.ts` - **Added Notification: { id: pickId }** ⭐ MAIN FIX
  - `Backend/src/resolvers/Subscription.ts` - Fixed undefined payload handling
  - `Frontend/src/graphql/client.ts` - Cache policies
  - `Frontend/src/components/notifications/NotificationBell.tsx` - Debugging & error states
  - `Backend/src/resolvers/Query.ts` - Debug logging (can be removed)
  - `Frontend/src/graphql/links.ts` - Error logging

### 2. Purchase Transaction Validation Error
- **Issue**: Purchase fails with validation error even when student has sufficient funds
- **Status**: ✅ Fixed
- **Priority**: High
- **Error Message**: "Purchase failed - Transaction validation failed: amount: Path `amount` (-10) is less than minimum allowed value (0)."
- **Root Cause**: Transaction model had `min: 0` validation on amount field, preventing negative amounts needed for debits/purchases
- **Solution**: Removed the `min: 0` validation constraint to allow negative amounts for debits (purchases, fines, etc.)
- **Details**:
  - Transaction amounts can now be negative (debits) or positive (credits)
  - Purchases correctly create negative transactions to deduct from student balance
  - The purchase mutation logic was correct - it was just the model validation blocking it
- **Files Modified**:
  - `Backend/src/models/Transaction.ts` - Removed `min: 0` validation from amount field ⭐ MAIN FIX

### 3. Double Payment Investigation
- **Issue**: When a teacher pays out a student, the amount might be getting doubled
- **Status**: ✅ Fixed
- **Priority**: High
- **Root Cause**: Both `approvePayRequest` AND `submitPayRequest` were creating transactions, causing double payment
- **Solution**: Removed transaction creation from `approvePayRequest` - only `submitPayRequest` creates the transaction now
- **Details**:
  - **Previous Flow (BROKEN)**:
    1. Teacher approves request → `approvePayRequest` creates PAYROLL transaction with amount
    2. Teacher/system pays request → `submitPayRequest` creates ANOTHER transaction with amount
    3. Result: Amount is added to student balance TWICE 💥
  - **New Flow (FIXED)**:
    1. Teacher approves request → `approvePayRequest` just updates status to "APPROVED" and stores approved amount
    2. Teacher/system pays request → `submitPayRequest` creates ONE transaction with the approved amount
    3. Result: Amount is added to student balance ONCE ✅
  - The approve step is now just an approval/review step, not a payment step
  - Actual payment only happens when `submitPayRequest` is called
- **Files Modified**:
  - `Backend/src/resolvers/Mutation.ts` - Removed transaction creation from `approvePayRequest` ⭐ MAIN FIX

### 4. Student Purchase History & Backpack Feature
- **Feature Request**: Comprehensive purchase tracking and redemption system
- **Status**: � In Progress - Backend Complete, Frontend Needed
- **Priority**: Medium
- **Backend Implementation**: ✅ Complete
  
  **Completed Tasks**:
  - ✅ Enhanced `Purchase` model with status tracking (in-backpack, redeemed, expired)
  - ✅ Created `RedemptionRequest` model with all required fields
  - ✅ Added GraphQL schema types: `Purchase` (enhanced), `RedemptionRequest`
  - ✅ Added GraphQL enums: `PurchaseStatus`, `RedemptionStatus`
  - ✅ Implemented mutations:
    - `createRedemptionRequest(purchaseId, studentNote)` - Student requests to redeem item
    - `approveRedemption(id, teacherComment)` - Teacher approves and marks item as redeemed
    - `denyRedemption(id, teacherComment)` - Teacher denies redemption request
  - ✅ Implemented queries:
    - `studentBackpack(studentId, classId)` - Get items in student's backpack
    - `purchaseHistory(studentId, classId)` - Full purchase history with all statuses
    - `redemptionRequests(classId, status)` - Teacher views redemption requests
    - `redemptionRequest(id)` - Get single redemption request details
  - ✅ Added field resolvers for nested data (storeItem, purchase, student, reviewedBy)
  - ✅ Proper authorization checks (students can only access their own data, teachers can access their class)
  
  **How It Works**:
  1. Student makes purchase → Status: "in-backpack"
  2. Student creates redemption request → Status remains "in-backpack", request: "pending"
  3. Teacher approves → Purchase status: "redeemed", redemption date & note saved
  4. Teacher denies → Purchase stays "in-backpack", student can request again later
  
  **Frontend Tasks Remaining**:
  - [ ] Run `pnpm codegen` to generate TypeScript types from new schema
  - [ ] Build Backpack component for sidebar (shows in-backpack items with redeem button)
  - [ ] Build redemption request UI for students (view pending/approved/denied requests)
  - [ ] Build teacher redemption approval page (list of pending requests by class)
  - [ ] Add purchase history view for both students and teachers
  - [ ] Create GraphQL queries/mutations in Frontend
  - [ ] Add navigation links to new pages
  
  **Files Created/Modified**:
  - Backend:
    - `Backend/src/models/Purchase.ts` - Added status, redemptionDate, redemptionNote
    - `Backend/src/models/RedemptionRequest.ts` - New model (created)
    - `Backend/src/models/index.ts` - Export new model
    - `Backend/src/schema.ts` - Added types, enums, queries, mutations
    - `Backend/src/resolvers/Query.ts` - Added 4 new query resolvers
    - `Backend/src/resolvers/Mutation.ts` - Added 3 new mutation resolvers
    - `Backend/src/resolvers/index.ts` - Added field resolvers
  - Frontend: (To be implemented)

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
