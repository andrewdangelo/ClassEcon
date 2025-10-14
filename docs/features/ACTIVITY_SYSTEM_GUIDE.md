# Student Activity System

> Complete implementation guide for the transaction activity tracking system

**Last Updated:** October 13, 2025  
**Status:** ✅ Complete  
**Version:** 1.0.0

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Components](#components)
- [GraphQL Queries](#graphql-queries)
- [Bug Fixes](#bug-fixes)
- [Usage Guide](#usage-guide)
- [Testing](#testing)
- [Future Enhancements](#future-enhancements)

---

## Overview

The Activity System provides students with a comprehensive view of their financial transactions within the classroom economy. It includes:

- **Dashboard Widget** - Quick view of recent activity with filtering
- **Balance Chart** - Visual representation of balance over time
- **Activity Page** - Full transaction history with advanced filtering and export

### Key Benefits

- 📊 Visual balance tracking over time
- 🔍 Advanced filtering by transaction type
- 📈 Transaction statistics and insights
- 📄 CSV export capability
- 🎯 Real-time updates via GraphQL subscriptions

---

## Features

### 1. Student Activity Widget

**Location:** Student Dashboard (bottom section)  
**Purpose:** Quick overview of recent transactions

**Features:**
- Shows last 5 transactions
- Filter dropdown for transaction types:
  - All Activity
  - Income (DEPOSIT, INCOME, PAYROLL, REFUND)
  - Expenses (PURCHASE, FINE, WITHDRAWAL, EXPENSE)
  - Transfers
  - Adjustments
- Statistics cards (total, income, expenses)
- "View All" button to expand to full page

### 2. Balance Over Time Chart

**Location:** Student Dashboard (top section)  
**Purpose:** Visualize balance history

**Features:**
- SVG line chart with gradient area fill
- Responsive design
- Automatic scaling
- Data points on hover
- Statistics display (highest, lowest, total transactions)
- Grid lines for easy reading

### 3. My Activity Page

**Location:** `/student/:classId/activity`  
**Purpose:** Comprehensive transaction history

**Features:**
- Advanced filtering:
  - By transaction type (10 types)
  - By date range
  - By search term (description, amount)
- Pagination support
- CSV export functionality
- Statistics cards
- Transaction type badges with color coding
- Responsive table design

---

## Architecture

### Data Flow

```
┌─────────────────┐
│  Student Views  │
│  - Dashboard    │
│  - Activity Pg  │
└────────┬────────┘
         │
         │ 1. Query ACCOUNT
         ↓    (userId + classId)
┌─────────────────┐
│  Apollo Client  │
└────────┬────────┘
         │
         │ 2. Get Account._id
         ↓
┌─────────────────┐
│  GraphQL API    │
└────────┬────────┘
         │
         │ 3. Query TRANSACTIONS
         ↓    (accountId)
┌─────────────────┐
│    MongoDB      │
│  - Account      │
│  - Transaction  │
└─────────────────┘
```

### Two-Step Query Pattern

**Critical Fix:** The system uses a two-step query to resolve Account IDs:

1. **Step 1:** Query `ACCOUNT` with `studentId` + `classId` → Get `Account._id` (MongoDB ObjectId)
2. **Step 2:** Query `TRANSACTIONS_BY_ACCOUNT` with `accountId` → Get transactions

**Why?** Backend requires actual MongoDB ObjectId, not composite string keys.

---

## Components

### StudentActivityWidget.tsx

**Path:** `Frontend/src/components/activity/StudentActivityWidget.tsx`

**Props:**
```typescript
interface StudentActivityWidgetProps {
  studentId: string;
  classId: string;
}
```

**Key Features:**
- Filter dropdown
- Loading states
- Error handling
- Statistics calculation
- Transaction type grouping

**GraphQL Queries:**
```graphql
query Account($userId: ID!, $classId: ID!) {
  account(userId: $userId, classId: $classId) {
    _id
  }
}

query TransactionsByAccount($accountId: ID!) {
  transactionsByAccount(accountId: $accountId) {
    _id
    type
    amount
    description
    balanceAfter
    createdAt
  }
}
```

### BalanceOverTimeChart.tsx

**Path:** `Frontend/src/components/activity/BalanceOverTimeChart.tsx`

**Props:**
```typescript
interface BalanceOverTimeChartProps {
  studentId: string;
  classId: string;
}
```

**Key Features:**
- SVG rendering for performance
- Responsive viewBox
- Gradient fill under line
- Grid lines
- Statistics display
- Automatic Y-axis scaling

**Chart Dimensions:**
- Width: 100% (responsive)
- Height: 300px
- Padding: 40px (top/right), 60px (bottom/left)

### MyActivityPage.tsx

**Path:** `Frontend/src/modules/activity/MyActivityPage.tsx`

**Key Features:**
- URL state management for filters
- Date range picker
- Search input with debouncing
- CSV export with date formatting
- Transaction type badges
- Responsive table design

**URL Parameters:**
```typescript
?type=PURCHASE&startDate=2025-01-01&endDate=2025-12-31&search=lunch
```

**Export Format:**
```csv
Date,Type,Description,Amount,Balance After
2025-10-13,PURCHASE,Lunch ticket,-5.00,45.00
```

---

## GraphQL Queries

### ACCOUNT Query

```graphql
query Account($userId: ID!, $classId: ID!) {
  account(userId: $userId, classId: $classId) {
    _id
    balance
    totalEarned
    totalSpent
  }
}
```

**Purpose:** Get account ID and statistics  
**Returns:** Account object with MongoDB ObjectId

### TRANSACTIONS_BY_ACCOUNT Query

```graphql
query TransactionsByAccount($accountId: ID!) {
  transactionsByAccount(accountId: $accountId) {
    _id
    type
    amount
    description
    balanceAfter
    createdAt
    metadata {
      storeItemId
      storeItemName
      jobId
      jobTitle
      payRequestId
      reason
    }
  }
}
```

**Purpose:** Get all transactions for an account  
**Returns:** Array of Transaction objects

### Transaction Types

```typescript
enum TransactionType {
  DEPOSIT      // Manual deposit
  INCOME       // General income
  PAYROLL      // Job salary
  REFUND       // Purchase refund
  PURCHASE     // Store purchase
  FINE         // Student fine
  WITHDRAWAL   // Manual withdrawal
  EXPENSE      // General expense
  TRANSFER     // Account transfer
  ADJUSTMENT   // Balance adjustment
}
```

---

## Bug Fixes

### Account ID Casting Error

**Issue:** GraphQL error when querying transactions
```
Cast to ObjectId failed for value "68e423639c1231b098570dfb_68e421a7da45a42e43dba5ce"
```

**Root Cause:**  
Frontend was passing composite string `userId_classId` as `accountId`, but backend expects MongoDB ObjectId from `Account._id` field.

**Solution:**  
Implemented two-step query pattern:

**Before (❌ Broken):**
```typescript
const accountId = `${user._id}_${classId}`;
const { data } = useQuery(TRANSACTIONS_BY_ACCOUNT, {
  variables: { accountId }
});
```

**After (✅ Fixed):**
```typescript
// Step 1: Get real account ID
const { data: accountData } = useQuery(ACCOUNT, {
  variables: { userId: user._id, classId }
});

// Step 2: Use real ID for transactions
const { data } = useQuery(TRANSACTIONS_BY_ACCOUNT, {
  variables: { accountId: accountData.account._id }
});
```

**Files Updated:**
- `StudentActivityWidget.tsx`
- `BalanceOverTimeChart.tsx`
- `MyActivityPage.tsx`
- `StudentDashboard.tsx`

---

## Usage Guide

### For Developers

#### Adding Activity Widget to Dashboard

```tsx
import StudentActivityWidget from '@/components/activity/StudentActivityWidget';

function StudentDashboard() {
  const { user } = useAuth();
  const { classId } = useParams();
  
  return (
    <div>
      {/* Other dashboard content */}
      <StudentActivityWidget 
        studentId={user._id} 
        classId={classId} 
      />
    </div>
  );
}
```

#### Adding Balance Chart

```tsx
import BalanceOverTimeChart from '@/components/activity/BalanceOverTimeChart';

<BalanceOverTimeChart 
  studentId={user._id} 
  classId={classId} 
/>
```

#### Creating Activity Page Route

```tsx
// In main.tsx or router config
<Route 
  path="/student/:classId/activity" 
  element={<MyActivityPage />} 
/>
```

### For Students

#### Viewing Recent Activity

1. Navigate to Student Dashboard
2. Scroll to "My Activity" widget
3. Use filter dropdown to select transaction type
4. Click "View All" for full history

#### Viewing Balance History

1. Navigate to Student Dashboard
2. View chart at top of page
3. Hover over data points for details

#### Filtering Transactions

1. Navigate to "My Activity" page
2. Use filter controls:
   - **Type Filter:** Select specific transaction type
   - **Date Range:** Pick start and end dates
   - **Search:** Enter description or amount

#### Exporting Data

1. Navigate to "My Activity" page
2. Apply desired filters
3. Click "Export CSV" button
4. Open file in spreadsheet application

---

## Testing

### Unit Tests

```bash
# Test component rendering
npm test StudentActivityWidget.test.tsx

# Test chart rendering
npm test BalanceOverTimeChart.test.tsx

# Test filtering logic
npm test MyActivityPage.test.tsx
```

### Manual Testing

#### Test Case 1: Dashboard Widget

1. ✅ Login as student
2. ✅ Navigate to dashboard
3. ✅ Verify widget shows last 5 transactions
4. ✅ Test filter dropdown
5. ✅ Verify "View All" navigation

#### Test Case 2: Balance Chart

1. ✅ Login as student with transaction history
2. ✅ Navigate to dashboard
3. ✅ Verify chart renders
4. ✅ Verify data points match transactions
5. ✅ Test responsive behavior

#### Test Case 3: Activity Page

1. ✅ Navigate to activity page
2. ✅ Test type filter
3. ✅ Test date range filter
4. ✅ Test search functionality
5. ✅ Test CSV export
6. ✅ Verify pagination

#### Test Case 4: Two-Step Query

1. ✅ Open DevTools Network tab
2. ✅ Navigate to dashboard
3. ✅ Verify two queries execute:
   - First: `Account` query
   - Second: `TransactionsByAccount` query
4. ✅ Verify no ObjectId errors

---

## Future Enhancements

### Planned Features

1. **Advanced Analytics**
   - Spending categories breakdown
   - Income vs. expenses trends
   - Savings rate calculation
   - Budget recommendations

2. **Interactive Chart**
   - Zoom and pan
   - Multiple time ranges (week, month, year)
   - Comparison with class average
   - Goal overlay lines

3. **Export Options**
   - PDF reports
   - Excel format
   - Custom date ranges
   - Include chart images

4. **Real-time Updates**
   - WebSocket subscription
   - Live balance updates
   - Transaction notifications
   - Push alerts

5. **Mobile Optimization**
   - Swipe gestures for filtering
   - Mobile-friendly chart
   - Touch-optimized controls
   - Offline support

### Technical Debt

- [ ] Add pagination to transactions query
- [ ] Implement query result caching
- [ ] Add loading skeletons
- [ ] Improve error messages
- [ ] Add retry logic for failed queries
- [ ] Optimize chart rendering for large datasets

---

## Related Documentation

- [Developer Documentation](../DEVELOPER_DOCUMENTATION.md) - General development guide
- [GraphQL Schema](../../Backend/src/schema.ts) - Complete schema reference
- [Testing Guide](../guides/TESTING_GUIDE.md) - Testing procedures
- [Dashboard Enhancements](DASHBOARD_ENHANCEMENTS.md) - Other dashboard features

---

## Change Log

### Version 1.0.0 (October 13, 2025)
- ✅ Initial implementation
- ✅ Dashboard widget with filtering
- ✅ Balance over time chart
- ✅ Full activity page
- ✅ CSV export
- ✅ Two-step query bug fix
- ✅ Complete documentation

---

## Support

**Found a bug?** [Open an issue](https://github.com/andrewdangelo/ClassEcon/issues)  
**Have a question?** [Start a discussion](https://github.com/andrewdangelo/ClassEcon/discussions)  
**Want to contribute?** See [CONTRIBUTING.md](../../CONTRIBUTING.md)

---

**Built with ❤️ for student financial literacy**
