import { gql } from "graphql-tag";
import { DateTimeTypeDefinition } from "graphql-scalars";

export const typeDefs = [
  DateTimeTypeDefinition,
  gql`
    scalar JSON
    # Note: DateTime is provided by DateTimeTypeDefinition; don't redeclare it here.

    enum Role {
      TEACHER
      STUDENT
      PARENT
    }

    enum UserStatus {
      ACTIVE
      INVITED
      DISABLED
    }

    enum TransactionType {
      DEPOSIT
      WITHDRAWAL
      TRANSFER
      ADJUSTMENT
      PURCHASE
      REFUND
      PAYROLL
      FINE
    }

    enum PayPeriod {
      WEEKLY
      BIWEEKLY
      MONTHLY
      SEMESTER
    }

    enum JobSalaryUnit {
      FIXED
      HOURLY
    }

    enum JobApplicationStatus {
      PENDING
      APPROVED
      REJECTED
      WITHDRAWN
    }

    enum EmploymentStatus {
      ACTIVE
      ENDED
    }

    enum PayRequestStatus {
      SUBMITTED
      APPROVED
      PAID
      REBUKED
      DENIED
    }

    type AuthPayload {
      user: User!
      accessToken: String!
    }

    type User {
      id: ID!
      role: Role!
      name: String!
      email: String
      status: UserStatus!
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    type ClassroomSettings {
      currency: String
      overdraft: Int
      transferAcrossClasses: Boolean
    }

    type Classroom {
      id: ID!
      name: String!
      ownerId: ID!
      settings: ClassroomSettings
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    type Class {
      id: ID!
      classroomId: ID!
      slug: String
      name: String!
      subject: String
      period: String
      gradeLevel: Int
      joinCode: String!
      schoolName: String
      district: String
      payPeriodDefault: PayPeriod
      startingBalance: Int
      teacherIds: [ID!]!
      defaultCurrency: String
      students: [Student!]!
      storeItems: [StoreItem!]!
      jobs: [Job!]!
      transactions: [Transaction!]!
      payRequests: [PayRequest!]!
      reasons: [ClassReason!]!
      isArchived: Boolean!
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    type Membership {
      id: ID!
      userId: ID!
      classId: [ID!]
      role: Role!
      status: String!
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    type Account {
      id: ID!
      studentId: ID!
      classId: ID!
      classroomId: ID!
      createdAt: DateTime!
      updatedAt: DateTime!
      balance: Int!
    }

    type Transaction {
      id: ID!
      accountId: ID!
      toAccountId: ID
      classId: ID!
      classroomId: ID!
      type: TransactionType!
      amount: Int!
      memo: String
      createdByUserId: ID!
      idempotencyKey: String
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    type StoreItem {
      id: ID!
      classId: ID!
      title: String!
      price: Int!
      description: String
      imageUrl: String
      stock: Int
      perStudentLimit: Int
      active: Boolean!
      sort: Int
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    type Purchase {
      id: ID!
      studentId: ID!
      classId: ID!
      accountId: ID!
      storeItemId: ID!
      quantity: Int!
      unitPrice: Int!
      total: Int!
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    type Job {
      id: ID!
      classId: ID!
      title: String!
      description: String
      salary: JobSalary!
      period: PayPeriod!
      schedule: JobSchedule
      capacity: JobCapacity!
      active: Boolean!
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    type JobSalary {
      amount: Int!
      unit: JobSalaryUnit!
    }

    type JobSchedule {
      weekday: Int
      dayOfMonth: Int
      anchorDate: DateTime
    }

    type JobCapacity {
      current: Int!
      max: Int!
    }

    type JobApplication {
      id: ID!
      jobId: ID!
      classId: ID!
      studentId: ID!
      status: JobApplicationStatus!
      createdAt: DateTime!
      decidedAt: DateTime
      updatedAt: DateTime!
    }

    type Employment {
      id: ID!
      jobId: ID!
      classId: ID!
      studentId: ID!
      status: EmploymentStatus!
      startedAt: DateTime!
      endedAt: DateTime
      lastPaidAt: DateTime
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    type Payslip {
      id: ID!
      employmentId: ID!
      jobId: ID!
      classId: ID!
      studentId: ID!
      periodStart: DateTime!
      periodEnd: DateTime!
      gross: Int!
      postedTxId: ID
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    type ClassReason {
      id: ID!
      label: String!
      classId: ID!
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    type PayRequest {
      id: ID!
      classId: ID!
      studentId: ID!
      amount: Int!
      reason: String!
      justification: String!
      status: PayRequestStatus!
      teacherComment: String
      createdAt: DateTime!
      updatedAt: DateTime!
      class: Class!
      student: User!
    }

    # Compatibility DTO for Student (User+Membership+Account+Balance)
    type Student {
      id: ID!
      name: String!
      balance: Int!
      classId: ID!
      class: Class!
      txns: [Transaction!]!
      requests: [PayRequest!]!
    }

    # ---------- Students directory ----------
    input StudentsFilter {
      classId: ID
      search: String
      status: UserStatus
    }

    type StudentsResult {
      nodes: [User!]!
      totalCount: Int!
    }

    # ---------- Class CRUD Inputs ----------
    input CreateClassInput {
      classroomId: ID
      ownerId: ID
      slug: String
      name: String!
      subject: String
      period: String
      gradeLevel: Int
      schoolName: String
      district: String
      payPeriodDefault: PayPeriod
      startingBalance: Int
      defaultCurrency: String = "CE$" # still stored at Classroom.settings
      teacherIds: [ID!]
      reasons: [String!]
      students: [StudentInput!]
      jobs: [JobInput!]
      storeItems: [StoreItemInput!]
    }

    input UpdateClassInput {
      slug: String
      name: String
      subject: String
      period: String
      gradeLevel: Int
      schoolName: String
      district: String
      payPeriodDefault: PayPeriod
      startingBalance: Int
      teacherIds: [ID!]
      storeSettings: JSON
      isArchived: Boolean
    }

    # Existing inputs used by seeding
    input StudentInput {
      userId: ID
      name: String
    }

    input JobInput {
      title: String!
      description: String
      salary: Int! # amount
      payPeriod: PayPeriod!
      schedule: JobScheduleInput
      slots: Int = 1
      active: Boolean = true
    }

    input JobScheduleInput {
      weekday: Int
      dayOfMonth: Int
      anchorDate: DateTime
    }

    input StoreItemInput {
      title: String!
      price: Int!
      description: String
      imageUrl: String
      stock: Int
      perStudentLimit: Int
      active: Boolean = true
      sort: Int = 0
    }

    # --------- Queries ----------
    type Query {
      me: User
      classrooms: [Classroom!]!
      classroom(id: ID!): Classroom
      membershipsByClass(classId: ID!, role: Role): [Membership!]!
      account(studentId: ID!, classId: ID!): Account
      transactionsByAccount(accountId: ID!): [Transaction!]!
      classes(includeArchived: Boolean = false): [Class!]!
      class(id: ID, slug: String): Class
      studentsByClass(classId: ID!): [Student!]!
      storeItemsByClass(classId: ID!): [StoreItem!]!
      payRequestsByClass(classId: ID!, status: PayRequestStatus): [PayRequest!]!
      payRequestsByStudent(classId: ID!, studentId: ID!): [PayRequest!]!
      reasonsByClass(classId: ID!): [ClassReason!]!
      students(
        filter: StudentsFilter
        limit: Int = 50
        offset: Int = 0
      ): StudentsResult!
    }

    extend type Query {
      classesByUser(
        userId: ID!
        role: Role
        includeArchived: Boolean = false
      ): [Class!]!

      myClasses(role: Role, includeArchived: Boolean = false): [Class!]!
    }

    extend type Query {
      studentsByTeacher: [Student!]!
    }

    # --------- Mutations ----------
    input SignUpInput {
      name: String!
      email: String!
      password: String!
      role: Role!
    }

    input CreatePayRequestInput {
      classId: ID!
      studentId: ID!
      amount: Int!
      reason: String!
      justification: String!
    }

    type Mutation {
      # auth
      signUp(input: SignUpInput!): AuthPayload!
      login(email: String!, password: String!): AuthPayload!
      refreshAccessToken: String!
      logout: Boolean!

      # class CRUD
      createClass(input: CreateClassInput!): Class!
      updateClass(id: ID!, input: UpdateClassInput!): Class!
      rotateJoinCode(id: ID!): Class!
      deleteClass(id: ID!, hard: Boolean = false): Boolean!
      joinClass(joinCode: String!): Class!

      # Reason management
      addReasons(classId: ID!, labels: [String!]!): [ClassReason!]!
      setReasons(classId: ID!, labels: [String!]!): [ClassReason!]!

      # Pay request lifecycle
      createPayRequest(input: CreatePayRequestInput!): PayRequest!
      approvePayRequest(id: ID!, comment: String): PayRequest!
      submitPayRequest(id: ID!): PayRequest!
      rebukePayRequest(id: ID!, comment: String!): PayRequest!
      denyPayRequest(id: ID!, comment: String): PayRequest!
    }
  `,
];
