# ClassEcon Developer Documentation

**Version:** 2.0  
**Last Updated:** October 13, 2025  
**Platform:** Classroom Economy Management System

---

## 📑 Table of Contents

1. [Introduction](#introduction)
2. [Quick Start](#quick-start)
3. [Architecture Overview](#architecture-overview)
4. [Authentication System](#authentication-system)
5. [Core Features](#core-features)
6. [Development Guide](#development-guide)
7. [Testing Guide](#testing-guide)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [API Reference](#api-reference)
11. [Contributing](#contributing)
12. [Change Log](#change-log)

---

## 1. Introduction

### What is ClassEcon?

ClassEcon is a comprehensive classroom economy management platform that helps teachers create and manage classroom-based economies. Students earn virtual currency through jobs, can make purchases from a virtual store, and learn financial literacy concepts in a gamified environment.

### Key Features

- 👥 **User Management**: Support for Teachers, Students, and Parents
- 💼 **Job System**: Create jobs, handle applications, and manage employment
- 🏪 **Virtual Store**: Create and manage store items with inventory
- 💰 **Transaction System**: Complete financial tracking and reporting
- 📋 **Pay Requests**: Student work submission and approval workflow
- 🎒 **Backpack System**: Virtual inventory management
- 🔔 **Real-time Notifications**: WebSocket-based notification system
- 🔐 **Modern Authentication**: Email/password + OAuth (Google, Microsoft)
- 🎨 **Responsive UI**: Modern, dark-mode enabled interface

### Technology Stack

**Frontend:**
- React 18 with TypeScript
- Vite for build tooling
- Apollo Client for GraphQL
- Redux Toolkit for state management
- Tailwind CSS + shadcn/ui components
- React Hook Form for form management

**Backend:**
- Node.js with Express
- GraphQL with Apollo Server
- MongoDB with Mongoose
- WebSocket subscriptions for real-time updates

**Auth Service:**
- Express microservice
- JWT token management
- bcrypt for password hashing
- OAuth 2.0 integration (Google, Microsoft)

**Infrastructure:**
- Docker & Docker Compose
- MongoDB
- Environment-based configuration

---

## 2. Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- MongoDB (local or Docker)
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/andrewdangelo/ClassEcon.git
cd ClassEcon

# Install dependencies for all services
cd Backend && pnpm install
cd ../Frontend && pnpm install
cd ../AuthService && pnpm install
```

### Environment Setup

**Backend (.env):**
```env
MONGODB_URI=mongodb://localhost:27017/classecon
AUTH_SERVICE_URL=http://localhost:4001
SERVICE_API_KEY=<generate-32-byte-hex>
```

**AuthService (.env):**
```env
PORT=4001
JWT_SECRET=<generate-32-byte-hex>
REFRESH_JWT_SECRET=<generate-32-byte-hex>
SERVICE_API_KEY=<same-as-backend>

# Optional OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback/google

MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=http://localhost:5173/auth/callback/microsoft
```

**Frontend (.env):**
```env
VITE_GRAPHQL_URL=http://localhost:4000/graphql
VITE_AUTH_SERVICE_URL=http://localhost:4001

# Optional OAuth Client IDs
VITE_GOOGLE_CLIENT_ID=
VITE_MICROSOFT_CLIENT_ID=
```

### Running the Application

```bash
# Terminal 1 - Auth Service
cd AuthService
pnpm run dev

# Terminal 2 - Backend
cd Backend
pnpm run dev

# Terminal 3 - Frontend
cd Frontend
pnpm run dev
```

**Access URLs:**
- Frontend: http://localhost:5173
- Backend GraphQL: http://localhost:4000/graphql
- Auth Service: http://localhost:4001/health

### First-Time Setup

1. Navigate to http://localhost:5173/auth
2. Click "Sign Up"
3. Select "Teacher" role
4. Create your account
5. Complete onboarding to create your first class

---

## 3. Architecture Overview

### System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            ClassEcon Platform                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────┐        ┌──────────────┐        ┌──────────────┐       │
│  │  Frontend   │───────▶│   Backend    │───────▶│ Auth Service │       │
│  │  (React)    │◀───────│  (GraphQL)   │◀───────│  (Express)   │       │
│  │  Port 5173  │        │  Port 4000   │        │  Port 4001   │       │
│  └─────────────┘        └──────────────┘        └──────────────┘       │
│         │                       │                        │               │
│         │                       │                        │               │
│         ▼                       ▼                        ▼               │
│  ┌─────────────┐        ┌──────────────┐        ┌──────────────┐       │
│  │   Redux +   │        │   MongoDB    │        │ JWT Tokens   │       │
│  │   Apollo    │        │  Database    │        │   bcrypt     │       │
│  └─────────────┘        └──────────────┘        └──────────────┘       │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Microservices Architecture

**Frontend Service:**
- React SPA with client-side routing
- Apollo Client for GraphQL queries/mutations
- Redux for global state management
- WebSocket subscriptions for real-time updates

**Backend Service:**
- GraphQL API server
- Business logic and data validation
- MongoDB integration via Mongoose
- PubSub for real-time notifications
- Delegates authentication to Auth Service

**Auth Service:**
- Stateless authentication microservice
- JWT token generation and verification
- Password hashing with bcrypt
- OAuth 2.0 integration
- API key protection for service-to-service calls

### Data Flow

**User Authentication:**
```
User → Frontend → Backend GraphQL → Auth Service → JWT Tokens
                      ↓
                   MongoDB
```

**OAuth Authentication:**
```
User → OAuth Provider → Frontend → Backend → Auth Service → Provider API
                                      ↓
                                   MongoDB (create/find user)
```

**Real-time Notifications:**
```
Backend Event → PubSub → GraphQL Subscription → WebSocket → Frontend
```

---

## 4. Authentication System

### Overview

ClassEcon uses a modern microservices authentication architecture with:
- JWT-based token authentication (access + refresh tokens)
- OAuth 2.0 integration (Google, Microsoft)
- Service-to-service API key authentication
- HTTP-only cookies for refresh tokens
- Role-based access control (TEACHER, STUDENT, PARENT)

### Authentication Flow

**Traditional Login:**
1. User submits email/password to Frontend
2. Frontend calls `login` GraphQL mutation
3. Backend calls Auth Service to verify password
4. Auth Service validates and signs JWT tokens
5. Backend returns tokens to Frontend
6. Frontend stores access token in localStorage + Redux
7. Refresh token stored in HTTP-only cookie

**OAuth Login:**
1. User clicks OAuth button (Google/Microsoft)
2. Frontend redirects to OAuth provider
3. User authenticates with provider
4. Provider redirects back with authorization code
5. Frontend calls `oauthLogin` GraphQL mutation
6. Backend calls Auth Service with code
7. Auth Service exchanges code for user info
8. Backend creates/finds user in database
9. Backend generates JWT tokens
10. Frontend stores tokens and redirects to dashboard

### Token Management

**Access Token:**
- Lifetime: 15 minutes
- Storage: localStorage + Redux state
- Sent in Authorization header: `Bearer <token>`
- Payload: `{ sub: userId, role: Role, iat, exp }`

**Refresh Token:**
- Lifetime: 7 days
- Storage: HTTP-only cookie
- Used to obtain new access tokens
- Payload: `{ sub: userId, role: Role, iat, exp }`

**Token Refresh:**
```typescript
// Automatically refreshes when access token expires
const newAccessToken = await refreshAccessToken();
```

### OAuth Setup

See detailed guides:
- **Setup Guide:** `OAUTH_SETUP_GUIDE.md`
- **Quick Start:** `OAUTH_QUICK_START.md`
- **Implementation:** `OAUTH_IMPLEMENTATION_SUMMARY.md`

**Google OAuth Setup:**
1. Create project in Google Cloud Console
2. Enable OAuth 2.0
3. Configure consent screen
4. Add redirect URI: `http://localhost:5173/auth/callback/google`
5. Copy Client ID and Secret to `.env`

**Microsoft OAuth Setup:**
1. Register app in Azure Portal
2. Configure redirect URI: `http://localhost:5173/auth/callback/microsoft`
3. Add Microsoft Graph permissions
4. Copy Client ID and Secret to `.env`

### User Roles

**TEACHER:**
- Create and manage classes
- Create jobs and approve applications
- Manage store items
- Approve pay requests and redemptions
- View all students in their classes
- Access teacher dashboard

**STUDENT:**
- Join classes with join code
- Apply for jobs
- Submit pay requests
- Make purchases from store
- Request item redemptions
- View personal backpack

**PARENT:**
- View child's progress
- Monitor transactions
- Limited access to student data

### Protected Routes

```typescript
// Require authentication
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>

// Require specific role
<RequireTeacher>
  <StoreManage />
</RequireTeacher>

// Require class membership
<RequireClassGuard>
  <ClassOverview />
</RequireClassGuard>
```

### API Security

**Service-to-Service:**
- API key in `x-service-api-key` header
- Validates in Auth Service middleware
- Prevents unauthorized access to auth endpoints

**GraphQL Queries:**
- Context includes authenticated user
- Resolvers check permissions
- Field-level authorization

---

## 5. Core Features

### 5.1 Job System

**Overview:**
Teachers create jobs that students can apply for. Approved students earn regular salary payments based on the job's pay schedule.

**Key Components:**
- Job creation and management (teachers)
- Job application workflow (students)
- Automatic payroll processing
- Employment tracking

**Job Model:**
```typescript
interface Job {
  id: ID
  classId: ID
  title: string
  description: string
  salary: number // per pay period
  paySchedule: "DAILY" | "WEEKLY" | "BIWEEKLY" | "MONTHLY"
  slots: number // max employees
  isActive: boolean
  requirements: string[]
}
```

**Application States:**
- PENDING: Waiting for teacher review
- APPROVED: Student hired for job
- REJECTED: Application denied
- WITHDRAWN: Student cancelled application

**Payroll:**
```typescript
// Automatic salary payments based on schedule
// Runs via cron job or scheduled task
await processPayroll(classId);
```

**Teacher Actions:**
- Create/update/delete jobs
- Review applications
- Approve/reject applications
- Terminate employment
- Adjust salary

**Student Actions:**
- Browse available jobs
- Apply for jobs
- Withdraw applications
- View employment status
- Track earnings

**GraphQL Mutations:**
```graphql
# Teacher
createJob(input: CreateJobInput!): Job!
updateJob(id: ID!, input: UpdateJobInput!): Job!
deleteJob(id: ID!): Boolean!
approveJobApplication(id: ID!): JobApplication!
rejectJobApplication(id: ID!, reason: String): JobApplication!

# Student
applyForJob(input: ApplyForJobInput!): JobApplication!
withdrawJobApplication(id: ID!): JobApplication!
```

**See:** `JOB_SYSTEM_SUMMARY.md`, `JOB_SYSTEM_QUICK_START.md`

---

### 5.2 Store & Backpack System

**Overview:**
Teachers create virtual store items that students can purchase. Purchased items go into the student's backpack and can be redeemed in the real world.

**Store Item Model:**
```typescript
interface StoreItem {
  id: ID
  classId: ID
  title: string
  description: string
  price: number
  imageUrl?: string
  stock?: number // null = unlimited
  perStudentLimit?: number
  active: boolean
  sort: number
}
```

**Purchase Flow:**
1. Student adds items to cart
2. Student checks out (validates balance)
3. Transaction created (WITHDRAWAL)
4. Purchase records created
5. Items added to backpack
6. Inventory decremented

**Backpack System:**
- Virtual inventory for students
- Shows all purchased items
- Groups by item type
- Tracks redemption status
- Displays purchase history

**Redemption Flow:**
1. Student selects item from backpack
2. Creates redemption request with note
3. Teacher reviews request
4. Teacher approves or denies
5. Status updated in backpack

**Redemption States:**
- PENDING: Waiting for teacher
- APPROVED: Ready for physical redemption
- DENIED: Request rejected
- REDEEMED: Item given to student

**GraphQL Mutations:**
```graphql
# Teacher
createStoreItem(input: CreateStoreItemInput!): StoreItem!
updateStoreItem(id: ID!, input: UpdateStoreItemInput!): StoreItem!
deleteStoreItem(id: ID!): Boolean!
approveRedemption(id: ID!, teacherComment: String!): RedemptionRequest!
denyRedemption(id: ID!, teacherComment: String!): RedemptionRequest!

# Student
makePurchase(input: MakePurchaseInput!): [Purchase!]!
createRedemptionRequest(purchaseId: ID!, studentNote: String!): RedemptionRequest!
```

**See:** `BACKPACK_IMPLEMENTATION_GUIDE.md`, `BACKPACK_FRONTEND_SUMMARY.md`, `REDEMPTION_SYSTEM_IMPROVEMENTS.md`

---

### 5.3 Pay Request System

**Overview:**
Students submit pay requests to document work completed. Teachers review and approve/deny requests, issuing payments for approved work.

**Pay Request Model:**
```typescript
interface PayRequest {
  id: ID
  classId: ID
  studentId: ID
  classReasonId: ID // category of work
  amount: number // requested amount
  evidence: string // student's description
  status: PayRequestStatus
  submittedAt?: Date
  reviewedAt?: Date
  reviewerId?: ID
}
```

**Pay Request States:**
- DRAFT: Student is writing
- SUBMITTED: Waiting for teacher review
- REBUKE: Teacher sent back for changes
- APPROVED: Teacher approved and paid
- DENIED: Teacher rejected

**Workflow:**
1. **Student creates draft:**
   - Selects reason (homework, quiz, project, etc.)
   - Enters amount and evidence
   - Saves as draft

2. **Student submits:**
   - Reviews and finalizes
   - Submits for teacher review
   - Can no longer edit

3. **Teacher reviews:**
   - Views evidence and amount
   - Can add comments
   - Can rebuke (send back for changes)
   - Can deny with reason
   - Can approve with payment

4. **Payment processed:**
   - Transaction created (DEPOSIT)
   - Student balance updated
   - Payslip created
   - Notification sent

**Class Reasons:**
Teachers define categories for pay requests:
- Homework completion
- Quiz scores
- Project work
- Participation
- Extra credit
- Custom categories

**GraphQL Mutations:**
```graphql
createPayRequest(input: CreatePayRequestInput!): PayRequest!
submitPayRequest(id: ID!): PayRequest!
rebukePayRequest(id: ID!, comment: String!): PayRequest!
approvePayRequest(id: ID!, amount: Int!, comment: String): PayRequest!
denyPayRequest(id: ID!, comment: String!): PayRequest!
addPayRequestComment(payRequestId: ID!, content: String!): PayRequestComment!
```

**See:** `PURCHASE_AND_PAYMENT_FIXES.md`

---

### 5.4 Notification System

**Overview:**
Real-time notification system using GraphQL subscriptions over WebSockets. Notifies users of important events like approvals, payments, and system updates.

**Notification Types:**
- PAY_REQUEST_APPROVED: Payment approved
- PAY_REQUEST_DENIED: Payment denied
- PAY_REQUEST_REBUKE: Needs changes
- JOB_APPLICATION_APPROVED: Hired for job
- JOB_APPLICATION_REJECTED: Application denied
- REDEMPTION_APPROVED: Item ready to redeem
- REDEMPTION_DENIED: Redemption rejected
- PURCHASE_COMPLETE: Store purchase successful
- SALARY_PAID: Payroll processed
- SYSTEM: General announcements

**Notification Model:**
```typescript
interface Notification {
  id: ID
  userId: ID
  type: NotificationType
  title: string
  message: string
  link?: string
  isRead: boolean
  createdAt: Date
}
```

**Frontend Integration:**
```typescript
// Subscribe to notifications
const { data } = useSubscription(NOTIFICATION_SUBSCRIPTION, {
  variables: { userId }
});

// Display in UI
<NotificationBell notifications={notifications} />
```

**Backend Publishing:**
```typescript
// Publish notification
await pubsub.publish('NOTIFICATION', {
  notification: {
    userId: student._id,
    type: 'PAY_REQUEST_APPROVED',
    title: 'Payment Approved!',
    message: `Your request for $${amount} was approved.`,
    link: `/requests/${payRequestId}`
  }
});
```

**Features:**
- Real-time delivery via WebSocket
- Unread count badge
- Mark as read/unread
- Clear all notifications
- Click to navigate to related page
- Persistent storage in MongoDB

**See:** `NOTIFICATION_FIX_SUMMARY.md`, `NOTIFICATION_DEBUG_GUIDE.md`, `THEME_NOTIFICATION_SUMMARY.md`

---

### 5.5 Class Management

**Overview:**
Teachers create and manage classes. Students join classes using join codes. All economy activities are scoped to a class.

**Class Model:**
```typescript
interface Class {
  id: ID
  name: string
  teacherId: ID
  joinCode: string // 6-character unique code
  settings: {
    currency: string // e.g., "dollars", "tokens"
    overdraft: number // max negative balance
    transferAcrossClasses: boolean
  }
  isActive: boolean
}
```

**Teacher Actions:**
- Create new classes
- Update class settings
- Rotate join code (security)
- Archive/delete classes
- View class roster
- Manage class economy

**Student Actions:**
- Join class with code
- View class details
- See classmates
- Participate in class economy

**Membership:**
- Students can join multiple classes
- Each membership has separate balance
- Transactions scoped to class
- Jobs and store items per class

**GraphQL Mutations:**
```graphql
createClass(input: CreateClassInput!): Class!
updateClass(id: ID!, input: UpdateClassInput!): Class!
rotateJoinCode(id: ID!): Class!
deleteClass(id: ID!, hard: Boolean): Boolean!
joinClass(joinCode: String!): Class!
```

**Onboarding:**
New teachers are guided through:
1. Create first class
2. Configure currency and settings
3. Add class reasons
4. Create initial jobs (optional)
5. Add store items (optional)

**See:** `ONBOARDING_REDESIGN_SUMMARY.md`, `TEACHER_DASHBOARD_GUIDE.md`

---

### 5.6 Transaction System

**Overview:**
Complete financial tracking for all monetary activities in the classroom economy.

**Transaction Types:**
- DEPOSIT: Earnings (pay requests, salary)
- WITHDRAWAL: Purchases from store
- TRANSFER: Student-to-student transfers
- ADJUSTMENT: Teacher manual adjustments
- REFUND: Purchase refunds
- FINE: Penalties for behavior

**Transaction Model:**
```typescript
interface Transaction {
  id: ID
  accountId: ID // membership account
  type: TransactionType
  amount: number // positive or negative
  balanceBefore: number
  balanceAfter: number
  description: string
  metadata?: any
  createdAt: Date
}
```

**Balance Calculation:**
```typescript
// Atomic balance updates
const balance = await Account.findByIdAndUpdate(
  accountId,
  { $inc: { balance: amount } },
  { new: true }
);
```

**Transaction History:**
- View all transactions
- Filter by type, date range
- Sort by newest/oldest
- Export to CSV
- Detailed metadata

**Overdraft Protection:**
```typescript
// Check if student can afford purchase
if (balance - totalCost < -class.settings.overdraft) {
  throw new Error('Insufficient funds');
}
```

---

### 5.7 Dashboard & Reporting

**Teacher Dashboard:**
- Class overview statistics
- Recent activity feed
- Pending approvals
- Student balance distribution
- Top earners and spenders
- Job employment rates
- Store sales analytics

**Student Dashboard:**
- Current balance
- Active jobs and salary
- Recent transactions
- Available jobs to apply
- Featured store items
- Pending pay requests
- Backpack overview

**Reports:**
- Student financial summary
- Transaction history export
- Payroll records
- Store sales report
- Job employment report

**See:** `TEACHER_DASHBOARD_GUIDE.md`, `STUDENT_DETAIL_SUMMARY.md`, `DASHBOARD_ENHANCEMENTS.md`

---

## 6. Development Guide

### Project Structure

```
ClassEcon/
├── Frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── auth/        # Authentication components
│   │   │   ├── backpack/    # Backpack system
│   │   │   ├── notifications/ # Notification components
│   │   │   ├── profile/     # User profile
│   │   │   ├── sidebar/     # Navigation
│   │   │   └── ui/          # shadcn/ui components
│   │   ├── context/         # React contexts
│   │   ├── graphql/         # GraphQL operations
│   │   │   ├── mutations/   # GraphQL mutations
│   │   │   ├── queries/     # GraphQL queries
│   │   │   └── subscriptions/ # GraphQL subscriptions
│   │   ├── hooks/           # Custom React hooks
│   │   ├── modules/         # Feature modules
│   │   │   ├── classes/     # Class management
│   │   │   ├── dashboard/   # Dashboard views
│   │   │   ├── jobs/        # Job system
│   │   │   ├── store/       # Store and cart
│   │   │   ├── students/    # Student management
│   │   │   └── requests/    # Pay requests
│   │   ├── redux/           # Redux store
│   │   └── lib/             # Utilities
│   └── package.json
│
├── Backend/
│   ├── src/
│   │   ├── models/          # Mongoose models
│   │   ├── resolvers/       # GraphQL resolvers
│   │   ├── services/        # Business logic
│   │   │   ├── balance.ts   # Balance calculations
│   │   │   ├── notifications.ts # Notification service
│   │   │   ├── salary.ts    # Payroll processing
│   │   │   └── auth-client.ts # Auth Service client
│   │   ├── utils/           # Helper functions
│   │   ├── db/              # Database connection
│   │   ├── schema.ts        # GraphQL schema
│   │   └── index.ts         # Server entry point
│   └── package.json
│
├── AuthService/
│   ├── src/
│   │   ├── auth.ts          # JWT & bcrypt operations
│   │   ├── oauth.ts         # OAuth 2.0 integration
│   │   ├── routes.ts        # Express routes
│   │   ├── middleware.ts    # API key validation
│   │   ├── config.ts        # Environment config
│   │   └── index.ts         # Server entry point
│   └── package.json
│
└── Documentation files (.md)
```

### Code Style Guidelines

**TypeScript:**
- Use strict mode
- Prefer interfaces over types
- Use explicit return types for functions
- Avoid `any`, use `unknown` if needed

**React Components:**
- Functional components with hooks
- Props interface at top of file
- Extract complex logic to custom hooks
- Use descriptive component names

**GraphQL:**
- One query/mutation per file
- Include all required fields
- Use fragments for reusable field sets
- Document with comments

**Naming Conventions:**
- Components: PascalCase (`UserProfile`)
- Files: camelCase or PascalCase matching export
- Variables: camelCase (`userId`)
- Constants: UPPER_SNAKE_CASE (`MAX_SLOTS`)
- GraphQL: camelCase for fields, PascalCase for types

### Adding New Features

**1. Backend (GraphQL API):**

a. **Define Model** (`Backend/src/models/`)
```typescript
// NewFeature.ts
import { Schema, model, Types } from "mongoose";

export interface INewFeature {
  _id: Types.ObjectId;
  name: string;
  // ... fields
}

const NewFeatureSchema = new Schema<INewFeature>({
  name: { type: String, required: true },
  // ... fields
}, { timestamps: true });

export const NewFeature = model<INewFeature>("NewFeature", NewFeatureSchema);
```

b. **Update Schema** (`Backend/src/schema.ts`)
```graphql
type NewFeature {
  id: ID!
  name: String!
  # ... fields
}

type Query {
  newFeatures: [NewFeature!]!
}

type Mutation {
  createNewFeature(input: CreateNewFeatureInput!): NewFeature!
}
```

c. **Add Resolver** (`Backend/src/resolvers/`)
```typescript
// In Query.ts or Mutation.ts
async createNewFeature(_: any, { input }: any, ctx: Ctx) {
  requireAuth(ctx);
  
  const feature = await NewFeature.create({
    ...input,
    userId: ctx.user.id
  });
  
  return feature.toObject();
}
```

**2. Frontend (React):**

a. **Create GraphQL Operation** (`Frontend/src/graphql/mutations/`)
```typescript
// newFeature.ts
import { gql } from "@apollo/client";

export const CREATE_NEW_FEATURE = gql`
  mutation CreateNewFeature($input: CreateNewFeatureInput!) {
    createNewFeature(input: $input) {
      id
      name
    }
  }
`;
```

b. **Generate Types**
```bash
cd Frontend
pnpm run codegen
```

c. **Create Component** (`Frontend/src/modules/newFeature/`)
```tsx
// NewFeatureForm.tsx
import { useMutation } from "@apollo/client/react";
import { CREATE_NEW_FEATURE } from "@/graphql/mutations/newFeature";

export function NewFeatureForm() {
  const [create] = useMutation(CREATE_NEW_FEATURE);
  
  const handleSubmit = async (data) => {
    await create({ variables: { input: data } });
  };
  
  return <form onSubmit={handleSubmit}>...</form>;
}
```

**3. Testing:**
- Write unit tests for models and services
- Write integration tests for resolvers
- Test UI components with user interactions
- Verify GraphQL operations in Playground

### Database Migrations

**Adding Fields:**
```typescript
// Migration script
await User.updateMany(
  { newField: { $exists: false } },
  { $set: { newField: defaultValue } }
);
```

**Creating Indexes:**
```typescript
// In model file
UserSchema.index({ email: 1 }, { unique: true, sparse: true });
```

**Seeding Data:**
```bash
cd Backend
ts-node scripts/seed.ts
```

### Environment Variables

**Never commit:**
- API keys
- OAuth secrets
- JWT secrets
- Database credentials

**Use .env.example:**
- Create template files
- Document all required variables
- Provide example values

**Accessing in Code:**
```typescript
// Backend/AuthService
const secret = process.env.JWT_SECRET;
if (!secret) throw new Error('JWT_SECRET required');

// Frontend (Vite)
const apiUrl = import.meta.env.VITE_GRAPHQL_URL;
```

---

## 7. Testing Guide

### Unit Testing

**Backend Models:**
```typescript
// models/__tests__/User.test.ts
import { User } from '../User';

describe('User Model', () => {
  it('should create user', async () => {
    const user = await User.create({
      name: 'Test',
      email: 'test@test.com',
      role: 'STUDENT'
    });
    expect(user.name).toBe('Test');
  });
});
```

**Frontend Components:**
```typescript
// components/__tests__/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

test('renders button', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByText('Click me')).toBeInTheDocument();
});
```

### Integration Testing

**GraphQL Resolvers:**
```typescript
// Test mutation
const result = await apolloServer.executeOperation({
  query: LOGIN_MUTATION,
  variables: { email: 'test@test.com', password: 'password123' }
});

expect(result.data.login.accessToken).toBeDefined();
```

**Auth Service:**
```bash
# Test health endpoint
curl http://localhost:4001/health

# Test hash password
curl -X POST http://localhost:4001/hash-password \
  -H "Content-Type: application/json" \
  -H "x-service-api-key: YOUR_API_KEY" \
  -d '{"password":"test123"}'
```

### End-to-End Testing

**User Workflows:**
1. Teacher signup and class creation
2. Student joins class with code
3. Student applies for job
4. Teacher approves application
5. Student submits pay request
6. Teacher approves and pays
7. Student makes purchase
8. Student requests redemption
9. Teacher approves redemption

**Test Checklist:**
- [ ] User can sign up and login
- [ ] OAuth authentication works
- [ ] Teacher can create class
- [ ] Student can join with code
- [ ] Jobs can be created and applied to
- [ ] Pay requests workflow complete
- [ ] Store purchases work
- [ ] Backpack displays items
- [ ] Redemptions can be requested
- [ ] Notifications are sent
- [ ] Balance calculations correct
- [ ] Transactions recorded properly

### Performance Testing

**Load Testing:**
- Concurrent user sessions
- GraphQL query performance
- WebSocket connection limits
- Database query optimization

**Monitoring:**
- Response times
- Error rates
- Memory usage
- Database connection pool

**See:** `TESTING_GUIDE.md`

---

## 8. Deployment

### Production Checklist

**Security:**
- [ ] Change all default secrets
- [ ] Enable HTTPS
- [ ] Set secure cookie flags
- [ ] Implement rate limiting
- [ ] Add CORS restrictions
- [ ] Enable OAuth state parameter
- [ ] Set up monitoring and logging
- [ ] Implement backup strategy

**Environment:**
- [ ] Set NODE_ENV=production
- [ ] Use production database
- [ ] Update OAuth redirect URIs
- [ ] Configure CDN for static assets
- [ ] Set up error tracking (Sentry)
- [ ] Configure logging service

**Infrastructure:**
- [ ] Set up load balancer
- [ ] Configure auto-scaling
- [ ] Set up database replication
- [ ] Implement caching (Redis)
- [ ] Set up CI/CD pipeline
- [ ] Configure monitoring

### Docker Deployment

**Build Images:**
```bash
# Build all services
docker-compose build

# Start services
docker-compose up -d

# View logs
docker-compose logs -f
```

**docker-compose.yml:**
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  auth-service:
    build: ./AuthService
    ports:
      - "4001:4001"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb

  backend:
    build: ./Backend
    ports:
      - "4000:4000"
    environment:
      - NODE_ENV=production
    depends_on:
      - mongodb
      - auth-service

  frontend:
    build: ./Frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
```

### Cloud Deployment

**Vercel (Frontend):**
```bash
cd Frontend
vercel deploy --prod
```

**Heroku (Backend/Auth):**
```bash
cd Backend
heroku create classecon-backend
git push heroku main
```

**MongoDB Atlas:**
1. Create cluster
2. Configure network access
3. Create database user
4. Get connection string
5. Update MONGODB_URI

**Environment Variables:**
Set in hosting platform dashboard:
- Frontend: Vercel project settings
- Backend: Heroku config vars
- Database: MongoDB Atlas connection string

---

## 9. Troubleshooting

### Common Issues

**Services Won't Start:**
```bash
# Check if ports are in use
netstat -ano | findstr :4000
netstat -ano | findstr :4001
netstat -ano | findstr :5173

# Kill process if needed
taskkill /PID <PID> /F

# Verify environment variables
echo $AUTH_SERVICE_URL
echo $SERVICE_API_KEY
```

**Authentication Errors:**

**"Unauthorized: Invalid API key"**
- Cause: SERVICE_API_KEY mismatch
- Fix: Ensure Backend and AuthService have same key
- Verify: Both .env files have identical SERVICE_API_KEY

**"JWT token expired"**
- Cause: Access token lifetime exceeded
- Fix: Implement automatic token refresh
- Frontend: Call refreshAccessToken mutation

**"OAuth is not configured"**
- Cause: Missing OAuth credentials
- Fix: Add client ID and secret to AuthService/.env
- Restart Auth Service to load new variables

**Database Connection Issues:**

**"ECONNREFUSED"**
```bash
# Check if MongoDB is running
mongosh

# Start MongoDB
# Windows: net start MongoDB
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

**GraphQL Errors:**

**"Cannot query field on type"**
- Cause: Schema and resolvers mismatch
- Fix: Regenerate GraphQL types
```bash
cd Frontend
pnpm run codegen
```

**Frontend Build Errors:**

**"Module not found"**
```bash
# Clear cache and reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**WebSocket Connection Fails:**
- Check CORS configuration
- Verify WebSocket URL protocol (ws:// or wss://)
- Check firewall/proxy settings

**See:** `NOTIFICATION_DEBUG_GUIDE.md`, `ENUM_FORMAT_FIX.md`, `NULL_STOREITEM_FIX.md`

---

## 10. API Reference

### GraphQL Schema

**Full schema:** See `Backend/src/schema.ts`

**Key Types:**

```graphql
type User {
  id: ID!
  role: Role!
  name: String
  email: String
  oauthProvider: OAuthProvider
  profilePicture: String
}

type Class {
  id: ID!
  name: String!
  joinCode: String!
  teacherId: ID!
  settings: ClassroomSettings
}

type Job {
  id: ID!
  title: String!
  salary: Int!
  paySchedule: PaySchedule!
  slots: Int!
}

type StoreItem {
  id: ID!
  title: String!
  price: Int!
  stock: Int
  active: Boolean!
}

type PayRequest {
  id: ID!
  amount: Int!
  evidence: String!
  status: PayRequestStatus!
}
```

**Key Queries:**

```graphql
query {
  me { id name role email }
  classes { id name joinCode }
  class(id: ID!) { name students jobs storeItems }
  jobs(classId: ID!) { id title salary slots }
  storeItems(classId: ID!) { id title price stock }
  payRequests(classId: ID!, status: PayRequestStatus) { ... }
  notifications { id title message isRead }
}
```

**Key Mutations:**

```graphql
mutation {
  # Auth
  login(email: String!, password: String!): AuthPayload!
  signUp(input: SignUpInput!): AuthPayload!
  oauthLogin(provider: OAuthProvider!, code: String!): AuthPayload!
  
  # Classes
  createClass(input: CreateClassInput!): Class!
  joinClass(joinCode: String!): Class!
  
  # Jobs
  createJob(input: CreateJobInput!): Job!
  applyForJob(input: ApplyForJobInput!): JobApplication!
  approveJobApplication(id: ID!): JobApplication!
  
  # Store
  createStoreItem(input: CreateStoreItemInput!): StoreItem!
  makePurchase(input: MakePurchaseInput!): [Purchase!]!
  
  # Redemptions
  createRedemptionRequest(purchaseId: ID!, studentNote: String!): RedemptionRequest!
  approveRedemption(id: ID!, teacherComment: String!): RedemptionRequest!
  
  # Pay Requests
  createPayRequest(input: CreatePayRequestInput!): PayRequest!
  submitPayRequest(id: ID!): PayRequest!
  approvePayRequest(id: ID!, amount: Int!, comment: String): PayRequest!
}
```

**Subscriptions:**

```graphql
subscription {
  notification(userId: ID!) {
    id
    type
    title
    message
    link
    createdAt
  }
}
```

### Auth Service REST API

**Base URL:** `http://localhost:4001`

**Endpoints:**

```
GET  /health
POST /hash-password
POST /verify-password
POST /sign-tokens
POST /verify-access-token
POST /verify-refresh-token
POST /refresh
POST /logout
POST /oauth/google
POST /oauth/microsoft
```

**Example:**

```bash
# Hash a password
curl -X POST http://localhost:4001/hash-password \
  -H "Content-Type: application/json" \
  -H "x-service-api-key: YOUR_API_KEY" \
  -d '{"password":"mypassword"}'

# Response
{"hash":"$2a$12$..."}
```

**See:** `AUTH_QUICK_REFERENCE.md`, `ARCHITECTURE_DIAGRAMS.md`

---

## 11. Contributing

### Git Workflow

**Branches:**
- `main` - Production-ready code
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

**Commit Messages:**
```
feat: Add OAuth Microsoft integration
fix: Resolve notification WebSocket issue
docs: Update authentication guide
refactor: Extract balance calculation service
test: Add unit tests for Job model
```

**Pull Requests:**
1. Create feature branch from `develop`
2. Make changes and commit
3. Push branch and open PR
4. Request review
5. Address feedback
6. Merge when approved

### Code Review Checklist

- [ ] Code follows style guidelines
- [ ] All tests pass
- [ ] No console.log statements
- [ ] Error handling implemented
- [ ] Types properly defined
- [ ] GraphQL schema updated
- [ ] Documentation updated
- [ ] No secrets in code

### Reporting Issues

**Bug Reports:**
- Describe expected vs actual behavior
- Steps to reproduce
- Error messages and logs
- Environment (OS, Node version, etc.)
- Screenshots if applicable

**Feature Requests:**
- Clear description of feature
- Use cases and benefits
- Mockups or examples
- Implementation suggestions

---

## 12. Change Log

### Version 2.0 (October 2025)

**Major Changes:**
- ✅ Auth Service microservice extraction
- ✅ OAuth 2.0 integration (Google, Microsoft)
- ✅ Modern authentication UI with tabs
- ✅ Backpack and redemption system
- ✅ Real-time notifications via WebSocket
- ✅ Job system with payroll
- ✅ Enhanced store with inventory
- ✅ Teacher onboarding redesign
- ✅ Student detail page
- ✅ Theme improvements

**Documentation Added:**
- AUTH_ARCHITECTURE.md
- AUTH_MICROSERVICE_MIGRATION.md
- OAUTH_SETUP_GUIDE.md
- OAUTH_IMPLEMENTATION_SUMMARY.md
- ARCHITECTURE_DIAGRAMS.md
- JOB_SYSTEM_SUMMARY.md
- BACKPACK_IMPLEMENTATION_GUIDE.md

**Bug Fixes:**
- Fixed enum format inconsistencies
- Resolved null StoreItem crashes
- Fixed itemId compatibility issues
- Improved notification delivery
- Enhanced error handling

**See:** `CHANGES_SUMMARY.md`, `SESSION_2_SUMMARY.md`

---

### Version 1.0 (Initial Release)

**Core Features:**
- User authentication (email/password)
- Class creation and management
- Basic store functionality
- Pay request workflow
- Transaction tracking
- Teacher and student dashboards

---

## Additional Resources

### Documentation Files

For detailed information on specific topics, refer to:

**Authentication:**
- `AUTH_ARCHITECTURE.md` - Auth system design
- `AUTH_MICROSERVICE_MIGRATION.md` - Migration guide
- `AUTH_QUICK_REFERENCE.md` - Quick reference
- `AUTH_TESTING_GUIDE.md` - Testing procedures
- `OAUTH_SETUP_GUIDE.md` - OAuth provider setup
- `OAUTH_QUICK_START.md` - Quick testing guide
- `OAUTH_IMPLEMENTATION_SUMMARY.md` - Technical details
- `ARCHITECTURE_DIAGRAMS.md` - System diagrams

**Features:**
- `JOB_SYSTEM_SUMMARY.md` - Job system overview
- `JOB_SYSTEM_QUICK_START.md` - Quick setup guide
- `BACKPACK_IMPLEMENTATION_GUIDE.md` - Backpack system
- `BACKPACK_FRONTEND_SUMMARY.md` - UI components
- `REDEMPTION_SYSTEM_IMPROVEMENTS.md` - Redemption flow
- `NOTIFICATION_FIX_SUMMARY.md` - Notification system
- `TEACHER_DASHBOARD_GUIDE.md` - Teacher features
- `STUDENT_DETAIL_SUMMARY.md` - Student views

**Maintenance:**
- `TESTING_GUIDE.md` - Testing procedures
- `NOTIFICATION_DEBUG_GUIDE.md` - Debug notifications
- `PURCHASE_AND_PAYMENT_FIXES.md` - Payment fixes
- `ENUM_FORMAT_FIX.md` - Schema fixes
- `NULL_STOREITEM_FIX.md` - Bug fixes
- `ITEMID_COMPATIBILITY_FIX.md` - Migration fixes

### Support

**Issues:** https://github.com/andrewdangelo/ClassEcon/issues  
**Discussions:** https://github.com/andrewdangelo/ClassEcon/discussions  
**Email:** support@classecon.com

### License

This project is licensed under the MIT License.

---

**Last Updated:** October 13, 2025  
**Version:** 2.0  
**Maintained by:** ClassEcon Development Team
