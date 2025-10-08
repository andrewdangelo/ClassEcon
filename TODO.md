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

## Recently Completed

- ✅ Enhanced class management page with missing fields
- ✅ Added fine reasons management functionality  
- ✅ Fixed React Select empty string value errors
- ✅ Implemented missing GraphQL resolvers (`addReasons`, `setReasons`)
- ✅ Added cache invalidation for cross-component data consistency
