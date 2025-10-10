# Backpack & Redemption System Implementation Guide

## Overview
Complete backend implementation for student purchase tracking and redemption system. Students can view purchased items in their "backpack", request to redeem items, and teachers can approve/deny redemptions with comments.

---

## Backend Implementation ✅ COMPLETE

### 1. Data Models

#### Enhanced Purchase Model
**File**: `Backend/src/models/Purchase.ts`

Added fields to track item lifecycle:
```typescript
status: "in-backpack" | "redeemed" | "expired"  // Item lifecycle
redemptionDate?: Date | null                     // When item was redeemed
redemptionNote?: string | null                   // What item was used for
```

**States**:
- `in-backpack` - Recently purchased, available for redemption
- `redeemed` - Approved and used by student
- `expired` - No longer valid (future feature)

#### RedemptionRequest Model
**File**: `Backend/src/models/RedemptionRequest.ts` (NEW)

Tracks redemption requests from students:
```typescript
{
  purchaseId: ObjectId        // The item being redeemed
  studentId: ObjectId         // Who is redeeming
  classId: ObjectId           // Which class
  status: "pending" | "approved" | "denied"
  studentNote?: string        // Why they want to redeem
  teacherComment?: string     // Teacher's decision explanation
  reviewedByUserId?: ObjectId // Which teacher reviewed
  reviewedAt?: Date          // When reviewed
}
```

### 2. GraphQL Schema

#### New Types
```graphql
enum PurchaseStatus {
  in_backpack
  redeemed
  expired
}

enum RedemptionStatus {
  pending
  approved
  denied
}

type Purchase {
  # ... existing fields ...
  status: PurchaseStatus!
  redemptionDate: DateTime
  redemptionNote: String
  storeItem: StoreItem  # Nested resolver
}

type RedemptionRequest {
  id: ID!
  purchaseId: ID!
  purchase: Purchase  # Nested resolver
  studentId: ID!
  student: User  # Nested resolver
  classId: ID!
  status: RedemptionStatus!
  studentNote: String
  teacherComment: String
  reviewedByUserId: ID
  reviewedBy: User  # Nested resolver
  reviewedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}
```

#### New Queries
```graphql
# Get items currently in student's backpack (status: in-backpack)
studentBackpack(studentId: ID!, classId: ID!): [Purchase!]!

# Get all purchases for a student (all statuses)
purchaseHistory(studentId: ID!, classId: ID!): [Purchase!]!

# Get redemption requests for a class (teacher only)
redemptionRequests(classId: ID!, status: RedemptionStatus): [RedemptionRequest!]!

# Get single redemption request
redemptionRequest(id: ID!): RedemptionRequest
```

#### New Mutations
```graphql
# Student creates redemption request
createRedemptionRequest(purchaseId: ID!, studentNote: String): RedemptionRequest!

# Teacher approves redemption (item moves to "redeemed" status)
approveRedemption(id: ID!, teacherComment: String!): RedemptionRequest!

# Teacher denies redemption (item stays in backpack)
denyRedemption(id: ID!, teacherComment: String!): RedemptionRequest!
```

### 3. Business Logic

#### Authorization
- **studentBackpack** / **purchaseHistory**: Student can only see their own, teachers can see any student in their class
- **redemptionRequests**: Teachers only, filtered by their class
- **createRedemptionRequest**: Students only, must own the purchase
- **approveRedemption** / **denyRedemption**: Teachers only, for their class

#### Validation
- Cannot redeem items not in "in-backpack" status
- Cannot create duplicate redemption requests (if pending request exists)
- Cannot approve/deny requests that aren't "pending"
- Must own the purchase to request redemption
- Must be class teacher to approve/deny

#### Workflow
```
1. PURCHASE
   Student buys item → Purchase created with status: "in-backpack"
   
2. REQUEST REDEMPTION
   Student: "I want to use this item for X"
   → RedemptionRequest created with status: "pending"
   → Purchase status stays "in-backpack"
   
3a. APPROVE
   Teacher: "Approved, here's what you used it for: Y"
   → RedemptionRequest status: "approved"
   → Purchase status: "redeemed"
   → redemptionDate and redemptionNote saved
   
3b. DENY
   Teacher: "Not now, reason: Z"
   → RedemptionRequest status: "denied"
   → Purchase stays in backpack
   → Student can request again later
```

---

## Frontend Implementation 📝 TODO

### Step 1: Generate Types
```bash
cd Frontend
pnpm codegen
```

This generates TypeScript types for new GraphQL schema.

### Step 2: Create GraphQL Operations

#### Queries
**File**: `Frontend/src/graphql/queries/backpack.ts` (CREATE)
```typescript
import { gql } from "@apollo/client";

export const STUDENT_BACKPACK = gql`
  query StudentBackpack($studentId: ID!, $classId: ID!) {
    studentBackpack(studentId: $studentId, classId: $classId) {
      id
      storeItemId
      storeItem {
        id
        title
        description
        imageUrl
      }
      quantity
      unitPrice
      total
      status
      createdAt
    }
  }
`;

export const PURCHASE_HISTORY = gql`
  query PurchaseHistory($studentId: ID!, $classId: ID!) {
    purchaseHistory(studentId: $studentId, classId: $classId) {
      id
      storeItemId
      storeItem {
        id
        title
        imageUrl
      }
      quantity
      unitPrice
      total
      status
      redemptionDate
      redemptionNote
      createdAt
    }
  }
`;

export const REDEMPTION_REQUESTS = gql`
  query RedemptionRequests($classId: ID!, $status: RedemptionStatus) {
    redemptionRequests(classId: $classId, status: $status) {
      id
      purchaseId
      purchase {
        id
        quantity
        storeItem {
          id
          title
          description
          imageUrl
        }
      }
      studentId
      student {
        id
        name
      }
      status
      studentNote
      teacherComment
      reviewedBy {
        id
        name
      }
      reviewedAt
      createdAt
    }
  }
`;
```

#### Mutations
**File**: `Frontend/src/graphql/mutations/redemption.ts` (CREATE)
```typescript
import { gql } from "@apollo/client";

export const CREATE_REDEMPTION_REQUEST = gql`
  mutation CreateRedemptionRequest($purchaseId: ID!, $studentNote: String) {
    createRedemptionRequest(purchaseId: $purchaseId, studentNote: $studentNote) {
      id
      purchaseId
      status
      studentNote
      createdAt
    }
  }
`;

export const APPROVE_REDEMPTION = gql`
  mutation ApproveRedemption($id: ID!, $teacherComment: String!) {
    approveRedemption(id: $id, teacherComment: $teacherComment) {
      id
      status
      teacherComment
      reviewedAt
    }
  }
`;

export const DENY_REDEMPTION = gql`
  mutation DenyRedemption($id: ID!, $teacherComment: String!) {
    denyRedemption(id: $id, teacherComment: $teacherComment) {
      id
      status
      teacherComment
      reviewedAt
    }
  }
`;
```

### Step 3: Build Components

#### A. Backpack Sidebar Component
**File**: `Frontend/src/components/backpack/BackpackSidebar.tsx` (CREATE)

Shows items in student's backpack with "Redeem" button.

**Features**:
- List of items with status "in-backpack"
- Item image, title, quantity
- "Redeem" button opens modal
- Shows pending redemption requests

#### B. Redemption Request Modal
**File**: `Frontend/src/components/backpack/RedemptionRequestModal.tsx` (CREATE)

Modal for students to request redemption.

**Features**:
- Item details
- Optional note field (what they want to use it for)
- Submit button
- Shows success/error messages

#### C. Student Purchase History Page
**File**: `Frontend/src/modules/backpack/PurchaseHistoryPage.tsx` (CREATE)

Full history of all purchases.

**Features**:
- Filter by status (all, in-backpack, redeemed)
- Table view: Item, Date Purchased, Status, Date Redeemed, Note
- Click to view details

#### D. Teacher Redemption Requests Page
**File**: `Frontend/src/modules/teachers/RedemptionRequestsPage.tsx` (CREATE)

Teacher view of all redemption requests.

**Features**:
- Filter by status (pending, approved, denied)
- Group by student
- Card view: Student name, item, student note
- Approve/Deny buttons with comment modal
- Shows approval history

### Step 4: Update Navigation

#### Sidebar
Add "Backpack" link for students:
```tsx
<NavLink to="/backpack">
  <ShoppingBag className="h-5 w-5" />
  <span>My Backpack</span>
  {backpackCount > 0 && <Badge>{backpackCount}</Badge>}
</NavLink>
```

#### Teacher Menu
Add "Redemption Requests" link:
```tsx
<NavLink to="/redemptions">
  <ClipboardCheck className="h-5 w-5" />
  <span>Redemption Requests</span>
  {pendingCount > 0 && <Badge variant="destructive">{pendingCount}</Badge>}
</NavLink>
```

### Step 5: Add Routes
**File**: `Frontend/src/App.tsx`

```tsx
// Student routes
<Route path="/backpack" element={
  <RequireAuth><BackpackPage /></RequireAuth>
} />
<Route path="/purchase-history" element={
  <RequireAuth><PurchaseHistoryPage /></RequireAuth>
} />

// Teacher routes
<Route path="/redemptions" element={
  <RequireTeacher><RedemptionRequestsPage /></RequireTeacher>
} />
```

---

## Testing Checklist

### Student Flow
- [ ] Student makes a purchase
- [ ] Item appears in backpack with "in-backpack" status
- [ ] Student clicks "Redeem" button
- [ ] Modal opens, student enters note
- [ ] Redemption request created successfully
- [ ] Item still shows in backpack with "pending" indicator
- [ ] Student can view request in "My Requests" section

### Teacher Flow
- [ ] Teacher sees new redemption request in pending list
- [ ] Teacher clicks to view details
- [ ] Teacher can see: student name, item, student note
- [ ] Teacher approves with comment
- [ ] Request marked as "approved"
- [ ] Item removed from student's backpack
- [ ] Item shows in purchase history as "redeemed"
- [ ] Teacher can view redemption history

### Edge Cases
- [ ] Cannot redeem already redeemed item
- [ ] Cannot create duplicate redemption request
- [ ] Cannot approve non-pending request
- [ ] Student can only see their own backpack
- [ ] Teacher can only approve for their class
- [ ] Proper error messages for all failures

---

## Database Migration

**Important**: Existing purchases in the database don't have the new fields!

### Option 1: Add default values (Recommended)
All existing purchases will automatically get `status: "in-backpack"` from schema default.

### Option 2: Manual migration (if needed)
If you want to mark old purchases as "redeemed":

```javascript
// Run in MongoDB
db.purchases.updateMany(
  { status: { $exists: false } },
  { $set: { status: "in-backpack" } }
)
```

---

## Future Enhancements

1. **Expiration System**
   - Add expiration dates to store items
   - Automatically change status to "expired" after date
   - Students can't redeem expired items

2. **Quantity Tracking**
   - If item has quantity > 1, allow partial redemption
   - Track individual redemptions per item

3. **Notifications**
   - Notify teachers of new redemption requests
   - Notify students when request is approved/denied

4. **Reports**
   - Teacher dashboard: redemption stats by student
   - Most redeemed items
   - Average time to approval

5. **Redemption Templates**
   - Pre-defined redemption reasons
   - Common use cases for items

---

## API Reference

### Queries

#### `studentBackpack(studentId, classId)`
Returns items currently in student's backpack (status: "in-backpack").

**Auth**: Student (self) or Teacher (their class)

#### `purchaseHistory(studentId, classId)`
Returns all purchases regardless of status.

**Auth**: Student (self) or Teacher (their class)

#### `redemptionRequests(classId, status?)`
Returns redemption requests for a class, optionally filtered by status.

**Auth**: Teacher (their class only)

### Mutations

#### `createRedemptionRequest(purchaseId, studentNote?)`
Student requests to redeem an item from their backpack.

**Validations**:
- Purchase must exist and belong to student
- Purchase must be in "in-backpack" status
- No pending request already exists for this purchase

**Auth**: Student (must own purchase)

#### `approveRedemption(id, teacherComment)`
Teacher approves redemption request. Item is marked as redeemed.

**Effects**:
- RedemptionRequest status → "approved"
- Purchase status → "redeemed"
- redemptionDate and redemptionNote saved

**Auth**: Teacher (their class only)

#### `denyRedemption(id, teacherComment)`
Teacher denies redemption request. Item stays in backpack.

**Auth**: Teacher (their class only)

---

## Summary

✅ **Backend Complete**: All models, schema, resolvers, and business logic implemented
📝 **Frontend TODO**: Need to build UI components and wire up GraphQL operations

The backend provides a complete, secure, and well-structured API for the backpack and redemption system. All that's needed now is to build the frontend UI!
