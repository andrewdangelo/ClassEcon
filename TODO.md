# ClassEcon TODO List

## High Priority Issues

### 1. Student Payment Request Page - Reasons Not Loading
- **Issue**: Students cannot see fine reasons in the dropdown on the payment request page
- **Status**: 🔄 In Progress
- **Details**: 
  - Teachers can add fine reasons in the class management page
  - Cache invalidation has been implemented with `refetchQueries` for `REASONS_BY_CLASS` query
  - Need to verify the fix is working end-to-end
- **Components Affected**:
  - `Frontend/src/modules/requests/StudentRequestForm.tsx`
  - `Frontend/src/modules/classes/ClassManage.tsx`
  - Backend GraphQL resolver for `setReasons`

### 2. Data Persistence Issues on Page Reload
- **Issue**: Dashboard, Requests, and Store pages don't maintain their data on reload
- **Status**: 🔍 Investigation Needed
- **Potential Causes**:
  - Apollo Client cache not persisting properly
  - GraphQL queries not being replayed after page refresh
  - User authentication state becoming undefined on reload
  - Missing cache persistence configuration
- **Pages Affected**:
  - Dashboard page
  - Requests page  
  - Store page
- **Investigation Steps**:
  - [ ] Check Apollo Client cache configuration
  - [ ] Verify user authentication persistence
  - [ ] Test query replay behavior after reload
  - [ ] Review fetchPolicy settings for affected queries

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
