# Job Management System - Implementation Summary

## Overview
Implemented a comprehensive job management and application system for ClassEcon that allows teachers to post jobs and students to apply for positions.

## Features Implemented

### Teacher Features
1. **Job Management Dashboard** (`/jobs` for teachers)
   - Create new jobs with detailed information
   - Edit existing jobs
   - Delete jobs (with validation to prevent deletion of active employments)
   - View job capacity and current fills
   - Toggle job active/inactive status

2. **Job Application Review**
   - View all applications by status (Pending/Approved/Rejected)
   - Read full application details including:
     - Application statement
     - Qualifications
     - Availability
   - Approve applications (automatically creates employment)
   - Reject applications with optional reason

3. **Job Configuration Options**
   - Title and description
   - Roles & responsibilities (detailed duties)
   - Salary amount and pay period (Weekly/Bi-weekly/Monthly/Semester)
   - Maximum positions
   - Active/inactive toggle

### Student Features
1. **Job Board** (`/jobs` for students)
   - Browse all active jobs
   - View job details including:
     - Salary and pay period
     - Available positions
     - Roles and responsibilities
   - Apply for positions
   - Track application status

2. **Job Applications**
   - Submit applications with required fields:
     - Application statement (required)
     - Qualifications (optional)
     - Availability (optional)
   - View all submitted applications
   - Withdraw pending applications
   - See approval/rejection status
   - Receive notifications for status changes

### Notifications
Both teachers and students receive real-time notifications for:
- New job postings (students)
- New applications received (teachers)
- Application approved/hired (students)
- Application rejected (students with optional reason)

## Backend Implementation

### Database Models Updated

**Job Model** (`Backend/src/models/Job.ts`)
- Added `rolesResponsibilities` field for detailed job descriptions

**JobApplication Model** (`Backend/src/models/JobApplication.ts`)
- Added `applicationText` (student's application statement)
- Added `qualifications` (optional)
- Added `availability` (optional)

### GraphQL Schema (`Backend/src/schema.ts`)

**New Queries:**
```graphql
jobs(classId: ID!, activeOnly: Boolean = true): [Job!]!
job(id: ID!): Job
jobApplications(jobId: ID, studentId: ID, classId: ID, status: JobApplicationStatus): [JobApplication!]!
jobApplication(id: ID!): JobApplication
studentEmployments(studentId: ID!, classId: ID!, status: EmploymentStatus): [Employment!]!
jobEmployments(jobId: ID!, status: EmploymentStatus): [Employment!]!
```

**New Mutations:**
```graphql
createJob(input: CreateJobInput!): Job!
updateJob(id: ID!, input: UpdateJobInput!): Job!
deleteJob(id: ID!): Boolean!
applyForJob(input: ApplyForJobInput!): JobApplication!
approveJobApplication(id: ID!): JobApplication!
rejectJobApplication(id: ID!, reason: String): JobApplication!
withdrawJobApplication(id: ID!): JobApplication!
```

**New Input Types:**
- `CreateJobInput`: For creating jobs
- `UpdateJobInput`: For updating jobs
- `ApplyForJobInput`: For job applications

### Resolvers

**Query Resolvers** (`Backend/src/resolvers/Query.ts`)
- Implemented all job-related queries with proper authorization
- Teachers can view all jobs/applications in their class
- Students can view jobs and their own applications
- Field-level resolvers for nested data (job details in applications, student info)

**Mutation Resolvers** (`Backend/src/resolvers/Mutation.ts`)
- `createJob`: Creates job and notifies students
- `updateJob`: Updates job with validation
- `deleteJob`: Prevents deletion if active employments exist
- `applyForJob`: Validates student membership, prevents duplicate applications
- `approveJobApplication`: Creates employment, updates capacity, notifies student
- `rejectJobApplication`: Notifies student with optional reason
- `withdrawJobApplication`: Allows students to cancel pending applications

**Field Resolvers** (`Backend/src/resolvers/index.ts`)
- `JobApplication.job`: Fetches full job details
- `JobApplication.student`: Fetches applicant user info

### Notifications (`Backend/src/services/notifications.ts`)

New notification functions:
- `createJobPostedNotification()`: Notifies all students when job is posted
- `createJobApplicationNotification()`: Notifies teachers of new applications
- `createJobApprovalNotification()`: Notifies student of approval/rejection

## Frontend Implementation

### Pages Created

**1. JobManagementPage** (`Frontend/src/modules/jobs/JobManagementPage.tsx`)
- Teacher-only page
- Two tabs: Jobs and Applications
- Job cards showing title, description, salary, capacity, roles
- Application cards with student info and status
- Full application review dialog
- Inline edit/delete actions

**2. JobBoardPage** (`Frontend/src/modules/jobs/JobBoardPage.tsx`)
- Student-only page
- Two tabs: Available Jobs and My Applications
- Job cards showing details and apply button
- Application form dialog with required/optional fields
- Application tracking with status badges
- Withdraw functionality for pending applications

**3. CreateEditJobDialog** (`Frontend/src/modules/jobs/CreateEditJobDialog.tsx`)
- Reusable form for creating/editing jobs
- All job fields with validation
- Salary, period, capacity configuration
- Active/inactive toggle

**4. JobsRouter** (`Frontend/src/modules/jobs/JobsRouter.tsx`)
- Smart router component
- Routes teachers to JobManagementPage
- Routes students to JobBoardPage
- Single `/jobs` path for both roles

### GraphQL Operations

**Queries** (`Frontend/src/graphql/queries/jobs.ts`)
- `JOBS`: Fetch all jobs for a class
- `JOB`: Fetch single job details
- `JOB_APPLICATIONS`: Fetch applications with filters
- `JOB_APPLICATION`: Fetch single application
- `STUDENT_EMPLOYMENTS`: Fetch student's employments
- `JOB_EMPLOYMENTS`: Fetch employments for a job

**Mutations** (`Frontend/src/graphql/mutations/jobs.ts`)
- `CREATE_JOB`: Create new job
- `UPDATE_JOB`: Update existing job
- `DELETE_JOB`: Delete job
- `APPLY_FOR_JOB`: Submit job application
- `APPROVE_JOB_APPLICATION`: Approve and hire
- `REJECT_JOB_APPLICATION`: Reject with reason
- `WITHDRAW_JOB_APPLICATION`: Cancel application

### Navigation Updates

**TeacherLayout** (`Frontend/src/modules/layout/TeacherLayout.tsx`)
- Added "Jobs" nav item with Briefcase icon
- Routes to `/jobs` (smart router handles teacher redirection)

**StudentLayout** (`Frontend/src/modules/layout/StudentLayout.tsx`)
- Added "Job Board" nav item with Briefcase icon
- Routes to `/jobs` (smart router handles student view)

**Routes** (`Frontend/src/main.tsx`)
- Added `/jobs` route with JobsRouter component
- Single route handles both teacher and student views

## User Flows

### Teacher Flow: Post a Job
1. Navigate to Jobs page
2. Click "Create Job"
3. Fill in job details (title, description, roles, salary, period, capacity)
4. Submit → Job created and students notified
5. View job in Jobs tab

### Student Flow: Apply for Job
1. Navigate to Job Board
2. Browse available jobs
3. Click "Apply Now" on desired job
4. Fill in application (statement required, qualifications/availability optional)
5. Submit → Application sent and teachers notified
6. Track status in "My Applications" tab

### Teacher Flow: Review Application
1. Go to Applications tab (see pending count in badge)
2. Click on application card
3. Review application details, qualifications, availability
4. Click "Approve & Hire" → Creates employment, notifies student
5. Or click "Reject" → Provide optional reason, notifies student

### Student Flow: Check Application Status
1. Go to "My Applications" tab
2. See status badges (PENDING/APPROVED/REJECTED)
3. View details of each application
4. Withdraw pending applications if desired
5. See success message when approved

## Validation & Business Logic

### Job Creation
- Requires: title, salary, period
- Optional: description, roles/responsibilities
- Default capacity: 1
- Auto-active by default

### Job Application
- Students must be in the class
- Cannot apply to same job twice (if pending or approved)
- Cannot apply if already employed in that job
- Cannot apply to full jobs
- Application text is required

### Job Approval
- Checks job capacity before approving
- Creates Employment record automatically
- Updates job capacity count
- Marks application as APPROVED
- Sends success notification

### Job Deletion
- Prevents deletion if active employments exist
- Must end employments first

## Database Relationships

```
Job
 ├─ JobApplication (many)
 │   └─ Student (User)
 └─ Employment (many)
     └─ Student (User)

Class
 ├─ Job (many)
 ├─ JobApplication (many)
 └─ Employment (many)
```

## Testing Checklist

- [ ] Teacher can create job
- [ ] All students receive "New Job" notification
- [ ] Student can see job on board
- [ ] Student can apply with required fields
- [ ] Teacher receives "New Application" notification
- [ ] Cannot apply twice to same job
- [ ] Cannot apply to full job
- [ ] Teacher can view application details
- [ ] Teacher can approve application
- [ ] Approval creates Employment record
- [ ] Job capacity updates after approval
- [ ] Student receives "Approved" notification
- [ ] Teacher can reject with reason
- [ ] Student receives rejection notification with reason
- [ ] Student can withdraw pending application
- [ ] Teacher can edit job details
- [ ] Updated jobs reflect immediately
- [ ] Teacher can toggle job active/inactive
- [ ] Inactive jobs don't show on student board
- [ ] Cannot delete job with active employments
- [ ] Can delete job with no active employments

## Future Enhancements

1. **Employment Management**
   - End employment functionality
   - Employment history view
   - Performance tracking

2. **Advanced Features**
   - Job categories/tags
   - Search and filter jobs
   - Application deadlines
   - Interview scheduling
   - Job templates

3. **Analytics**
   - Application statistics
   - Popular jobs
   - Hire success rates
   - Student employment history

4. **Payroll Integration**
   - Automatic payroll creation based on job schedule
   - Salary calculations
   - Payment history

## Files Modified/Created

### Backend
- ✅ `Backend/src/models/Job.ts` - Added rolesResponsibilities
- ✅ `Backend/src/models/JobApplication.ts` - Added application fields
- ✅ `Backend/src/schema.ts` - Added queries, mutations, types
- ✅ `Backend/src/resolvers/Query.ts` - Job query resolvers
- ✅ `Backend/src/resolvers/Mutation.ts` - Job mutation resolvers
- ✅ `Backend/src/resolvers/index.ts` - Field resolvers
- ✅ `Backend/src/services/notifications.ts` - Job notifications

### Frontend
- ✅ `Frontend/src/graphql/queries/jobs.ts` - Job queries
- ✅ `Frontend/src/graphql/mutations/jobs.ts` - Job mutations
- ✅ `Frontend/src/modules/jobs/JobManagementPage.tsx` - Teacher page
- ✅ `Frontend/src/modules/jobs/JobBoardPage.tsx` - Student page
- ✅ `Frontend/src/modules/jobs/CreateEditJobDialog.tsx` - Job form
- ✅ `Frontend/src/modules/jobs/JobsRouter.tsx` - Smart router
- ✅ `Frontend/src/modules/layout/TeacherLayout.tsx` - Added nav link
- ✅ `Frontend/src/modules/layout/StudentLayout.tsx` - Added nav link
- ✅ `Frontend/src/main.tsx` - Added routes

## Notes

- The system uses the existing notification infrastructure
- Authorization checks ensure teachers can only manage their class jobs
- Students can only apply to jobs in classes they're members of
- Real-time updates via GraphQL subscriptions (existing infrastructure)
- UI follows existing ClassEcon design patterns
- Toast notifications provide user feedback
- The JobsRouter component provides clean role-based routing
