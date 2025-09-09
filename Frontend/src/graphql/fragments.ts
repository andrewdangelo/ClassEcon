import { gql } from "@apollo/client";

export const USER_CORE = gql`
  fragment UserCore on User {
    id
    name
    email
    role
    status
    createdAt
    updatedAt
  }
`;

export const CLASS_CORE = gql`
  fragment ClassCore on Class {
    id
    classroomId
    slug
    name
    subject
    period
    gradeLevel
    joinCode
    schoolName
    district
    payPeriodDefault
    startingBalance
    teacherIds
    defaultCurrency
    isArchived
    createdAt
    updatedAt
  }
`;

export const STUDENT_DTO_CORE = gql`
  fragment StudentDtoCore on Student {
    id
    name
    balance
    classId
  }
`;

export const STORE_ITEM_CORE = gql`
  fragment StoreItemCore on StoreItem {
    id
    classId
    title
    price
    description
    imageUrl
    stock
    perStudentLimit
    active
    sort
    createdAt
    updatedAt
  }
`;

export const JOB_CORE = gql`
  fragment JobCore on Job {
    id
    classId
    title
    description
    period
    salary { amount unit }
    schedule { weekday dayOfMonth anchorDate }
    capacity { current max }
    active
    createdAt
    updatedAt
  }
`;

export const TXN_CORE = gql`
  fragment TransactionCore on Transaction {
    id
    accountId
    toAccountId
    classId
    classroomId
    type
    amount
    memo
    createdByUserId
    idempotencyKey
    createdAt
    updatedAt
  }
`;

export const ACCOUNT_WITH_BALANCE = gql`
  fragment AccountWithBalance on Account {
    id
    studentId
    classId
    classroomId
    balance
    createdAt
    updatedAt
  }
`;

export const PAY_REQUEST_CORE = gql`
  fragment PayRequestCore on PayRequest {
    id
    classId
    studentId
    amount
    reason
    justification
    status
    teacherComment
    createdAt
    updatedAt
  }
`;

export const CLASS_REASON_CORE = gql`
  fragment ClassReasonCore on ClassReason {
    id
    label
    classId
    createdAt
    updatedAt
  }
`;
