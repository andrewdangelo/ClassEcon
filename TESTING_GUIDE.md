# Quick Testing Guide - Backpack & Student Details

## Setup
1. Start Backend: `cd Backend && npm run dev`
2. Start Frontend: `cd Frontend && npm run dev`
3. Open browser console (F12) to see debug logs

---

## Test 1: Student Backpack Visibility

### Steps:
1. Login as a **student** account
2. Select a class from ClassSwitcher
3. Navigate to `/store`
4. Add item to cart and purchase
5. Check the **sidebar** (scroll down if needed)
6. Look for "My Backpack" section below navigation

### Expected Results:
✅ Backpack section appears below navigation links
✅ Purchased item shows with image, title, description
✅ "Request Redemption" button is visible
✅ Item count badge shows correct number

### Debug Console Logs:
Look for `BackpackSidebar Debug:` in console:
- `userId`: Should be defined
- `currentClassId`: Should match selected class
- `loading`: Should become false
- `error`: Should be undefined
- `backpackItems`: Should contain your purchase

### Troubleshooting:
❌ **Backpack not visible:**
- Check if sidebar is scrollable (try scrolling down)
- Verify user role is "STUDENT" in Sidebar debug logs
- Check if class is selected

❌ **Empty backpack:**
- Check console logs for GraphQL errors
- Verify purchase was successful (check Network tab)
- Confirm purchase status is "in-backpack"
- Check backend logs for query execution

---

## Test 2: Student Detail Page (Teacher View)

### Steps:
1. Login as a **teacher** account
2. Navigate to `/students`
3. Click on any student row
4. View the three tabs: Backpack, Purchase History, Transactions

### Expected Results:
✅ Page loads with student's balance in top-right card
✅ **Backpack tab** shows unredeemed items (status: "in-backpack")
✅ **Purchase History tab** shows all purchases with statuses
✅ **Transactions tab** shows all account activity
✅ Transaction amounts are color-coded (green for credits, red for debits)
✅ "Back to Students" button returns to list

### Tab-Specific Checks:

**Backpack Tab:**
- Cards show item images
- Quantity and prices displayed correctly
- Purchase date shown
- Status badge shows "in-backpack"

**Purchase History Tab:**
- Table with all purchases
- Columns: Item, Quantity, Unit Price, Total, Status, Date
- Status badges color-coded
- Sorted by date (newest first)

**Transactions Tab:**
- Table with all transactions
- Columns: Type, Description (memo), Amount, Date
- Type badges (DEPOSIT, PURCHASE, etc.)
- Amounts with +/- prefix
- Color coding: green for income, red for expenses

### Troubleshooting:
❌ **404 on student detail page:**
- Check route is added in main.tsx
- Verify RequireTeacher guard is present

❌ **Empty tabs:**
- Check GraphQL queries in Network tab
- Verify backend authorization passes
- Check if student has any data

❌ **Balance not showing:**
- Verify account exists for student in this class
- Check account query response

---

## Test 3: Complete Redemption Workflow

### Steps:
1. **As Student:**
   - Purchase item from store
   - Verify item in backpack sidebar
   - Click "Request Redemption"
   - Add optional note
   - Submit request

2. **As Teacher:**
   - Navigate to `/redemptions`
   - See pending request in "Pending" tab
   - Click "Approve" button
   - Add required teacher comment
   - Submit approval

3. **Verify Results:**
   - Student receives notification (check notification bell)
   - Item removed from student's backpack sidebar
   - Teacher sees item in `/students/:id` on "Purchase History" tab with status "redeemed"
   - Teacher sees item NOT in "Backpack" tab (moved to history)

### Expected Notification Flow:
1. Teacher receives "New Redemption Request" notification
2. Student receives "Redemption Approved" notification
3. Both notifications appear in bell dropdown
4. Red dot appears on bell icon

---

## Test 4: Cross-Feature Integration

### Scenario: Full Student Journey

1. **Initial State:**
   - Login as student
   - Check balance (should be 0 or some starting amount)

2. **Earn Money:**
   - Teacher creates pay request for student
   - Student submits pay request
   - Teacher approves pay request
   - Teacher pays out request
   - **Verify:** Balance increases, transaction appears in history

3. **Make Purchase:**
   - Navigate to store
   - Add item to cart
   - Complete purchase
   - **Verify:** Balance decreases, item appears in backpack sidebar

4. **Request Redemption:**
   - Click "Request Redemption" in backpack
   - Submit request
   - **Verify:** Teacher receives notification

5. **Teacher Approves:**
   - Teacher navigates to redemptions page
   - Approves request
   - **Verify:** Item removed from student backpack, appears in history

6. **Check Student Detail (Teacher View):**
   - Teacher clicks student in students list
   - **Verify all three tabs:**
     - Backpack: Empty (item was redeemed)
     - Purchase History: Shows purchase with "redeemed" status
     - Transactions: Shows all transactions (purchase, payroll, etc.)

---

## Common Issues & Solutions

### Issue 1: Backpack Not Showing
**Symptoms:** Student purchases item but sidebar looks the same

**Check:**
1. Console logs - look for GraphQL errors
2. Network tab - verify STUDENT_BACKPACK query executes
3. Response data - check if items returned
4. Purchase status - should be "in-backpack"

**Solution:**
- Ensure class is selected (ClassContext has currentClassId)
- Verify user is authenticated (user.id exists)
- Check backend logs for authorization errors

### Issue 2: Student Detail Page 404
**Symptoms:** Clicking student row shows "Page not found"

**Check:**
1. Route defined in main.tsx
2. StudentDetail component imported
3. RequireTeacher guard present

**Solution:**
- Add route: `{ path: "students/:studentId", element: <RequireTeacher><StudentDetail /></RequireTeacher> }`
- Import component at top of main.tsx

### Issue 3: Empty Tabs
**Symptoms:** Student detail page loads but all tabs show "No data"

**Check:**
1. GraphQL queries executing (Network tab)
2. Variables passed correctly (studentId, classId, accountId)
3. Backend authorization passing

**Solution:**
- Verify currentClassId is available
- Check if student has purchases/transactions
- Test queries in GraphQL playground

### Issue 4: Transactions Not Loading
**Symptoms:** Backpack and purchases work, but transactions tab empty/loading forever

**Check:**
1. Account ID retrieved from STUDENT_DETAILS query
2. STUDENT_TRANSACTIONS query skipped correctly when no accountId
3. Backend transactionsByAccount resolver works

**Solution:**
- Ensure account exists for student in class
- Check if transactionsByAccount query returns data
- Verify accountId is passed to second query

---

## Performance Checks

### Page Load Times
- Students list: < 1 second
- Student detail page: < 2 seconds (3 queries)
- Backpack sidebar: < 500ms (sidebar query)

### Network Requests
- Student detail should make 2 queries:
  1. STUDENT_DETAILS (combined query)
  2. STUDENT_TRANSACTIONS (after accountId received)

### Cache Behavior
- Navigate away and back - should load from cache first
- Mutations should refetch affected queries
- `cache-and-network` policy keeps UI responsive

---

## Browser Console Commands

### Check Current User
```javascript
window.localStorage.getItem('token')
```

### Check Apollo Cache
```javascript
// In React DevTools
$r.__APOLLO_CLIENT__.cache.extract()
```

### Force Refetch Backpack
```javascript
// In component with useQuery
refetch()
```

---

## Success Criteria

✅ **Student Experience:**
- Can see purchased items in sidebar immediately
- Can submit redemption requests
- Receives notifications on approval/denial
- Items disappear from backpack after approval

✅ **Teacher Experience:**
- Can click any student to view details
- Can see student's backpack, purchases, transactions
- Can approve/deny redemption requests
- Receives notifications on student submissions

✅ **Data Accuracy:**
- Balances are correct
- Transaction history is complete
- Purchase statuses update correctly
- Notifications trigger appropriately

---

## Next Steps After Testing

1. **If backpack not showing:**
   - Share console logs
   - Check backend logs
   - Verify GraphQL schema matches queries

2. **If student detail works:**
   - Test with multiple students
   - Test with edge cases (no data, lots of data)
   - Test authorization (student accessing other students)

3. **If everything works:**
   - Remove debug console.logs
   - Consider adding loading skeletons
   - Add error boundaries
   - Optimize queries if slow
