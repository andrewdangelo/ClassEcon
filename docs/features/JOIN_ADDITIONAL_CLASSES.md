# Join Additional Classes Feature

## Overview
Students can now join multiple classes after their initial account creation. This allows students to participate in multiple classroom economies simultaneously.

## How It Works

### For Students

#### 1. **From the Dashboard**
- If a student has no class selected, they'll see a "Join Another Class" button in the center of the page
- If they're already in a class, the button appears in the dashboard header

#### 2. **From the Sidebar**
- Click the **+** button next to "Current class" in the sidebar
- This opens the "Join Another Class" modal

#### 3. **Joining Process**
1. Click "Join Another Class" button
2. Enter the 6-character join code provided by the teacher
3. Click "Join Class"
4. Success! The new class is added to your class list
5. You can switch between classes using the dropdown in the sidebar

### For Teachers
- Teachers continue to share their class join code with students
- The join code is displayed on:
  - Teacher Dashboard
  - Class Overview page
  - Class Management page
- Teachers can rotate the join code if needed for security

## Technical Details

### Backend
- **Mutation**: `joinClass(joinCode: String!)`
- Uses MongoDB's `$addToSet` to prevent duplicate class memberships
- Automatically creates a student account for the new class with starting balance
- Creates membership record linking student to the new class

### Frontend Components

#### `JoinClassModal.tsx`
Located: `Frontend/src/components/classes/JoinClassModal.tsx`

A reusable modal component that:
- Accepts a custom trigger element (or provides a default button)
- Validates the join code format
- Calls the `joinClass` mutation
- Refetches the user's class list on success
- Shows success/error toasts

Props:
```typescript
interface JoinClassModalProps {
  trigger?: React.ReactNode;  // Optional custom trigger button
  onSuccess?: () => void;      // Optional callback after successful join
}
```

#### Updated Components

**StudentDashboard**
- Shows "Join Another Class" button when no class is selected
- Shows "Join Another Class" button in the header when a class is active

**ClassSwitcher**
- Added a small **+** button next to the "Current class" label
- Opens the JoinClassModal when clicked
- Fixed display to show subject and period instead of term

## User Flow Example

1. **Sarah** signs up and joins Mrs. Smith's Math class using code `MATH01`
2. Sarah wants to also join Mr. Johnson's Science class
3. Sarah clicks the **+** button in the sidebar (or the button in the dashboard)
4. Sarah enters the code `SCI123` that Mr. Johnson gave her
5. Success! Sarah can now switch between Math and Science classes
6. Each class has its own:
   - Balance
   - Transactions
   - Jobs
   - Store items
   - Pay requests

## Database Schema

### Membership Model
```typescript
{
  userId: ObjectId,      // Reference to User
  role: "STUDENT",       // or "TEACHER"
  classIds: [ObjectId],  // Array of Class IDs (supports multiple classes)
  status: "ACTIVE"
}
```

### Account Model
Each student gets a separate account per class:
```typescript
{
  studentId: ObjectId,   // Reference to User
  classId: ObjectId,     // Reference to Class
  classroomId: ObjectId, // Reference to Classroom
}
```

## Benefits

1. **Flexibility**: Students can participate in multiple classroom economies
2. **Separation**: Each class maintains its own economy (balances, transactions, etc.)
3. **Simplicity**: Uses the same join code system as initial signup
4. **No Duplication**: Backend prevents students from joining the same class twice
5. **Easy Switching**: Students can quickly switch between classes using the sidebar dropdown

## Future Enhancements

Possible future improvements:
- Bulk import students to multiple classes
- Transfer students between classes
- View all classes on a single dashboard
- Cross-class leaderboards (optional)
- Parent accounts that can view multiple student classes
