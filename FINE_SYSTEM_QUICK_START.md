# Fine System - Quick Start Guide

## 🚀 For Developers

### Backend Setup (Already Done ✅)

The fine system is fully integrated into the backend. No additional setup required!

**What was added:**
- Fine model with full schema
- GraphQL types and resolvers
- Mutation handlers for issue/waive/delete
- Query handlers for viewing fines
- Notification integration
- Transaction integration

### Frontend Integration

To use the fine system in your frontend:

#### 1. Add Fines Management Page (Teacher)

In your teacher routing file (e.g., `src/App.tsx`):

```tsx
import { FinesManagementPage } from "@/modules/fines/FinesManagementPage";

// Add route
<Route path="/classes/:classId/fines" element={<FinesManagementPage />} />
```

Add navigation button to teacher dashboard:

```tsx
import { DollarSign } from "lucide-react";

<Button onClick={() => navigate(`/classes/${classId}/fines`)}>
  <DollarSign className="mr-2 h-4 w-4" />
  Manage Fines
</Button>
```

#### 2. Add Student Fines View

In student profile or dashboard component:

```tsx
import { StudentFinesList } from "@/components/fines/StudentFinesList";

// In your component JSX
<StudentFinesList studentId={studentId} classId={classId} />
```

#### 3. Add "Issue Fine" Button (Optional)

On student detail pages where teachers view individual students:

```tsx
import { IssueFineDialog } from "@/components/fines/IssueFineDialog";
import { useState } from "react";

const [showFineDialog, setShowFineDialog] = useState(false);

// Button
<Button 
  variant="destructive" 
  onClick={() => setShowFineDialog(true)}
>
  <AlertTriangle className="mr-2 h-4 w-4" />
  Issue Fine
</Button>

// Dialog
<IssueFineDialog
  open={showFineDialog}
  onOpenChange={setShowFineDialog}
  classId={classId}
  preselectedStudentId={studentId}  // Auto-select this student
/>
```

---

## 📝 Usage

### Teacher: Issue a Fine

1. Go to Fines Management page
2. Click "Issue Fine"
3. Select student
4. Enter amount (must be > 0)
5. Enter reason (required)
6. Add description (optional)
7. Click "Issue Fine"

**Result**: Fine is immediately applied, balance deducted, student notified.

### Teacher: Waive a Fine

1. Find fine in management page
2. Click "Waive" button
3. Enter waive reason (required)
4. Confirm

**Result**: Fine status changes to WAIVED, amount refunded, student notified.

### Student: View Fines

Fines automatically appear in:
- Student profile (if `StudentFinesList` component added)
- Transaction history (as FINE transactions)
- Notifications (when issued or waived)

---

## 🧪 Testing

### Quick Test in GraphQL Playground

```graphql
# 1. Issue a fine
mutation {
  issueFine(input: {
    studentId: "STUDENT_ID_HERE"
    classId: "CLASS_ID_HERE"
    amount: 50
    reason: "Test fine for disrupting class"
    description: "This is a test fine"
  }) {
    id
    amount
    reason
    status
  }
}

# 2. View class fines
query {
  finesByClass(classId: "CLASS_ID_HERE") {
    id
    student { name }
    amount
    reason
    status
    createdAt
  }
}

# 3. View student fines
query {
  finesByStudent(studentId: "STUDENT_ID_HERE", classId: "CLASS_ID_HERE") {
    id
    amount
    reason
    status
    teacher { name }
  }
}

# 4. Waive a fine
mutation {
  waiveFine(id: "FINE_ID_HERE", reason: "First offense warning") {
    id
    status
    waivedReason
  }
}
```

---

## 🔍 Verification Checklist

After integration, verify:

- [ ] Teacher can access Fines Management page
- [ ] Teacher can issue fines to students
- [ ] Student balance decreases when fined
- [ ] Fine appears in transaction history
- [ ] Student receives notification
- [ ] Student can see fine in their view
- [ ] Teacher can waive fines
- [ ] Waived fines refund the amount
- [ ] Student receives waive notification
- [ ] Status filters work (All/Applied/Waived)

---

## 📊 Where Fines Appear

### For Teachers
1. **Fines Management Page** (`/classes/:classId/fines`)
   - All fines in the class
   - Filter by status
   - Issue new fines
   - Waive fines

2. **Student Detail Pages** (if Issue Fine button added)
   - Quick access to issue fine for specific student

### For Students
1. **Student Profile/Dashboard** (if StudentFinesList added)
   - All fines received
   - Active fines alert
   - Status indicators

2. **Transaction History** (Already integrated)
   - Fines show as FINE type transactions (negative)
   - Refunds show as REFUND type transactions (positive)

3. **Notifications** (Already integrated)
   - "Fine Issued" notification
   - "Fine Waived" notification

---

## 🎨 UI Components

### IssueFineDialog
- **Purpose**: Teacher issues a fine
- **Props**:
  - `open`: boolean
  - `onOpenChange`: (open: boolean) => void
  - `classId`: string
  - `preselectedStudentId?`: string (optional)

### FinesManagementPage
- **Purpose**: Teacher views/manages all class fines
- **URL**: `/classes/:classId/fines`
- **Features**: Issue, view, filter, waive fines

### StudentFinesList
- **Purpose**: Student views their fines
- **Props**:
  - `studentId`: string
  - `classId`: string
- **Features**: View fines, see status, active fines alert

---

## 🔧 Customization

### Change Fine Amount Limits

In `IssueFineDialog.tsx`:

```tsx
<Input
  type="number"
  min="1"        // Change minimum
  max="1000"     // Add maximum
  step="5"       // Change increment
  // ...
/>
```

### Add Fine Categories

Create a dropdown for preset reasons:

```tsx
const FINE_REASONS = [
  "Disrupting class",
  "Late to class",
  "Missing homework",
  "Inappropriate behavior",
  "Other"
];

<Select onValueChange={setReason}>
  {FINE_REASONS.map(r => (
    <SelectItem key={r} value={r}>{r}</SelectItem>
  ))}
</Select>
```

### Custom Status Colors

In `FinesManagementPage.tsx` or `StudentFinesList.tsx`:

```tsx
const getStatusBadge = (status: string) => {
  switch (status) {
    case "APPLIED":
      return <Badge className="bg-red-500">Applied</Badge>;
    case "WAIVED":
      return <Badge className="bg-green-500">Waived</Badge>;
    // ...
  }
};
```

---

## 🐛 Troubleshooting

### Fine not showing up?

**Check:**
1. Fine was successfully created (check GraphQL response)
2. Query has correct `studentId` and `classId`
3. Component is re-fetching after mutation
4. No GraphQL errors in console

### Balance not updating?

**Check:**
1. Transaction was created (check database)
2. Transaction has correct negative amount
3. Balance calculation includes FINE type
4. Account exists for student in that class

### Notification not received?

**Check:**
1. Notification service is running
2. `createFineNotification` was called
3. Student is subscribed to notifications
4. Check notification queries/subscriptions

---

## 📚 Additional Resources

- **Full Guide**: `FINE_SYSTEM_GUIDE.md`
- **Summary**: `FINE_SYSTEM_SUMMARY.md`
- **API Reference**: See GraphQL schema in `Backend/src/schema.ts`
- **Code Examples**: See mutations in `Backend/src/resolvers/Mutation.ts`

---

## ✨ Features Included

✅ Issue fines with amount and reason  
✅ Required reason field for accountability  
✅ Optional description for details  
✅ Automatic balance deduction  
✅ Transaction history integration  
✅ Waive fines with refunds  
✅ Student notifications  
✅ Teacher management dashboard  
✅ Student fine list view  
✅ Status tracking (Applied/Waived)  
✅ Audit trail (who, when, why)  
✅ Permission-based access  
✅ Input validation  
✅ Error handling  
✅ Loading states  
✅ Empty states  

---

## 🎯 Next Steps

1. **Integrate** the components into your UI
2. **Test** the complete flow
3. **Customize** colors, limits, or categories as needed
4. **Deploy** to production
5. **Monitor** usage and gather feedback

---

**Ready to use! 🚀**

For questions, refer to the comprehensive guides or check the code examples in the implementation files.
