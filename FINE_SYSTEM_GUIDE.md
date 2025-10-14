# Fine System Implementation Guide

## Overview

The fine system allows teachers to penalize students for various reasons (e.g., misbehaving, late work, policy violations). Students can view their fines, reasons, and the impact on their balance. All fines are reflected in the student's transaction history and trigger notifications.

---

## Features

### ✅ Teacher Capabilities
- **Issue Fines**: Select a student, specify an amount, and provide a required reason
- **View All Fines**: See all fines issued across the class with filtering by status
- **Waive Fines**: Cancel a fine and refund the student with a required reason
- **Fine Management Dashboard**: Comprehensive view of all fines with status indicators

### ✅ Student Capabilities
- **View Fines**: See all fines received with reasons and dates
- **Transaction History**: Fines appear as negative transactions in history
- **Notifications**: Receive instant notifications when fined or when a fine is waived
- **Status Tracking**: See which fines are applied vs. waived

### ✅ System Features
- **Automatic Balance Deduction**: Fines immediately deduct from student balance
- **Transaction Creation**: Each fine creates a transaction record
- **Audit Trail**: Complete history of who issued fines, when, and why
- **Refund Support**: Waived fines automatically refund the amount

---

## Backend Implementation

### 1. Database Model

**File**: `Backend/src/models/Fine.ts`

```typescript
interface IFine {
  _id: Types.ObjectId;
  studentId: Types.ObjectId;        // Student receiving the fine
  classId: Types.ObjectId;          // Class context
  teacherId: Types.ObjectId;        // Teacher who issued fine
  amount: number;                   // Fine amount (positive number)
  reason: string;                   // Required reason (e.g., "Disrupting class")
  description?: string;             // Optional additional details
  transactionId?: Types.ObjectId;   // Link to transaction record
  status: "PENDING" | "APPLIED" | "WAIVED";
  waivedReason?: string;            // Reason for waiving
  waivedAt?: Date;                  // When waived
  waivedByUserId?: Types.ObjectId;  // Who waived it
  createdAt: Date;
  updatedAt: Date;
}
```

**Indexes**:
- `studentId + classId + createdAt` - Find student fines efficiently
- `classId + status + createdAt` - Filter class fines by status
- `teacherId + classId + createdAt` - Track fines by teacher

### 2. GraphQL Schema

**File**: `Backend/src/schema.ts`

```graphql
enum FineStatus {
  PENDING
  APPLIED
  WAIVED
}

type Fine {
  id: ID!
  studentId: ID!
  student: User!
  classId: ID!
  teacherId: ID!
  teacher: User!
  amount: Int!
  reason: String!
  description: String
  transactionId: ID
  transaction: Transaction
  status: FineStatus!
  waivedReason: String
  waivedAt: DateTime
  createdAt: DateTime!
  updatedAt: DateTime!
}

input IssueFineInput {
  studentId: ID!
  classId: ID!
  amount: Int!
  reason: String!      # Required
  description: String  # Optional
}

# Queries
finesByClass(classId: ID!, status: FineStatus): [Fine!]!
finesByStudent(studentId: ID!, classId: ID!): [Fine!]!
fine(id: ID!): Fine

# Mutations
issueFine(input: IssueFineInput!): Fine!
waiveFine(id: ID!, reason: String!): Fine!
deleteFine(id: ID!): Boolean!
```

### 3. Mutations

**File**: `Backend/src/resolvers/Mutation.ts`

#### Issue Fine
```typescript
async issueFine(_: any, { input }: any, ctx: Ctx) {
  requireAuth(ctx);
  await requireClassTeacher(ctx, input.classId);

  // Validate inputs
  if (amount <= 0) throw new GraphQLError("Fine amount must be greater than zero");
  if (!reason.trim()) throw new GraphQLError("Reason is required");

  // Get or create student account
  const account = await getOrCreateAccount(studentId, classId);
  
  // Create fine record
  const fine = await Fine.create({
    studentId, classId, teacherId: ctx.userId,
    amount, reason, description, status: "APPLIED"
  });

  // Create transaction (negative amount = debit)
  const transaction = await Transaction.create({
    accountId: account._id,
    classId, classroomId,
    type: "FINE",
    amount: -amount,  // Negative for deduction
    memo: `Fine: ${reason}`,
    createdByUserId: ctx.userId
  });

  // Link transaction to fine
  fine.transactionId = transaction._id;
  await fine.save();

  // Send notification
  await createFineNotification(fine, student.name);

  return fine;
}
```

#### Waive Fine
```typescript
async waiveFine(_: any, { id, reason }: any, ctx: Ctx) {
  requireAuth(ctx);
  const fine = await Fine.findById(id).exec();
  await requireClassTeacher(ctx, fine.classId);

  if (!reason.trim()) throw new GraphQLError("Reason required");
  
  const wasApplied = fine.status === "APPLIED";
  
  // Update fine
  fine.status = "WAIVED";
  fine.waivedReason = reason;
  fine.waivedAt = new Date();
  fine.waivedByUserId = ctx.userId;
  await fine.save();

  // Create refund transaction if fine was applied
  if (wasApplied && fine.transactionId) {
    await Transaction.create({
      accountId: account._id,
      type: "REFUND",
      amount: fine.amount,  // Positive for credit
      memo: `Fine waived: ${fine.reason}`,
      createdByUserId: ctx.userId
    });
  }

  // Send notification
  await createFineWaivedNotification(fine, student.name);

  return fine;
}
```

### 4. Notifications

**File**: `Backend/src/services/notifications.ts`

```typescript
// When fine is issued
export async function createFineNotification(fine: any, studentName: string) {
  return createNotification({
    userId: fine.studentId,
    type: "FINE_ISSUED",
    title: "Fine Issued",
    message: `You have been fined CE$ ${fine.amount} for: ${fine.reason}`,
    relatedId: fine._id,
    relatedType: "Fine",
  });
}

// When fine is waived
export async function createFineWaivedNotification(fine: any, studentName: string) {
  return createNotification({
    userId: fine.studentId,
    type: "FINE_WAIVED",
    title: "Fine Waived",
    message: `Your fine of CE$ ${fine.amount} has been waived. Reason: ${fine.waivedReason}`,
    relatedId: fine._id,
    relatedType: "Fine",
  });
}
```

---

## Frontend Implementation

### 1. GraphQL Queries

**File**: `Frontend/src/graphql/queries/fines.ts`

```typescript
export const FINES_BY_CLASS = gql`
  query FinesByClass($classId: ID!, $status: FineStatus) {
    finesByClass(classId: $classId, status: $status) {
      id
      studentId
      student { id name }
      teacherId
      teacher { id name }
      amount
      reason
      description
      status
      waivedReason
      createdAt
    }
  }
`;

export const FINES_BY_STUDENT = gql`
  query FinesByStudent($studentId: ID!, $classId: ID!) {
    finesByStudent(studentId: $studentId, classId: $classId) {
      id
      amount
      reason
      description
      status
      waivedReason
      teacher { id name }
      createdAt
    }
  }
`;
```

### 2. GraphQL Mutations

**File**: `Frontend/src/graphql/mutations/fines.ts`

```typescript
export const ISSUE_FINE = gql`
  mutation IssueFine($input: IssueFineInput!) {
    issueFine(input: $input) {
      id
      studentId
      amount
      reason
      status
      createdAt
    }
  }
`;

export const WAIVE_FINE = gql`
  mutation WaiveFine($id: ID!, $reason: String!) {
    waiveFine(id: $id, reason: $reason) {
      id
      status
      waivedReason
      waivedAt
    }
  }
`;
```

### 3. Teacher Components

#### Issue Fine Dialog
**File**: `Frontend/src/components/fines/IssueFineDialog.tsx`

**Features**:
- Student dropdown selector
- Amount input with validation (must be > 0)
- Required reason field (max 100 chars)
- Optional description field (max 500 chars)
- Real-time validation
- Toast notifications on success/error

**Usage**:
```tsx
<IssueFineDialog
  open={showDialog}
  onOpenChange={setShowDialog}
  classId={classId}
  preselectedStudentId={studentId}  // Optional
/>
```

#### Fines Management Page
**File**: `Frontend/src/modules/fines/FinesManagementPage.tsx`

**Features**:
- View all fines in the class
- Filter by status (All / Applied / Waived)
- Issue new fines
- Waive existing fines
- View fine details (reason, description, teacher, date)
- Sortable table with status badges

**Status Indicators**:
- 🔴 **APPLIED**: Fine is active and deducted from balance
- 🟢 **WAIVED**: Fine was cancelled and refunded
- ⚪ **PENDING**: Fine created but not yet applied (rare)

### 4. Student Components

#### Student Fines List
**File**: `Frontend/src/components/fines/StudentFinesList.tsx`

**Features**:
- View all fines received
- See total active fines amount
- Status badges (Applied vs. Waived)
- Reason and description display
- Waive reason visibility
- Date and time stamps
- Teacher who issued the fine

**Display**:
- Active fines highlighted in red
- Waived fines shown with strikethrough
- Alert banner showing total active fines
- Empty state for students with no fines

---

## Integration Points

### 1. Transaction History

Fines automatically appear in student transaction history:

```typescript
// Transaction created when fine is issued
{
  type: "FINE",
  amount: -50,  // Negative = debit
  memo: "Fine: Disrupting class",
  createdAt: "2025-10-13T10:30:00Z"
}

// Transaction created when fine is waived
{
  type: "REFUND",
  amount: 50,   // Positive = credit
  memo: "Fine waived: Disrupting class",
  createdAt: "2025-10-13T14:45:00Z"
}
```

### 2. Balance Calculation

Fines are included in balance calculations:

**File**: `Backend/src/services/balance.ts`

```typescript
export async function computeAccountBalance(accountId: Types.ObjectId) {
  const res = await Transaction.aggregate([
    { $match: { accountId } },
    {
      $group: {
        balance: {
          $sum: {
            $switch: {
              branches: [
                // Credits (positive)
                { case: { $in: ["$type", ["DEPOSIT", "REFUND", "PAYROLL"]] },
                  then: "$amount" },
                // Debits (negative)
                { case: { $in: ["$type", ["WITHDRAWAL", "PURCHASE", "FINE"]] },
                  then: { $multiply: [-1, "$amount"] } }
              ]
            }
          }
        }
      }
    }
  ]);
  return res[0]?.balance ?? 0;
}
```

### 3. Notifications

Students receive notifications for:
- **Fine Issued**: "You have been fined CE$ 50 for: Disrupting class"
- **Fine Waived**: "Your fine of CE$ 50 has been waived. Reason: First offense"

Notifications link to the fine details page.

---

## Usage Examples

### Teacher: Issue a Fine

1. Navigate to Fines Management page
2. Click "Issue Fine" button
3. Select student from dropdown
4. Enter amount (e.g., 50)
5. Enter reason (e.g., "Disrupting class") - **Required**
6. Optionally add description for more context
7. Click "Issue Fine"

**Result**:
- Fine created with status "APPLIED"
- CE$ 50 deducted from student balance
- Transaction created: `type: "FINE", amount: -50`
- Student receives notification
- Fine appears in teacher's management page
- Fine appears in student's fine list

### Teacher: Waive a Fine

1. Find the fine in Fines Management page
2. Click "Waive" button on an applied fine
3. Enter reason (e.g., "First offense warning") - **Required**
4. Confirm

**Result**:
- Fine status changed to "WAIVED"
- CE$ 50 credited back to student
- Refund transaction created: `type: "REFUND", amount: 50`
- Student receives "Fine Waived" notification
- Fine shows as waived with reason in both views

### Student: View Fines

1. Navigate to Student Dashboard or Profile
2. View "My Fines" section (or dedicated Fines page)
3. See list of all fines with:
   - Date and time
   - Reason and description
   - Amount (red if applied, strikethrough if waived)
   - Status badge
   - Teacher name

**Active Fines Alert**:
If student has active fines, they see:
> ⚠️ **Active Fines**  
> You have 2 active fines totaling CE$ 75. These amounts have been deducted from your balance.

---

## Security & Permissions

### Authorization Rules

1. **Issue Fine**: Only teachers in the class can issue fines
2. **Waive Fine**: Only teachers in the class can waive fines
3. **Delete Fine**: Only pending/unapplied fines can be deleted
4. **View Fines**:
   - Teachers: Can view all fines in their classes
   - Students: Can only view their own fines
   - Parents: Can view their child's fines (if implemented)

### Validation Rules

1. **Amount**: Must be > 0 (positive integer)
2. **Reason**: Required, max 100 characters, trimmed
3. **Description**: Optional, max 500 characters
4. **Waive Reason**: Required when waiving, trimmed

---

## Testing

### Backend Tests

```typescript
describe("Fine System", () => {
  it("should issue a fine to a student", async () => {
    const fine = await issueFine({
      studentId, classId, amount: 50, reason: "Test fine"
    });
    expect(fine.status).toBe("APPLIED");
    expect(fine.amount).toBe(50);
  });

  it("should deduct fine from balance", async () => {
    const balanceBefore = await getBalance(studentId, classId);
    await issueFine({ studentId, classId, amount: 50, reason: "Test" });
    const balanceAfter = await getBalance(studentId, classId);
    expect(balanceAfter).toBe(balanceBefore - 50);
  });

  it("should waive fine and refund amount", async () => {
    const fine = await issueFine({ amount: 50, ... });
    const balanceAfterFine = await getBalance(studentId, classId);
    
    await waiveFine(fine.id, "First offense");
    const balanceAfterWaive = await getBalance(studentId, classId);
    
    expect(fine.status).toBe("WAIVED");
    expect(balanceAfterWaive).toBe(balanceAfterFine + 50);
  });

  it("should require reason when issuing fine", async () => {
    await expect(issueFine({ amount: 50, reason: "" }))
      .rejects.toThrow("Reason is required");
  });
});
```

### Frontend Tests

```typescript
describe("IssueFineDialog", () => {
  it("should show validation error for missing reason", async () => {
    render(<IssueFineDialog classId="123" />);
    fireEvent.click(screen.getByText("Issue Fine"));
    expect(screen.getByText("Please provide a reason")).toBeInTheDocument();
  });

  it("should successfully issue a fine", async () => {
    const { user } = render(<IssueFineDialog classId="123" />);
    await user.selectOptions(screen.getByRole("combobox"), "student-1");
    await user.type(screen.getByLabelText("Amount"), "50");
    await user.type(screen.getByLabelText("Reason"), "Disrupting class");
    await user.click(screen.getByText("Issue Fine"));
    expect(screen.getByText("Fine issued successfully")).toBeInTheDocument();
  });
});
```

---

## Troubleshooting

### Common Issues

**Issue**: Fine not deducting from balance
- **Check**: Transaction created with negative amount
- **Fix**: Ensure `amount: -fineAmount` in transaction creation

**Issue**: Student not seeing fine in list
- **Check**: Query permissions and filters
- **Fix**: Verify `studentId` and `classId` match

**Issue**: Can't waive fine
- **Check**: Fine status must be "APPLIED"
- **Fix**: Only applied fines can be waived

**Issue**: Refund not working when waiving
- **Check**: Transaction creation logic
- **Fix**: Ensure positive amount for refund transaction

---

## Future Enhancements

### Potential Features

1. **Fine Categories**: Pre-defined fine reasons (Tardiness, Behavior, Homework, etc.)
2. **Fine Templates**: Quick-issue fines with preset amounts and reasons
3. **Escalation Rules**: Automatic fine increases for repeated offenses
4. **Parent Notifications**: Notify parents when student receives a fine
5. **Fine Appeals**: Allow students to contest fines with teacher review
6. **Fine Statistics**: Analytics on fine frequency, amounts, reasons
7. **Bulk Fines**: Issue same fine to multiple students at once
8. **Scheduled Fines**: Set up recurring fines (e.g., weekly late fee)
9. **Fine Limits**: Maximum fine amount or daily fine caps
10. **Warning System**: Warnings before fines are issued

---

## API Reference

### Queries

```graphql
# Get all fines for a class
finesByClass(classId: ID!, status: FineStatus): [Fine!]!

# Get fines for a specific student
finesByStudent(studentId: ID!, classId: ID!): [Fine!]!

# Get a single fine by ID
fine(id: ID!): Fine
```

### Mutations

```graphql
# Issue a new fine
issueFine(input: IssueFineInput!): Fine!

# Waive an existing fine
waiveFine(id: ID!, reason: String!): Fine!

# Delete a fine (only if not applied)
deleteFine(id: ID!): Boolean!
```

### Notification Types

- `FINE_ISSUED`: When a fine is issued to a student
- `FINE_WAIVED`: When a fine is waived and refunded

---

## Changelog

### v1.0.0 - October 13, 2025
- ✅ Initial fine system implementation
- ✅ Issue fine mutation with validation
- ✅ Waive fine with refund functionality
- ✅ Student fine list component
- ✅ Teacher fines management page
- ✅ Transaction integration
- ✅ Notification system integration
- ✅ GraphQL schema and resolvers
- ✅ Frontend components and dialogs

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the code examples and integration points
3. Test with the provided testing guidelines
4. Contact the development team for assistance

---

**Complete Fine System** ✅  
Implemented October 13, 2025
