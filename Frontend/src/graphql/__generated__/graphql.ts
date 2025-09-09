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
  id: Scalars['ID']['output'];
  jobs: Array<Job>;
  name: Scalars['String']['output'];
  payRequests: Array<PayRequest>;
  period?: Maybe<Scalars['String']['output']>;
  reasons: Array<ClassReason>;
  slug?: Maybe<Scalars['String']['output']>;
  storeItems: Array<StoreItem>;
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
  jobs?: InputMaybe<Array<JobInput>>;
  name: Scalars['String']['input'];
  ownerId?: InputMaybe<Scalars['ID']['input']>;
  reasons?: InputMaybe<Array<Scalars['String']['input']>>;
  room?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  storeItems?: InputMaybe<Array<StoreItemInput>>;
  students?: InputMaybe<Array<StudentInput>>;
  teacherIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  term?: InputMaybe<Scalars['String']['input']>;
};

export type CreatePayRequestInput = {
  amount: Scalars['Int']['input'];
  classId: Scalars['ID']['input'];
  justification: Scalars['String']['input'];
  reason: Scalars['String']['input'];
  studentId: Scalars['ID']['input'];
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
  description?: InputMaybe<Scalars['String']['input']>;
  payPeriod: PayPeriod;
  salary: Scalars['Int']['input'];
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

export type Membership = {
  __typename?: 'Membership';
  classId: Scalars['ID']['output'];
  createdAt: Scalars['DateTime']['output'];
  id: Scalars['ID']['output'];
  role: Role;
  status: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  userId: Scalars['ID']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addReasons: Array<ClassReason>;
  approvePayRequest: PayRequest;
  createClass: Class;
  createPayRequest: PayRequest;
  denyPayRequest: PayRequest;
  login: AuthPayload;
  logout: Scalars['Boolean']['output'];
  rebukePayRequest: PayRequest;
  refreshAccessToken: Scalars['String']['output'];
  setReasons: Array<ClassReason>;
  signUp: AuthPayload;
  submitPayRequest: PayRequest;
};


export type MutationAddReasonsArgs = {
  classId: Scalars['ID']['input'];
  labels: Array<Scalars['String']['input']>;
};


export type MutationApprovePayRequestArgs = {
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};


export type MutationCreateClassArgs = {
  input: CreateClassInput;
};


export type MutationCreatePayRequestArgs = {
  input: CreatePayRequestInput;
};


export type MutationDenyPayRequestArgs = {
  comment?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['ID']['input'];
};


export type MutationLoginArgs = {
  email: Scalars['String']['input'];
  password: Scalars['String']['input'];
};


export type MutationRebukePayRequestArgs = {
  comment: Scalars['String']['input'];
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

export type Query = {
  __typename?: 'Query';
  account?: Maybe<Account>;
  class?: Maybe<Class>;
  classes: Array<Class>;
  classroom?: Maybe<Classroom>;
  classrooms: Array<Classroom>;
  me?: Maybe<User>;
  membershipsByClass: Array<Membership>;
  payRequestsByClass: Array<PayRequest>;
  payRequestsByStudent: Array<PayRequest>;
  reasonsByClass: Array<ClassReason>;
  storeItemsByClass: Array<StoreItem>;
  studentsByClass: Array<Student>;
  transactionsByAccount: Array<Transaction>;
};


export type QueryAccountArgs = {
  classId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
};


export type QueryClassArgs = {
  id?: InputMaybe<Scalars['ID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryClassroomArgs = {
  id: Scalars['ID']['input'];
};


export type QueryMembershipsByClassArgs = {
  classId: Scalars['ID']['input'];
  role?: InputMaybe<Role>;
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


export type CreateClassMutation = { __typename?: 'Mutation', createClass: { __typename?: 'Class', id: string, name: string, period?: string | null, subject?: string | null, defaultCurrency?: string | null } };

export type CreatePayRequestMutationVariables = Exact<{
  input: CreatePayRequestInput;
}>;


export type CreatePayRequestMutation = { __typename?: 'Mutation', createPayRequest: { __typename?: 'PayRequest', id: string, status: PayRequestStatus, amount: number, reason: string, justification: string, createdAt: any } };

export type ApprovePayRequestMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  comment?: InputMaybe<Scalars['String']['input']>;
}>;


export type ApprovePayRequestMutation = { __typename?: 'Mutation', approvePayRequest: { __typename?: 'PayRequest', id: string, status: PayRequestStatus, teacherComment?: string | null } };

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
  comment?: InputMaybe<Scalars['String']['input']>;
}>;


export type DenyPayRequestMutation = { __typename?: 'Mutation', denyPayRequest: { __typename?: 'PayRequest', id: string, status: PayRequestStatus, teacherComment?: string | null } };

export type AccountQueryVariables = Exact<{
  studentId: Scalars['ID']['input'];
  classId: Scalars['ID']['input'];
}>;


export type AccountQuery = { __typename?: 'Query', account?: { __typename?: 'Account', id: string, studentId: string, classId: string, balance: number } | null };

export type TransactionsByAccountQueryVariables = Exact<{
  accountId: Scalars['ID']['input'];
}>;


export type TransactionsByAccountQuery = { __typename?: 'Query', transactionsByAccount: Array<{ __typename?: 'Transaction', id: string, type: TransactionType, amount: number, memo?: string | null, createdAt: any }> };

export type GetClassesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetClassesQuery = { __typename?: 'Query', classes: Array<{ __typename?: 'Class', id: string, name: string, period?: string | null, subject?: string | null, defaultCurrency?: string | null }> };

export type GetClassByIdQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetClassByIdQuery = { __typename?: 'Query', class?: { __typename?: 'Class', id: string, name: string, period?: string | null, subject?: string | null, defaultCurrency?: string | null, students: Array<{ __typename?: 'Student', id: string, name: string, classId: string, balance: number }>, storeItems: Array<{ __typename?: 'StoreItem', id: string, title: string, price: number, description?: string | null, imageUrl?: string | null, stock?: number | null, perStudentLimit?: number | null, active: boolean, sort?: number | null }>, jobs: Array<{ __typename?: 'Job', id: string, title: string, description?: string | null, active: boolean }>, transactions: Array<{ __typename?: 'Transaction', id: string, type: TransactionType, amount: number, memo?: string | null, createdAt: any }>, payRequests: Array<{ __typename?: 'PayRequest', id: string, amount: number, reason: string, justification: string, status: PayRequestStatus, createdAt: any }>, reasons: Array<{ __typename?: 'ClassReason', id: string, label: string }> } | null };

export type MeQueryVariables = Exact<{ [key: string]: never; }>;


export type MeQuery = { __typename?: 'Query', me?: { __typename?: 'User', id: string, name: string, email?: string | null, role: Role } | null };

export type ReasonsByClassQueryVariables = Exact<{
  classId: Scalars['ID']['input'];
}>;


export type ReasonsByClassQuery = { __typename?: 'Query', reasonsByClass: Array<{ __typename?: 'ClassReason', id: string, label: string }> };

export type PayRequestsByStudentQueryVariables = Exact<{
  classId: Scalars['ID']['input'];
  studentId: Scalars['ID']['input'];
}>;


export type PayRequestsByStudentQuery = { __typename?: 'Query', payRequestsByStudent: Array<{ __typename?: 'PayRequest', id: string, amount: number, reason: string, justification: string, status: PayRequestStatus, teacherComment?: string | null, createdAt: any }> };

export type PayRequestsByClassQueryVariables = Exact<{
  classId: Scalars['ID']['input'];
  status?: InputMaybe<PayRequestStatus>;
}>;


export type PayRequestsByClassQuery = { __typename?: 'Query', payRequestsByClass: Array<{ __typename?: 'PayRequest', id: string, amount: number, reason: string, justification: string, status: PayRequestStatus, teacherComment?: string | null, createdAt: any, student: { __typename?: 'User', id: string, name: string } }> };

export type StudentsByClassQueryVariables = Exact<{
  classId: Scalars['ID']['input'];
}>;


export type StudentsByClassQuery = { __typename?: 'Query', studentsByClass: Array<{ __typename?: 'Student', id: string, name: string, classId: string, balance: number }> };


export const LoginDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Login"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"password"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"login"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}},{"kind":"Argument","name":{"kind":"Name","value":"password"},"value":{"kind":"Variable","name":{"kind":"Name","value":"password"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]}}]} as unknown as DocumentNode<LoginMutation, LoginMutationVariables>;
export const SignUpDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SignUp"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SignUpInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"signUp"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"accessToken"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]}}]} as unknown as DocumentNode<SignUpMutation, SignUpMutationVariables>;
export const LogoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"Logout"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"logout"}}]}}]} as unknown as DocumentNode<LogoutMutation, LogoutMutationVariables>;
export const RefreshAccessTokenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RefreshAccessToken"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"refreshAccessToken"}}]}}]} as unknown as DocumentNode<RefreshAccessTokenMutation, RefreshAccessTokenMutationVariables>;
export const CreateClassDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateClass"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateClassInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createClass"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"defaultCurrency"}}]}}]}}]} as unknown as DocumentNode<CreateClassMutation, CreateClassMutationVariables>;
export const CreatePayRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreatePayRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreatePayRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createPayRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"justification"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<CreatePayRequestMutation, CreatePayRequestMutationVariables>;
export const ApprovePayRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ApprovePayRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"comment"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"approvePayRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"comment"},"value":{"kind":"Variable","name":{"kind":"Name","value":"comment"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"teacherComment"}}]}}]}}]} as unknown as DocumentNode<ApprovePayRequestMutation, ApprovePayRequestMutationVariables>;
export const SubmitPayRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubmitPayRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"submitPayRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}}]}}]}}]} as unknown as DocumentNode<SubmitPayRequestMutation, SubmitPayRequestMutationVariables>;
export const RebukePayRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RebukePayRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"comment"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rebukePayRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"comment"},"value":{"kind":"Variable","name":{"kind":"Name","value":"comment"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"teacherComment"}}]}}]}}]} as unknown as DocumentNode<RebukePayRequestMutation, RebukePayRequestMutationVariables>;
export const DenyPayRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DenyPayRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"comment"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"denyPayRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"comment"},"value":{"kind":"Variable","name":{"kind":"Name","value":"comment"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"teacherComment"}}]}}]}}]} as unknown as DocumentNode<DenyPayRequestMutation, DenyPayRequestMutationVariables>;
export const AccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Account"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"studentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"classId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"account"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"studentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"studentId"}}},{"kind":"Argument","name":{"kind":"Name","value":"classId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"classId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"studentId"}},{"kind":"Field","name":{"kind":"Name","value":"classId"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}}]}}]} as unknown as DocumentNode<AccountQuery, AccountQueryVariables>;
export const TransactionsByAccountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"TransactionsByAccount"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"transactionsByAccount"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"accountId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"accountId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"memo"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<TransactionsByAccountQuery, TransactionsByAccountQueryVariables>;
export const GetClassesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetClasses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"classes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"defaultCurrency"}}]}}]}}]} as unknown as DocumentNode<GetClassesQuery, GetClassesQueryVariables>;
export const GetClassByIdDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetClassById"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"class"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"period"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"defaultCurrency"}},{"kind":"Field","name":{"kind":"Name","value":"students"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"classId"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}},{"kind":"Field","name":{"kind":"Name","value":"storeItems"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"perStudentLimit"}},{"kind":"Field","name":{"kind":"Name","value":"active"}},{"kind":"Field","name":{"kind":"Name","value":"sort"}}]}},{"kind":"Field","name":{"kind":"Name","value":"jobs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"active"}}]}},{"kind":"Field","name":{"kind":"Name","value":"transactions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"type"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"memo"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"payRequests"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"justification"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reasons"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]}}]} as unknown as DocumentNode<GetClassByIdQuery, GetClassByIdQueryVariables>;
export const MeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"me"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"role"}}]}}]}}]} as unknown as DocumentNode<MeQuery, MeQueryVariables>;
export const ReasonsByClassDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ReasonsByClass"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"classId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"reasonsByClass"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"classId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"classId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"label"}}]}}]}}]} as unknown as DocumentNode<ReasonsByClassQuery, ReasonsByClassQueryVariables>;
export const PayRequestsByStudentDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayRequestsByStudent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"classId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"studentId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payRequestsByStudent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"classId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"classId"}}},{"kind":"Argument","name":{"kind":"Name","value":"studentId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"studentId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"justification"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"teacherComment"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<PayRequestsByStudentQuery, PayRequestsByStudentQueryVariables>;
export const PayRequestsByClassDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"PayRequestsByClass"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"classId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"PayRequestStatus"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"payRequestsByClass"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"classId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"classId"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"student"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"amount"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"justification"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"teacherComment"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}}]}}]}}]} as unknown as DocumentNode<PayRequestsByClassQuery, PayRequestsByClassQueryVariables>;
export const StudentsByClassDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StudentsByClass"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"classId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studentsByClass"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"classId"},"value":{"kind":"Variable","name":{"kind":"Name","value":"classId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"classId"}},{"kind":"Field","name":{"kind":"Name","value":"balance"}}]}}]}}]} as unknown as DocumentNode<StudentsByClassQuery, StudentsByClassQueryVariables>;