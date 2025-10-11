# Job Management System - Quick Start Guide

## What Was Built

A complete job management and application system that allows:
- **Teachers**: Create and manage jobs, review applications, hire students
- **Students**: Browse job board, apply for positions, track application status
- **Both**: Receive real-time notifications for all job-related activities

## How to Use

### For Teachers

1. **Navigate to Jobs**
   - Click "Jobs" in the sidebar (briefcase icon)
   - You'll see the Job Management dashboard

2. **Create a New Job**
   - Click "Create Job" button
   - Fill in:
     - Job Title (required) - e.g., "Line Leader"
     - Description - Brief overview
     - Roles & Responsibilities - Detailed duties
     - Salary Amount (required) - e.g., 100
     - Pay Period (required) - Weekly, Bi-weekly, Monthly, or Semester
     - Maximum Positions - How many students can have this job
     - Active checkbox - Whether accepting applications
   - Click "Create Job"
   - All students in the class will receive a notification

3. **Manage Existing Jobs**
   - View all jobs in the "Jobs" tab
   - Click edit icon to modify job details
   - Click trash icon to delete (only works if no active employees)
   - See capacity status (filled positions / max positions)

4. **Review Applications**
   - Switch to "Applications" tab
   - See badge counts for pending applications
   - Applications grouped by status: Pending, Approved, Rejected
   - Click any application card to view full details

5. **Approve or Reject Applications**
   - Click on an application to open details
   - Review:
     - Student's application statement
     - Their qualifications
     - Their availability
   - Click "Approve & Hire" to:
     - Create employment record
     - Notify student of approval
     - Update job capacity
   - Click "Reject" to:
     - Optionally provide rejection reason
     - Notify student

### For Students

1. **Browse Job Board**
   - Click "Job Board" in the sidebar (briefcase icon)
   - See all available active jobs
   - View job details including:
     - Title and description
     - Salary and pay period
     - Available positions
     - Roles and responsibilities

2. **Apply for a Job**
   - Click "Apply Now" on any job
   - Fill in application form:
     - **Application Statement (required)**: Why you want the job
     - **Qualifications (optional)**: Your relevant skills/experience
     - **Availability (optional)**: When you can work
   - Click "Submit Application"
   - Teacher receives notification

3. **Track Your Applications**
   - Switch to "My Applications" tab
   - See all your submitted applications
   - Status badges show: PENDING, APPROVED, or REJECTED
   - View application details you submitted

4. **Withdraw Applications**
   - For pending applications only
   - Click "Withdraw Application" button
   - Confirm withdrawal

5. **Get Hired!**
   - When approved, you'll receive notification
   - See success message in My Applications
   - Employment record created automatically

## Technical Details

### Routes
- Teachers: Navigate to `/jobs` → Auto-routed to JobManagementPage
- Students: Navigate to `/jobs` → Auto-routed to JobBoardPage

### Database Fields

**Job includes:**
- Title, description
- Roles & responsibilities
- Salary (amount + period)
- Capacity (current/max)
- Active status

**Application includes:**
- Student info
- Application text (required)
- Qualifications (optional)
- Availability (optional)
- Status (PENDING/APPROVED/REJECTED/WITHDRAWN)

**Employment (created on approval):**
- Links student to job
- Tracks start date
- Status (ACTIVE/ENDED)

### Validation Rules

1. **Students can't:**
   - Apply twice to the same job
   - Apply to jobs they're already employed in
   - Apply to full jobs (capacity reached)
   - Apply to inactive jobs

2. **Teachers can't:**
   - Delete jobs with active employees
   - Approve applications for full jobs

3. **Applications require:**
   - Student must be in the class
   - Application statement is mandatory
   - Qualifications and availability are optional

### Notifications Sent

| Event | Who Gets Notified | Notification Type |
|-------|-------------------|-------------------|
| Job Posted | All students in class | JOB_POSTED |
| Application Received | All teachers in class | JOB_APPLICATION_RECEIVED |
| Application Approved | Student who applied | JOB_APPLICATION_APPROVED |
| Application Rejected | Student who applied | JOB_APPLICATION_REJECTED |

## Next Steps

1. **Start the Backend**
   ```bash
   cd Backend
   npm run dev
   ```

2. **Start the Frontend**
   ```bash
   cd Frontend
   npm run dev
   ```

3. **Test the Flow**
   - Login as a teacher
   - Create a test job
   - Login as a student (different browser/incognito)
   - Apply for the job
   - Switch back to teacher
   - Approve the application
   - Check notifications for both users

## Common Operations

### Teacher: Edit a Job
- Go to Jobs tab
- Click edit icon on job card
- Modify any fields
- Save changes

### Teacher: View Applications for Specific Job
- Currently shows all applications
- Filter by clicking on job cards
- (Future: Add job filter in applications tab)

### Student: Check Why Application Was Rejected
- Go to My Applications tab
- View rejected application
- Rejection reason will be shown (if teacher provided one)

### Student: Withdraw Accidental Application
- Go to My Applications
- Find pending application
- Click "Withdraw Application"
- Confirm

## Troubleshooting

### "Cannot apply for this job"
- Check if you already applied (pending/approved)
- Check if job is at full capacity
- Check if job is still active
- Verify you're in the same class

### "Cannot delete job"
- Check if there are active employments
- End employments first before deleting

### Not seeing jobs
- Teachers: Check if you created any jobs
- Students: Check if there are active jobs in your class
- Verify you're looking at the correct class

### Applications not showing
- Teachers: Check Applications tab (separate from Jobs tab)
- Students: Check My Applications tab
- Ensure the correct class is selected

## Future Enhancements (Not Yet Implemented)

- End employment functionality
- Automatic payroll based on job schedule
- Job search and filtering
- Application deadlines
- Employment history view
- Job templates
- Performance tracking

For complete technical documentation, see `JOB_SYSTEM_SUMMARY.md`.
