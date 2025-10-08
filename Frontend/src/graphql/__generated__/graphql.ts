/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2007-12-03T10:15:30Z, compliant with the `date-time` format outlined in section 5.6 of the RFC 3339 profile of the ISO 8601 standard for representation of dates and times using the Gregorian calendar. */
  DateTime: { input: any; output: any; }
  /** The `JSON` scalar type represents JSON values as specified by [ECMA-404](http://www.ecma-international.org/publications/files/ECMA-ST/ECMA-404.pdf). */
  JSON: { input: any; output: any; }
};

export type Account = {
  __typename?: 'Account';
  balance: Scalars['Int']['output'];
  classId: Scalars['ID']['output'];
  classroomId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  studentId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type AuthPayload = {
  __typename?: 'AuthPayload';
  accessToken: Scalars['String']['output'];
  user: User;
};

export type Class = {
  __typename?: 'Class';
  classroomId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  defaultCurrency?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  district?: Maybe<Scalars['String']['output']>;
  gradeLevel?: Maybe<Scalars['Int']['output']>;
  id: Scalars['ID']['output'];
  isArchived: Scalars['Boolean']['output'];
  jobs: Array<Job>;
  joinCode: Scalars['String']['output'];
  name: Scalars['String']['output'];
  payPeriodDefault?: Maybe<PayPeriod>;
  payRequests: Array<PayRequest>;
  period?: Maybe<Scalars['String']['output']>;
  reasons: Array<ClassReason>;
  schoolName?: Maybe<Scalars['String']['output']>;
  slug?: Maybe<Scalars['String']['output']>;
  startingBalance?: Maybe<Scalars['Int']['output']>;
  status?: Maybe<Scalars['String']['output']>;
  storeItems: Array<StoreItem>;
  storeSettings?: Maybe<Scalars['JSON']['output']>;
  students: Array<Student>;
  subject?: Maybe<Scalars['String']['output']>;
  teacherIds: Array<Scalars['ID']['output']>;
  transactions: Array<Transaction>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ClassReason = {
  __typename?: 'ClassReason';
  classId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  label: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Classroom = {
  __typename?: 'Classroom';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  ownerId: Scalars['ID']['output'];
  settings?: Maybe<ClassroomSettings>;
  updatedAt: Scalars['DateTime']['output'];
};

export type ClassroomSettings = {
  __typename?: 'ClassroomSettings';
  currency?: Maybe<Scalars['String']['output']>;
  overdraft?: Maybe<Scalars['Int']['output']>;
  transferAcrossClasses?: Maybe<Scalars['Boolean']['output']>;
};

export type CreateClassInput = {
  classroomId?: InputMaybe<Scalars['ID']['input']>;
  defaultCurrency?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  district?: InputMaybe<Scalars['String']['input']>;
  gradeLevel?: InputMaybe<Scalars['Int']['input']>;
  jobs?: InputMaybe<Array<JobInput>>;
  name: Scalars['String']['input'];
  ownerId?: InputMaybe<Scalars['ID']['input']>;
  payPeriodDefault?: InputMaybe<PayPeriod>;
  period?: InputMaybe<Scalars['String']['input']>;
  reasons?: InputMaybe<Array<Scalars['String']['input']>>;
  schoolName?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  startingBalance?: InputMaybe<Scalars['Int']['input']>;
  storeItems?: InputMaybe<Array<StoreItemInput>>;
  storeSettings?: InputMaybe<Scalars['JSON']['input']>;
  students?: InputMaybe<Array<StudentInput>>;
  subject?: InputMaybe<Scalars['String']['input']>;
  teacherIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type CreatePayRequestInput = {
  amount: Scalars['Int']['input'];
  classId: Scalars['ID']['input'];
  justification: Scalars['String']['input'];
  reason: Scalars['String']['input'];
  studentId: Scalars['ID']['input'];
};

export type CreateStoreItemInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  classId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  perStudentLimit?: InputMaybe<Scalars['Int']['input']>;
  price: Scalars['Int']['input'];
  sort?: InputMaybe<Scalars['Int']['input']>;
  stock?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
};

export type Employment = {
  __typename?: 'Employment';
  classId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  endedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  jobId: Scalars['ID']['output'];
  lastPaidAt?: Maybe<Scalars['DateTime']['output']>;
  startedAt: Scalars['DateTime']['output'];
  status: EmploymentStatus;
  studentId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum EmploymentStatus {
  Active = 'ACTIVE',
  Ended = 'ENDED'
}

export type Job = {
  __typename?: 'Job';
  active: Scalars['Boolean']['output'];
  capacity: JobCapacity;
  classId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  period: PayPeriod;
  salary: JobSalary;
  schedule?: Maybe<JobSchedule>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type JobApplication = {
  __typename?: 'JobApplication';
  classId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  decidedAt?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['ID']['output'];
  jobId: Scalars['ID']['output'];
  status: JobApplicationStatus;
  studentId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export enum JobApplicationStatus {
  Approved = 'APPROVED',
  Pending = 'PENDING',
  Rejected = 'REJECTED',
  Withdrawn = 'WITHDRAWN'
}

export type JobCapacity = {
  __typename?: 'JobCapacity';
  current: Scalars['Int']['output'];
  max: Scalars['Int']['output'];
};

export type JobInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  payPeriod: PayPeriod;
  salary: Scalars['Int']['input'];
  schedule?: InputMaybe<JobScheduleInput>;
  slots?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
};

export type JobSalary = {
  __typename?: 'JobSalary';
  amount: Scalars['Int']['output'];
  unit: JobSalaryUnit;
};

export enum JobSalaryUnit {
  Fixed = 'FIXED',
  Hourly = 'HOURLY'
}

export type JobSchedule = {
  __typename?: 'JobSchedule';
  anchorDate?: Maybe<Scalars['DateTime']['output']>;
  dayOfMonth?: Maybe<Scalars['Int']['output']>;
  weekday?: Maybe<Scalars['Int']['output']>;
};

export type JobScheduleInput = {
  anchorDate?: InputMaybe<Scalars['DateTime']['input']>;
  dayOfMonth?: InputMaybe<Scalars['Int']['input']>;
  weekday?: InputMaybe<Scalars['Int']['input']>;
};

export type MakePurchaseInput = {
  classId: Scalars['ID']['input'];
  items: Array<PurchaseItemInput>;
};

export type Membership = {
  __typename?: 'Membership';
  classId?: Maybe<Array<Scalars['ID']['output']>>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  role: Role;
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addPayRequestComment: PayRequestComment;
  addReasons: Array<ClassReason>;
  approvePayRequest: PayRequest;
  createClass: Class;
  createPayRequest: PayRequest;
  createStoreItem: StoreItem;
  deleteClass: Scalars['Boolean']['output'];
  deleteStoreItem: Scalars['Boolean']['output'];
  denyPayRequest: PayRequest;
  joinClass: Class;
  login: AuthPayload;
  logout: Scalars['Boolean']['output'];
  makePurchase: Array<Purchase>;
  markAllNotificationsAsRead: Scalars['Boolean']['output'];
  markNotificationAsRead: Notification;
  rebukePayRequest: PayRequest;
  refreshAccessToken: Scalars['String']['output'];
  rotateJoinCode: Class;
  setReasons: Array<ClassReason>;
  signUp: AuthPayload;
  submitPayRequest: PayRequest;
  updateClass: Class;
  updateStoreItem: StoreItem;
};


export type MutationAddPayRequestCommentArgs = {
  content: Scalars['String']['input'];
  payRequestId: Scalars['ID']['input'];
};


export type MutationAddReasonsArgs = {
  classId: Scalars['ID']['input'];
  labels: Array<Scalars['String']['input']>;
};


export type MutationApprovePayRequestArgs = {
  amount: Scalars['Int']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};


export type MutationCreateClassArgs = {
  input: CreateClassInput;
};


export type MutationCreatePayRequestArgs = {
  input: CreatePayRequestInput;
};


export type MutationCreateStoreItemArgs = {
  input: CreateStoreItemInput;
};


export type MutationDeleteClassArgs = {
  hard?: InputMaybe<Scalars['Boolean']['input']>;
  id: Scalars['ID']['input'];
};


export type MutationDeleteStoreItemArgs = {
  id: Scalars['ID']['input'];
};


export type MutationDenyPayRequestArgs = {
  comment: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};


export type MutationJoinClassArgs = {
  joinCode: Scalars['String']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationMakePurchaseArgs = {
  input: MakePurchaseInput;
};


export type MutationMarkNotificationAsReadArgs = {
  id: Scalars['ID']['input'];
};


export type MutationRebukePayRequestArgs = {
  comment: Scalars['String']['input'];
  id: Scalars['ID']['input'];
};


export type MutationRotateJoinCodeArgs = {
  id: Scalars['ID']['input'];
};


export type MutationSetReasonsArgs = {
  classId: Scalars['ID']['input'];
  labels: Array<Scalars['String']['input']>;
};


export type MutationSignUpArgs = {
  input: SignUpInput;
};


export type MutationSubmitPayRequestArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateClassArgs = {
  id: Scalars['ID']['input'];
  input: UpdateClassInput;
};


export type MutationUpdateStoreItemArgs = {
  id: Scalars['ID']['input'];
  input: UpdateStoreItemInput;
};

export type Notification = {
  __typename?: 'Notification';
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  isRead: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  relatedId?: Maybe<Scalars['ID']['output']>;
  relatedType?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  type: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export enum PayPeriod {
  Biweekly = 'BIWEEKLY',
  Monthly = 'MONTHLY',
  Semester = 'SEMESTER',
  Weekly = 'WEEKLY'
}

export type PayRequest = {
  __typename?: 'PayRequest';
  amount: Scalars['Int']['output'];
  class: Class;
  classId: Scalars['ID']['output'];
  comments: Array<PayRequestComment>;
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  justification: Scalars['String']['output'];
  reason: Scalars['String']['output'];
  status: PayRequestStatus;
  student: User;
  studentId: Scalars['ID']['output'];
  teacherComment?: Maybe<Scalars['String']['output']>;
  updatedAt: Scalars['DateTime']['output'];
};

export type PayRequestComment = {
  __typename?: 'PayRequestComment';
  content: Scalars['String']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  payRequestId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
  userId: Scalars['ID']['output'];
};

export enum PayRequestStatus {
  Approved = 'APPROVED',
  Denied = 'DENIED',
  Paid = 'PAID',
  Rebuked = 'REBUKED',
  Submitted = 'SUBMITTED'
}

export type Payslip = {
  __typename?: 'Payslip';
  classId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  employmentId: Scalars['ID']['output'];
  gross: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  jobId: Scalars['ID']['output'];
  periodEnd: Scalars['DateTime']['output'];
  periodStart: Scalars['DateTime']['output'];
  postedTxId?: Maybe<Scalars['ID']['output']>;
  studentId: Scalars['ID']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type Purchase = {
  __typename?: 'Purchase';
  accountId: Scalars['ID']['output'];
  classId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  quantity: Scalars['Int']['output'];
  storeItemId: Scalars['ID']['output'];
  studentId: Scalars['ID']['output'];
  total: Scalars['Int']['output'];
  unitPrice: Scalars['Int']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type PurchaseItemInput = {
  quantity: Scalars['Int']['input'];
  storeItemId: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  account?: Maybe<Account>;
  class?: Maybe<Class>;
  classes: Array<Class>;
  classesByUser: Array<Class>;
  classroom?: Maybe<Classroom>;
  classrooms: Array<Classroom>;
  me?: Maybe<User>;
  membershipsByClass: Array<Membership>;
  myClasses: Array<Class>;
  notifications: Array<Notification>;
  payRequest?: Maybe<PayRequest>;
  payRequestComments: Array<PayRequestComment>;
  payRequestsByClass: Array<PayRequest>;
  payRequestsByStudent: Array<PayRequest>;
  reasonsByClass: Array<ClassReason>;
  storeItemsByClass: Array<StoreItem>;
  students: StudentsResult;
  studentsByClass: Array<Student>;
  studentsByTeacher: Array<Student>;
  transactionsByAccount: Array<Transaction>;
  unreadNotificationCount: Scalars['Int']['output'];
};


export type QueryAccountArgs = {
  classId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};


export type QueryClassArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryClassesArgs = {
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryClassesByUserArgs = {
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Role>;
  userId: Scalars['ID']['input'];
};


export type QueryClassroomArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMembershipsByClassArgs = {
  classId: Scalars['ID']['input'];
  role?: InputMaybe<Role>;
};


export type QueryMyClassesArgs = {
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
  role?: InputMaybe<Role>;
};


export type QueryNotificationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};


export type QueryPayRequestArgs = {
  id: Scalars['ID']['input'];
};


export type QueryPayRequestCommentsArgs = {
  payRequestId: Scalars['ID']['input'];
};


export type QueryPayRequestsByClassArgs = {
  classId: Scalars['ID']['input'];
  status?: InputMaybe<PayRequestStatus>;
};


export type QueryPayRequestsByStudentArgs = {
  classId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};


export type QueryReasonsByClassArgs = {
  classId: Scalars['ID']['input'];
};


export type QueryStoreItemsByClassArgs = {
  classId: Scalars['ID']['input'];
};


export type QueryStudentsArgs = {
  filter?: InputMaybe<StudentsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryStudentsByClassArgs = {
  classId: Scalars['ID']['input'];
};


export type QueryTransactionsByAccountArgs = {
  accountId: Scalars['ID']['input'];
};

export enum Role {
  Parent = 'PARENT',
  Student = 'STUDENT',
  Teacher = 'TEACHER'
}

export type SignUpInput = {
  email: Scalars['String']['input'];
  joinCode?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  password: Scalars['String']['input'];
  role: Role;
};

export type StoreItem = {
  __typename?: 'StoreItem';
  active: Scalars['Boolean']['output'];
  classId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  imageUrl?: Maybe<Scalars['String']['output']>;
  perStudentLimit?: Maybe<Scalars['Int']['output']>;
  price: Scalars['Int']['output'];
  sort?: Maybe<Scalars['Int']['output']>;
  stock?: Maybe<Scalars['Int']['output']>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type StoreItemInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  perStudentLimit?: InputMaybe<Scalars['Int']['input']>;
  price: Scalars['Int']['input'];
  sort?: InputMaybe<Scalars['Int']['input']>;
  stock?: InputMaybe<Scalars['Int']['input']>;
  title: Scalars['String']['input'];
};

export type Student = {
  __typename?: 'Student';
  balance: Scalars['Int']['output'];
  class: Class;
  classId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  requests: Array<PayRequest>;
  txns: Array<Transaction>;
};

export type StudentInput = {
  name?: InputMaybe<Scalars['String']['input']>;
  userId?: InputMaybe<Scalars['ID']['input']>;
};

export type StudentsFilter = {
  classId?: InputMaybe<Scalars['ID']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<UserStatus>;
};

export type StudentsResult = {
  __typename?: 'StudentsResult';
  nodes: Array<User>;
  totalCount: Scalars['Int']['output'];
};

export type Subscription = {
  __typename?: 'Subscription';
  notificationReceived: Notification;
  payRequestCommentAdded: PayRequestComment;
  payRequestCreated: PayRequest;
  payRequestStatusChanged: PayRequest;
  payRequestUpdated: PayRequest;
};


export type SubscriptionNotificationReceivedArgs = {
  userId: Scalars['ID']['input'];
};


export type SubscriptionPayRequestCommentAddedArgs = {
  payRequestId: Scalars['ID']['input'];
};


export type SubscriptionPayRequestCreatedArgs = {
  classId: Scalars['ID']['input'];
};


export type SubscriptionPayRequestStatusChangedArgs = {
  classId: Scalars['ID']['input'];
};


export type SubscriptionPayRequestUpdatedArgs = {
  classId: Scalars['ID']['input'];
};

export type Transaction = {
  __typename?: 'Transaction';
  accountId: Scalars['ID']['output'];
  amount: Scalars['Int']['output'];
  classId: Scalars['ID']['output'];
  classroomId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  createdByUserId: Scalars['ID']['output'];
  id: Scalars['ID']['output'];
  idempotencyKey?: Maybe<Scalars['String']['output']>;
  memo?: Maybe<Scalars['String']['output']>;
  toAccountId?: Maybe<Scalars['ID']['output']>;
  type: TransactionType;
  updatedAt: Scalars['DateTime']['output'];
};

export enum TransactionType {
  Adjustment = 'ADJUSTMENT',
  Deposit = 'DEPOSIT',
  Fine = 'FINE',
  Payroll = 'PAYROLL',
  Purchase = 'PURCHASE',
  Refund = 'REFUND',
  Transfer = 'TRANSFER',
  Withdrawal = 'WITHDRAWAL'
}

export type UpdateClassInput = {
  defaultCurrency?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  district?: InputMaybe<Scalars['String']['input']>;
  gradeLevel?: InputMaybe<Scalars['Int']['input']>;
  isArchived?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  payPeriodDefault?: InputMaybe<PayPeriod>;
  period?: InputMaybe<Scalars['String']['input']>;
  schoolName?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  startingBalance?: InputMaybe<Scalars['Int']['input']>;
  status?: InputMaybe<Scalars['String']['input']>;
  storeSettings?: InputMaybe<Scalars['JSON']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
  teacherIds?: InputMaybe<Array<Scalars['ID']['input']>>;
};

export type UpdateStoreItemInput = {
  active?: InputMaybe<Scalars['Boolean']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrl?: InputMaybe<Scalars['String']['input']>;
  perStudentLimit?: InputMaybe<Scalars['Int']['input']>;
  price?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<Scalars['Int']['input']>;
  stock?: InputMaybe<Scalars['Int']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['DateTime']['output'];
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  role: Role;
  status: UserStatus;
  updatedAt: Scalars['DateTime']['output'];
};

export enum UserStatus {
  Active = 'ACTIVE',
  Disabled = 'DISABLED',
  Invited = 'INVITED'
}

export type UserCoreFragment = { __typename?: 'User', id: string, name: string, email?: string | null, role: Role, status: UserStatus, createdAt: any, updatedAt: any } & { ' $fragmentName'?: 'UserCoreFragment' };

export type ClassCoreFragment = { __typename?: 'Class', id: string, classroomId: string, slug?: string | null, name: string, subject?: string | null, period?: string | null, gradeLevel?: number | null, joinCode: string, schoolName?: string | null, district?: string | null, payPeriodDefault?: PayPeriod | null, startingBalance?: number | null, teacherIds: Array<string>, defaultCurrency?: string | null, isArchived: boolean, createdAt: any, updatedAt: any } & { ' $fragmentName'?: 'ClassCoreFragment' };

export type StudentDtoCoreFragment = { __typename?: 'Student', id: string, name: string, balance: number, classId: string } & { ' $fragmentName'?: 'StudentDtoCoreFragment' };

export type StoreItemCoreFragment = { __typename?: 'StoreItem', id: string, classId: string, title: string, price: number, description?: string | null, imageUrl?: string | null, stock?: number | null, perStudentLimit?: number | null, active: boolean, sort?: number | null, createdAt: any, updatedAt: any } & { ' $fragmentName'?: 'StoreItemCoreFragment' };

export type JobCoreFragment = { __typename?: 'Job', id: string, classId: string, title: string, description?: string | null, period: PayPeriod, active: boolean, createdAt: any, updatedAt: any, salary: { __typename?: 'JobSalary', amount: number, unit: JobSalaryUnit }, schedule?: { __typename?: 'JobSchedule', weekday?: number | null, dayOfMonth?: number | null, anchorDate?: any | null } | null, capacity: { __typename?: 'JobCapacity', current: number, max: number } } & { ' $fragmentName'?: 'JobCoreFragment' };

export type TransactionCoreFragment = { __typename?: 'Transaction', id: string, accountId: string, toAccountId?: string | null, classId: string, classroomId: string, type: TransactionType, amount: number, memo?: string | null, createdByUserId: string, idempotencyKey?: string | null, createdAt: any, updatedAt: any } & { ' $fragmentName'?: 'TransactionCoreFragment' };

export type AccountWithBalanceFragment = { __typename?: 'Account', id: string, studentId: string, classId: string, classroomId: string, balance: number, createdAt: any, updatedAt: any } & { ' $fragmentName'?: 'AccountWithBalanceFragment' };

export type PayRequestCoreFragment = { __typename?: 'PayRequest', id: string, classId: string, studentId: string, amount: number, reason: string, justification: string, status: PayRequestStatus, teacherComment?: string | null, createdAt: any, updatedAt: any } & { ' $fragmentName'?: 'PayRequestCoreFragment' };

export type ClassReasonCoreFragment = { __typename?: 'ClassReason', id: string, label: string, classId: string, createdAt: any, updatedAt: any } & { ' $fragmentName'?: 'ClassReasonCoreFragment' };

export type LoginMutationVariables = Exact<{
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
}>;


export type LoginMutation = { __typename?: 'Mutation', login: { __typename?: 'AuthPayload', accessToken: string, user: { __typename?: 'User', id: string, name: string, email?: string | null, role: Role } } };

export type SignUpMutationVariables = Exact<{
  input: SignUpInput;
}>;


export type SignUpMutation = { __typename?: 'Mutation', signUp: { __typename?: 'AuthPayload', accessToken: string, user: { __typename?: 'User', id: string, name: string, email?: string | null, role: Role } } };

export type LogoutMutationVariables = Exact<{ [key: string]: never; }>;


export type LogoutMutation = { __typename?: 'Mutation', logout: boolean };

export type RefreshAccessTokenMutationVariables = Exact<{ [key: string]: never; }>;


export type RefreshAccessTokenMutation = { __typename?: 'Mutation', refreshAccessToken: string };

export type CreateClassMutationVariables = Exact<{
  input: CreateClassInput;
}>;


export type CreateClassMutation = { __typename?: 'Mutation', createClass: { __typename?: 'Class', id: string, name: string, subject?: string | null, period?: string | null, gradeLevel?: number | null, joinCode: string, defaultCurrency?: string | null, students: Array<{ __typename?: 'Student', id: string, name: string, classId: string, balance: number }> } };

export type UpdateClassMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateClassInput;
}>;


export type UpdateClassMutation = { __typename?: 'Mutation', updateClass: { __typename?: 'Class', id: string, name: string, subject?: string | null, period?: string | null, gradeLevel?: number | null, joinCode: string, defaultCurrency?: string | null, isArchived: boolean, updatedAt: any } };

export type RotateJoinCodeMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type RotateJoinCodeMutation = { __typename?: 'Mutation', rotateJoinCode: { __typename?: 'Class', id: string, joinCode: string } };

export type DeleteClassMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  hard?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type DeleteClassMutation = { __typename?: 'Mutation', deleteClass: boolean };

export type JoinClassMutationVariables = Exact<{
  joinCode: Scalars['String']['input'];
}>;


export type JoinClassMutation = { __typename?: 'Mutation', joinClass: { __typename?: 'Class', id: string, name: string, subject?: string | null, period?: string | null, gradeLevel?: number | null, defaultCurrency?: string | null, joinCode: string } };

export type CreatePayRequestMutationVariables = Exact<{
  input: CreatePayRequestInput;
}>;


export type CreatePayRequestMutation = { __typename?: 'Mutation', createPayRequest: { __typename?: 'PayRequest', id: string, status: PayRequestStatus, amount: number, reason: string, justification: string, createdAt: any } };

export type ApprovePayRequestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  amount: Scalars['Int']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
}>;


export type ApprovePayRequestMutation = { __typename?: 'Mutation', approvePayRequest: { __typename?: 'PayRequest', id: string, status: PayRequestStatus, amount: number, teacherComment?: string | null } };

export type SubmitPayRequestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type SubmitPayRequestMutation = { __typename?: 'Mutation', submitPayRequest: { __typename?: 'PayRequest', id: string, status: PayRequestStatus } };

export type RebukePayRequestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  comment: Scalars['String']['input'];
}>;


export type RebukePayRequestMutation = { __typename?: 'Mutation', rebukePayRequest: { __typename?: 'PayRequest', id: string, status: PayRequestStatus, teacherComment?: string | null } };

export type DenyPayRequestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  comment: Scalars['String']['input'];
}>;


export type DenyPayRequestMutation = { __typename?: 'Mutation', denyPayRequest: { __typename?: 'PayRequest', id: string, status: PayRequestStatus, teacherComment?: string | null } };

export type AddPayRequestCommentMutationVariables = Exact<{
  payRequestId: Scalars['ID']['input'];
  content: Scalars['String']['input'];
}>;


export type AddPayRequestCommentMutation = { __typename?: 'Mutation', addPayRequestComment: { __typename?: 'PayRequestComment', id: string, content: string, createdAt: any, user: { __typename?: 'User', id: string, name: string } } };

export type CreateStoreItemMutationVariables = Exact<{
  input: CreateStoreItemInput;
}>;


export type CreateStoreItemMutation = { __typename?: 'Mutation', createStoreItem: { __typename?: 'StoreItem', id: string, title: string, price: number, description?: string | null, imageUrl?: string | null, stock?: number | null, perStudentLimit?: number | null, active: boolean, sort?: number | null } };

export type UpdateStoreItemMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateStoreItemInput;
}>;


export type UpdateStoreItemMutation = { __typename?: 'Mutation', updateStoreItem: { __typename?: 'StoreItem', id: string, title: string, price: number, description?: string | null, imageUrl?: string | null, stock?: number | null, perStudentLimit?: number | null, active: boolean, sort?: number | null } };

export type DeleteStoreItemMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteStoreItemMutation = { __typename?: 'Mutation', deleteStoreItem: boolean };

export type MakePurchaseMutationVariables = Exact<{
  input: MakePurchaseInput;
}>;


export type MakePurchaseMutation = { __typename?: 'Mutation', makePurchase: Array<{ __typename?: 'Purchase', id: string, quantity: number, unitPrice: number, total: number, createdAt: any }> };

export type AccountQueryVariables = Exact<{
  studentId: Scalars['ID']['input'];
  classId: Scalars['ID']['input'];
}>;


export type AccountQuery = { __typename?: 'Query', account?: { __typename?: 'Account', id: string, studentId: string, classId: string, balance: number } | null };

export type TransactionsByAccountQueryVariables = Exact<{
  accountId: Scalars['ID']['input'];
}>;


export type TransactionsByAccountQuery = { __typename?: 'Query', transactionsByAccount: Array<{ __typename?: 'Transaction', id: string, type: TransactionType, amount: number, memo?: string | null, createdAt: any }> };

export type GetClassesQueryVariables = Exact<{
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetClassesQuery = { __typename?: 'Query', classes: Array<{ __typename?: 'Class', id: string, name: string, subject?: string | null, period?: string | null, gradeLevel?: number | null, joinCode: string, defaultCurrency?: string | null, isArchived: boolean, createdAt: any, updatedAt: any }> };

export type GetClassByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetClassByIdQuery = { __typename?: 'Query', class?: { __typename?: 'Class', id: string, name: string, subject?: string | null, period?: string | null, gradeLevel?: number | null, joinCode: string, schoolName?: string | null, district?: string | null, payPeriodDefault?: PayPeriod | null, startingBalance?: number | null, teacherIds: Array<string>, defaultCurrency?: string | null, isArchived: boolean, createdAt: any, updatedAt: any, students: Array<{ __typename?: 'Student', id: string, name: string, classId: string, balance: number }>, storeItems: Array<{ __typename?: 'StoreItem', id: string, title: string, price: number, description?: string | null, imageUrl?: string | null, stock?: number | null, perStudentLimit?: number | null, active: boolean, sort?: number | null }>, jobs: Array<{ __typename?: 'Job', id: string, title: string, description?: string | null, period: PayPeriod, active: boolean, salary: { __typename?: 'JobSalary', amount: number, unit: JobSalaryUnit }, capacity: { __typename?: 'JobCapacity', current: number, max: number } }>, transactions: Array<{ __typename?: 'Transaction', id: string, type: TransactionType, amount: number, memo?: string | null, createdAt: any }>, payRequests: Array<{ __typename?: 'PayRequest', id: string, amount: number, reason: string, justification: string, status: PayRequestStatus, teacherComment?: string | null, createdAt: any }>, reasons: Array<{ __typename?: 'ClassReason', id: string, label: string }> } | null };

export type GetClassBySlugQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type GetClassBySlugQuery = { __typename?: 'Query', class?: { __typename?: 'Class', id: string, name: string, subject?: string | null, period?: string | null, gradeLevel?: number | null, joinCode: string, defaultCurrency?: string | null, isArchived: boolean } | null };

export type ClassesByUserQueryVariables = Exact<{
  userId: Scalars['ID']['input'];
  role?: InputMaybe<Role>;
  includeArchived?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type ClassesByUserQuery = { __typename?: 'Query', classesByUser: Array<{ __typename?: 'Class', id: string, name: string, subject?: string | null, period?: string | null, defaultCurrency?: string | null, isArchived: boolean }> };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, name: string, email?: string | null, role: Role } | null };

export type GetNotificationsQueryVariables = Exact<{
  userId?: InputMaybe<Scalars['ID']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  unreadOnly?: InputMaybe<Scalars['Boolean']['input']>;
}>;


export type GetNotificationsQuery = { __typename?: 'Query', notifications: Array<{ __typename?: 'Notification', id: string, userId: string, type: string, title: string, message: string, relatedId?: string | null, relatedType?: string | null, isRead: boolean, createdAt: any, updatedAt: any }> };

export type GetUnreadNotificationCountQueryVariables = Exact<{ [key: string]: never; }>;


export type GetUnreadNotificationCountQuery = { __typename?: 'Query', unreadNotificationCount: number };

export type MarkNotificationAsReadMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type MarkNotificationAsReadMutation = { __typename?: 'Mutation', markNotificationAsRead: { __typename?: 'Notification', id: string, isRead: boolean } };

export type MarkAllNotificationsAsReadMutationVariables = Exact<{ [key: string]: never; }>;


export type MarkAllNotificationsAsReadMutation = { __typename?: 'Mutation', markAllNotificationsAsRead: boolean };

export type ReasonsByClassQueryVariables = Exact<{
  classId: Scalars['ID']['input'];
}>;


export type ReasonsByClassQuery = { __typename?: 'Query', reasonsByClass: Array<{ __typename?: 'ClassReason', id: string, label: string }> };

export type AddReasonsMutationVariables = Exact<{
  classId: Scalars['ID']['input'];
  labels: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type AddReasonsMutation = { __typename?: 'Mutation', addReasons: Array<{ __typename?: 'ClassReason', id: string, label: string }> };

export type SetReasonsMutationVariables = Exact<{
  classId: Scalars['ID']['input'];
  labels: Array<Scalars['String']['input']> | Scalars['String']['input'];
}>;


export type SetReasonsMutation = { __typename?: 'Mutation', setReasons: Array<{ __typename?: 'ClassReason', id: string, label: string }> };

export type PayRequestsByStudentQueryVariables = Exact<{
  classId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
}>;


export type PayRequestsByStudentQuery = { __typename?: 'Query', payRequestsByStudent: Array<{ __typename?: 'PayRequest', id: string, amount: number, reason: string, justification: string, status: PayRequestStatus, teacherComment?: string | null, createdAt: any, comments: Array<{ __typename?: 'PayRequestComment', id: string, content: string, createdAt: any, user: { __typename?: 'User', id: string, name: string } }> }> };

export type PayRequestsByClassQueryVariables = Exact<{
  classId: Scalars['ID']['input'];
  status?: InputMaybe<PayRequestStatus>;
}>;


export type PayRequestsByClassQuery = { __typename?: 'Query', payRequestsByClass: Array<{ __typename?: 'PayRequest', id: string, amount: number, reason: string, justification: string, status: PayRequestStatus, teacherComment?: string | null, createdAt: any, student: { __typename?: 'User', id: string, name: string }, comments: Array<{ __typename?: 'PayRequestComment', id: string, content: string, createdAt: any, user: { __typename?: 'User', id: string, name: string } }> }> };

export type StoreItemsByClassQueryVariables = Exact<{
  classId: Scalars['ID']['input'];
}>;


export type StoreItemsByClassQuery = { __typename?: 'Query', storeItemsByClass: Array<{ __typename?: 'StoreItem', id: string, title: string, price: number, description?: string | null, imageUrl?: string | null, stock?: number | null, perStudentLimit?: number | null, active: boolean, sort?: number | null }> };

export type StudentsByClassQueryVariables = Exact<{
  classId: Scalars['ID']['input'];
}>;


export type StudentsByClassQuery = { __typename?: 'Query', studentsByClass: Array<{ __typename?: 'Student', id: string, name: string, classId: string, balance: number }> };

export type StudentsDirectoryQueryVariables = Exact<{
  filter?: InputMaybe<StudentsFilter>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
}>;


export type StudentsDirectoryQuery = { __typename?: 'Query', students: { __typename?: 'StudentsResult', totalCount: number, nodes: Array<{ __typename?: 'User', id: string, name: string, email?: string | null, role: Role, status: UserStatus, createdAt: any, updatedAt: any }> } };

export type StudentsByTeacherQueryVariables = Exact<{ [key: string]: never; }>;


export type StudentsByTeacherQuery = { __typename?: 'Query', studentsByTeacher: Array<{ __typename?: 'Student', id: string, name: string, balance: number, classId: string, class: { __typename?: 'Class', id: string, name: string, subject?: string | null, period?: string | null } }> };

export type NotificationReceivedSubscriptionVariables = Exact<{
  userId: Scalars['ID']['input'];
}>;


export type NotificationReceivedSubscription = { __typename?: 'Subscription', notificationReceived: { __typename?: 'Notification', id: string, userId: string, type: string, title: string, message: string, relatedId?: string | null, relatedType?: string | null, isRead: boolean, createdAt: any, updatedAt: any } };

export type PayRequestCreatedSubscriptionVariables = Exact<{
  classId: Scalars['ID']['input'];
}>;


export type PayRequestCreatedSubscription = { __typename?: 'Subscription', payRequestCreated: { __typename?: 'PayRequest', id: string, amount: number, reason: string, justification: string, status: PayRequestStatus, createdAt: any, student: { __typename?: 'User', id: string, name: string } } };

export type PayRequestStatusChangedSubscriptionVariables = Exact<{
  classId: Scalars['ID']['input'];
}>;


export type PayRequestStatusChangedSubscription = { __typename?: 'Subscription', payRequestStatusChanged: { __typename?: 'PayRequest', id: string, status: PayRequestStatus, amount: number, teacherComment?: string | null } };

export type PayRequestCommentAddedSubscriptionVariables = Exact<{
  payRequestId: Scalars['ID']['input'];
}>;


export type PayRequestCommentAddedSubscription = { __typename?: 'Subscription', payRequestCommentAdded: { __typename?: 'PayRequestComment', id: string, content: string, createdAt: any, user: { __typename?: 'User', id: string, name: string } } };

export const UserCoreFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserCore"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<UserCoreFragment, unknown>;
export const ClassCoreFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ClassCore"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Class"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"classroomId"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"gradeLevel"}},{"kind":"Field","name":{"kind":"Name","value":"joinCode"}},{"kind":"Field","name":{"kind":"Name","value":"schoolName"}},{"kind":"Field","name":{"kind":"Name","value":"district"}},{"kind":"Field","name":{"kind":"Name","value":"payPeriodDefault"}},{"kind":"Field","name":{"kind":"Name","value":"startingBalance"}},{"kind":"Field","name":{"kind":"Name","value":"teacherIds"}},{"kind":"Field","name":{"kind":"Name","value":"defaultCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"isArchived"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ClassCoreFragment, unknown>;
export const StudentDtoCoreFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StudentDtoCore"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Student"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"classId"}}]}}]} as unknown as DocumentNode<StudentDtoCoreFragment, unknown>;
export const StoreItemCoreFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"StoreItemCore"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"StoreItem"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"classId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"perStudentLimit"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"sort"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<StoreItemCoreFragment, unknown>;
export const JobCoreFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"JobCore"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Job"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"classId"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"salary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"schedule"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"weekday"}},{"kind":"Field","name":{"kind":"Name","value":"dayOfMonth"}},{"kind":"Field","name":{"kind":"Name","value":"anchorDate"}}]}},{"kind":"Field","name":{"kind":"Name","value":"capacity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"max"}}]}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<JobCoreFragment, unknown>;
export const TransactionCoreFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"TransactionCore"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Transaction"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"accountId"}},{"kind":"Field","name":{"kind":"Name","value":"toAccountId"}},{"kind":"Field","name":{"kind":"Name","value":"classId"}},{"kind":"Field","name":{"kind":"Name","value":"classroomId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"memo"}},{"kind":"Field","name":{"kind":"Name","value":"createdByUserId"}},{"kind":"Field","name":{"kind":"Name","value":"idempotencyKey"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<TransactionCoreFragment, unknown>;
export const AccountWithBalanceFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AccountWithBalance"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Account"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"classId"}},{"kind":"Field","name":{"kind":"Name","value":"classroomId"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<AccountWithBalanceFragment, unknown>;
export const PayRequestCoreFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PayRequestCore"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PayRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"classId"}},{"kind":"Field","name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"justification"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"teacherComment"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<PayRequestCoreFragment, unknown>;
export const ClassReasonCoreFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ClassReasonCore"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ClassReason"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"classId"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<ClassReasonCoreFragment, unknown>;
export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const SignUpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SignUp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SignUpInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signUp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]}}]} as unknown as DocumentNode<SignUpMutation, SignUpMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const RefreshAccessTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshAccessToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshAccessToken"}}]}}]} as unknown as DocumentNode<RefreshAccessTokenMutation, RefreshAccessTokenMutationVariables>;
export const CreateClassDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateClass"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateClassInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createClass"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"gradeLevel"}},{"kind":"Field","name":{"kind":"Name","value":"joinCode"}},{"kind":"Field","name":{"kind":"Name","value":"defaultCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"students"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"classId"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}}]}}]}}]} as unknown as DocumentNode<CreateClassMutation, CreateClassMutationVariables>;
export const UpdateClassDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateClass"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateClassInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateClass"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"gradeLevel"}},{"kind":"Field","name":{"kind":"Name","value":"joinCode"}},{"kind":"Field","name":{"kind":"Name","value":"defaultCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"isArchived"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateClassMutation, UpdateClassMutationVariables>;
export const RotateJoinCodeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RotateJoinCode"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rotateJoinCode"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"joinCode"}}]}}]}}]} as unknown as DocumentNode<RotateJoinCodeMutation, RotateJoinCodeMutationVariables>;
export const DeleteClassDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteClass"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"hard"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}},"defaultValue":{"kind":"BooleanValue","value":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteClass"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"hard"},"value":{"kind":"Variable","name":{"kind":"Name","value":"hard"}}}]}]}}]} as unknown as DocumentNode<DeleteClassMutation, DeleteClassMutationVariables>;
export const JoinClassDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"JoinClass"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"joinCode"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"joinClass"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"joinCode"},"value":{"kind":"Variable","name":{"kind":"Name","value":"joinCode"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"gradeLevel"}},{"kind":"Field","name":{"kind":"Name","value":"defaultCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"joinCode"}}]}}]}}]} as unknown as DocumentNode<JoinClassMutation, JoinClassMutationVariables>;
export const CreatePayRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePayRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePayRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"justification"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreatePayRequestMutation, CreatePayRequestMutationVariables>;
export const ApprovePayRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApprovePayRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"amount"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"comment"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"approvePayRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"amount"},"value":{"kind":"Variable","name":{"kind":"Name","value":"amount"}}},{"kind":"Argument","name":{"kind":"Name","value":"comment"},"value":{"kind":"Variable","name":{"kind":"Name","value":"comment"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"teacherComment"}}]}}]}}]} as unknown as DocumentNode<ApprovePayRequestMutation, ApprovePayRequestMutationVariables>;
export const SubmitPayRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitPayRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitPayRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<SubmitPayRequestMutation, SubmitPayRequestMutationVariables>;
export const RebukePayRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RebukePayRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"comment"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rebukePayRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"comment"},"value":{"kind":"Variable","name":{"kind":"Name","value":"comment"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"teacherComment"}}]}}]}}]} as unknown as DocumentNode<RebukePayRequestMutation, RebukePayRequestMutationVariables>;
export const DenyPayRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DenyPayRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"comment"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"denyPayRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"comment"},"value":{"kind":"Variable","name":{"kind":"Name","value":"comment"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"teacherComment"}}]}}]}}]} as unknown as DocumentNode<DenyPayRequestMutation, DenyPayRequestMutationVariables>;
export const AddPayRequestCommentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddPayRequestComment"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"payRequestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addPayRequestComment"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"payRequestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"payRequestId"}}},{"kind":"Argument","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<AddPayRequestCommentMutation, AddPayRequestCommentMutationVariables>;
export const CreateStoreItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateStoreItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateStoreItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createStoreItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"perStudentLimit"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"sort"}}]}}]}}]} as unknown as DocumentNode<CreateStoreItemMutation, CreateStoreItemMutationVariables>;
export const UpdateStoreItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateStoreItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateStoreItemInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateStoreItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"perStudentLimit"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"sort"}}]}}]}}]} as unknown as DocumentNode<UpdateStoreItemMutation, UpdateStoreItemMutationVariables>;
export const DeleteStoreItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteStoreItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteStoreItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteStoreItemMutation, DeleteStoreItemMutationVariables>;
export const MakePurchaseDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MakePurchase"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"MakePurchaseInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"makePurchase"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unitPrice"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<MakePurchaseMutation, MakePurchaseMutationVariables>;
export const AccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Account"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"studentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"classId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"account"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"studentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"studentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"classId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"classId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"classId"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}}]}}]} as unknown as DocumentNode<AccountQuery, AccountQueryVariables>;
export const TransactionsByAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TransactionsByAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactionsByAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"memo"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<TransactionsByAccountQuery, TransactionsByAccountQueryVariables>;
export const GetClassesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetClasses"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeArchived"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}},"defaultValue":{"kind":"BooleanValue","value":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"classes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"includeArchived"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeArchived"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"gradeLevel"}},{"kind":"Field","name":{"kind":"Name","value":"joinCode"}},{"kind":"Field","name":{"kind":"Name","value":"defaultCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"isArchived"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetClassesQuery, GetClassesQueryVariables>;
export const GetClassByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetClassById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"class"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"gradeLevel"}},{"kind":"Field","name":{"kind":"Name","value":"joinCode"}},{"kind":"Field","name":{"kind":"Name","value":"schoolName"}},{"kind":"Field","name":{"kind":"Name","value":"district"}},{"kind":"Field","name":{"kind":"Name","value":"payPeriodDefault"}},{"kind":"Field","name":{"kind":"Name","value":"startingBalance"}},{"kind":"Field","name":{"kind":"Name","value":"teacherIds"}},{"kind":"Field","name":{"kind":"Name","value":"defaultCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"isArchived"}},{"kind":"Field","name":{"kind":"Name","value":"students"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"classId"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}},{"kind":"Field","name":{"kind":"Name","value":"storeItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"perStudentLimit"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"sort"}}]}},{"kind":"Field","name":{"kind":"Name","value":"jobs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"salary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"unit"}}]}},{"kind":"Field","name":{"kind":"Name","value":"capacity"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"current"}},{"kind":"Field","name":{"kind":"Name","value":"max"}}]}},{"kind":"Field","name":{"kind":"Name","value":"active"}}]}},{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"memo"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payRequests"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"justification"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"teacherComment"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reasons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetClassByIdQuery, GetClassByIdQueryVariables>;
export const GetClassBySlugDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetClassBySlug"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"class"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"gradeLevel"}},{"kind":"Field","name":{"kind":"Name","value":"joinCode"}},{"kind":"Field","name":{"kind":"Name","value":"defaultCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"isArchived"}}]}}]}}]} as unknown as DocumentNode<GetClassBySlugQuery, GetClassBySlugQueryVariables>;
export const ClassesByUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ClassesByUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Role"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"includeArchived"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}},"defaultValue":{"kind":"BooleanValue","value":false}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"classesByUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}},{"kind":"Argument","name":{"kind":"Name","value":"includeArchived"},"value":{"kind":"Variable","name":{"kind":"Name","value":"includeArchived"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"defaultCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"isArchived"}}]}}]}}]} as unknown as DocumentNode<ClassesByUserQuery, ClassesByUserQueryVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const GetNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"unreadOnly"},"value":{"kind":"Variable","name":{"kind":"Name","value":"unreadOnly"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"relatedId"}},{"kind":"Field","name":{"kind":"Name","value":"relatedType"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<GetNotificationsQuery, GetNotificationsQueryVariables>;
export const GetUnreadNotificationCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetUnreadNotificationCount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unreadNotificationCount"}}]}}]} as unknown as DocumentNode<GetUnreadNotificationCountQuery, GetUnreadNotificationCountQueryVariables>;
export const MarkNotificationAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkNotificationAsRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markNotificationAsRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}}]}}]}}]} as unknown as DocumentNode<MarkNotificationAsReadMutation, MarkNotificationAsReadMutationVariables>;
export const MarkAllNotificationsAsReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkAllNotificationsAsRead"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markAllNotificationsAsRead"}}]}}]} as unknown as DocumentNode<MarkAllNotificationsAsReadMutation, MarkAllNotificationsAsReadMutationVariables>;
export const ReasonsByClassDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReasonsByClass"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"classId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reasonsByClass"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"classId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"classId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]} as unknown as DocumentNode<ReasonsByClassQuery, ReasonsByClassQueryVariables>;
export const AddReasonsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddReasons"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"classId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"labels"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addReasons"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"classId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"classId"}}},{"kind":"Argument","name":{"kind":"Name","value":"labels"},"value":{"kind":"Variable","name":{"kind":"Name","value":"labels"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]} as unknown as DocumentNode<AddReasonsMutation, AddReasonsMutationVariables>;
export const SetReasonsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetReasons"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"classId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"labels"}},"type":{"kind":"NonNullType","type":{"kind":"ListType","type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setReasons"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"classId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"classId"}}},{"kind":"Argument","name":{"kind":"Name","value":"labels"},"value":{"kind":"Variable","name":{"kind":"Name","value":"labels"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]} as unknown as DocumentNode<SetReasonsMutation, SetReasonsMutationVariables>;
export const PayRequestsByStudentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayRequestsByStudent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"classId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"studentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payRequestsByStudent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"classId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"classId"}}},{"kind":"Argument","name":{"kind":"Name","value":"studentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"studentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"justification"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"teacherComment"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<PayRequestsByStudentQuery, PayRequestsByStudentQueryVariables>;
export const PayRequestsByClassDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayRequestsByClass"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"classId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PayRequestStatus"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payRequestsByClass"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"classId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"classId"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"justification"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"teacherComment"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"comments"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]}}]} as unknown as DocumentNode<PayRequestsByClassQuery, PayRequestsByClassQueryVariables>;
export const StoreItemsByClassDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StoreItemsByClass"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"classId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"storeItemsByClass"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"classId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"classId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"perStudentLimit"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"sort"}}]}}]}}]} as unknown as DocumentNode<StoreItemsByClassQuery, StoreItemsByClassQueryVariables>;
export const StudentsByClassDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StudentsByClass"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"classId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentsByClass"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"classId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"classId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"classId"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}}]}}]} as unknown as DocumentNode<StudentsByClassQuery, StudentsByClassQueryVariables>;
export const StudentsDirectoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StudentsDirectory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"StudentsFilter"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"50"}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"offset"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}},"defaultValue":{"kind":"IntValue","value":"0"}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"students"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}},{"kind":"Argument","name":{"kind":"Name","value":"offset"},"value":{"kind":"Variable","name":{"kind":"Name","value":"offset"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"nodes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<StudentsDirectoryQuery, StudentsDirectoryQueryVariables>;
export const StudentsByTeacherDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StudentsByTeacher"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentsByTeacher"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}},{"kind":"Field","name":{"kind":"Name","value":"classId"}},{"kind":"Field","name":{"kind":"Name","value":"class"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"period"}}]}}]}}]}}]} as unknown as DocumentNode<StudentsByTeacherQuery, StudentsByTeacherQueryVariables>;
export const NotificationReceivedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"NotificationReceived"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"userId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notificationReceived"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"userId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"userId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"userId"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"relatedId"}},{"kind":"Field","name":{"kind":"Name","value":"relatedType"}},{"kind":"Field","name":{"kind":"Name","value":"isRead"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<NotificationReceivedSubscription, NotificationReceivedSubscriptionVariables>;
export const PayRequestCreatedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"PayRequestCreated"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"classId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payRequestCreated"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"classId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"classId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"justification"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<PayRequestCreatedSubscription, PayRequestCreatedSubscriptionVariables>;
export const PayRequestStatusChangedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"PayRequestStatusChanged"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"classId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payRequestStatusChanged"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"classId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"classId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"teacherComment"}}]}}]}}]} as unknown as DocumentNode<PayRequestStatusChangedSubscription, PayRequestStatusChangedSubscriptionVariables>;
export const PayRequestCommentAddedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"subscription","name":{"kind":"Name","value":"PayRequestCommentAdded"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"payRequestId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payRequestCommentAdded"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"payRequestId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"payRequestId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<PayRequestCommentAddedSubscription, PayRequestCommentAddedSubscriptionVariables>;