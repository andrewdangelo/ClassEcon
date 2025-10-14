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

    enum OAuthProvider {
      GOOGLE
      MICROSOFT
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
      INCOME
      EXPENSE
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

    enum PurchaseStatus {
      IN_BACKPACK
      REDEEMED
      EXPIRED
    }

    enum RedemptionStatus {
      PENDING
      APPROVED
      DENIED
    }

    type AuthPayload {
      user: User!
      accessToken: String!
    }

    type User {
      id: ID!
      role: Role!
      name: String
      email: String
      status: UserStatus!
      oauthProvider: OAuthProvider
      oauthProviderId: String
      profilePicture: String
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
      description: String
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
      status: String
  # Arbitrary JSON configuration for store / economy policies (e.g. allowNegative, requireFineReason, perItemPurchaseLimit)
  storeSettings: JSON
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
      itemId: String
      studentId: ID!
      classId: ID!
      accountId: ID!
      storeItemId: ID!
      storeItem: StoreItem
      quantity: Int!
      unitPrice: Int!
      total: Int!
      status: PurchaseStatus!
      redemptionDate: DateTime
      redemptionNote: String
      hasPendingRedemption: Boolean!
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    type RedemptionRequest {
      id: ID!
      purchaseId: ID!
      purchase: Purchase
      studentId: ID!
      student: User
      classId: ID!
      status: RedemptionStatus!
      studentNote: String
      teacherComment: String
      reviewedByUserId: ID
      reviewedBy: User
      reviewedAt: DateTime
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    type Job {
      id: ID!
      classId: ID!
      title: String!
      description: String
      rolesResponsibilities: String
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
      job: Job!
      classId: ID!
      studentId: ID!
      student: User!
      status: JobApplicationStatus!
      applicationText: String
      qualifications: String
      availability: String
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
      comments: [PayRequestComment!]!
    }

    type PayRequestComment {
      id: ID!
      payRequestId: ID!
      userId: ID!
      content: String!
      createdAt: DateTime!
      updatedAt: DateTime!
      user: User!
    }

    type Notification {
      id: ID!
      userId: ID!
      type: String!
      title: String!
      message: String!
      relatedId: ID
      relatedType: String
      isRead: Boolean!
      createdAt: DateTime!
      updatedAt: DateTime!
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
      description: String
      subject: String
      period: String
      gradeLevel: Int
      schoolName: String
      district: String
      payPeriodDefault: PayPeriod
      startingBalance: Int
      defaultCurrency: String = "CE$" # still stored at Classroom.settings
      teacherIds: [ID!]
      storeSettings: JSON
      reasons: [String!]
      students: [StudentInput!]
      jobs: [JobInput!]
      storeItems: [StoreItemInput!]
    }

    input UpdateClassInput {
      slug: String
      name: String
      description: String
      subject: String
      period: String
      gradeLevel: Int
      schoolName: String
      district: String
      payPeriodDefault: PayPeriod
      startingBalance: Int
      defaultCurrency: String
      teacherIds: [ID!]
      storeSettings: JSON
      status: String
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

    input CreateStoreItemInput {
      classId: ID!
      title: String!
      price: Int!
      description: String
      imageUrl: String
      stock: Int
      perStudentLimit: Int
      active: Boolean = true
      sort: Int = 0
    }

    input UpdateStoreItemInput {
      title: String
      price: Int
      description: String
      imageUrl: String
      stock: Int
      perStudentLimit: Int
      active: Boolean
      sort: Int
    }

    input MakePurchaseInput {
      classId: ID!
      items: [PurchaseItemInput!]!
    }

    input PurchaseItemInput {
      storeItemId: ID!
      quantity: Int!
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
      payRequest(id: ID!): PayRequest
      payRequestComments(payRequestId: ID!): [PayRequestComment!]!
      reasonsByClass(classId: ID!): [ClassReason!]!
      students(
        filter: StudentsFilter
        limit: Int = 50
        offset: Int = 0
      ): StudentsResult!
      
      # Notifications
      notifications(userId: ID, limit: Int = 50, unreadOnly: Boolean = false): [Notification!]!
      unreadNotificationCount: Int!
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

    extend type Query {
      # Student's backpack - items they've purchased
      studentBackpack(studentId: ID!, classId: ID!): [Purchase!]!
      
      # Purchase history for a student
      purchaseHistory(studentId: ID!, classId: ID!): [Purchase!]!
      
      # Redemption requests (filtered by status and class)
      redemptionRequests(classId: ID!, status: RedemptionStatus): [RedemptionRequest!]!
      
      # Single redemption request
      redemptionRequest(id: ID!): RedemptionRequest
      
      # Redemption history for a student (all redemption attempts)
      redemptionHistory(studentId: ID!, classId: ID!): [RedemptionRequest!]!
      
      # Jobs
      jobs(classId: ID!, activeOnly: Boolean = true): [Job!]!
      job(id: ID!): Job
      
      # Job applications
      jobApplications(jobId: ID, studentId: ID, classId: ID, status: JobApplicationStatus): [JobApplication!]!
      jobApplication(id: ID!): JobApplication
      
      # Employments
      studentEmployments(studentId: ID!, classId: ID!, status: EmploymentStatus): [Employment!]!
      jobEmployments(jobId: ID!, status: EmploymentStatus): [Employment!]!
      
      # Class statistics (teacher only)
      classStatistics(classId: ID!): ClassStatistics!
    }
    
    type ClassStatistics {
      totalStudents: Int!
      totalJobs: Int!
      activeJobs: Int!
      totalEmployments: Int!
      pendingApplications: Int!
      totalTransactions: Int!
      totalPayRequests: Int!
      pendingPayRequests: Int!
      averageBalance: Float!
      totalCirculation: Float!
    }

    # --------- Mutations ----------
    input SignUpInput {
      name: String!
      email: String!
      password: String!
      role: Role!
      joinCode: String
    }

    input CreatePayRequestInput {
      classId: ID!
      studentId: ID!
      amount: Int!
      reason: String!
      justification: String!
    }

    input CreateJobInput {
      classId: ID!
      title: String!
      description: String
      rolesResponsibilities: String
      salary: Int!
      salaryUnit: JobSalaryUnit = FIXED
      period: PayPeriod!
      maxCapacity: Int = 1
      active: Boolean = true
    }

    input UpdateJobInput {
      title: String
      description: String
      rolesResponsibilities: String
      salary: Int
      salaryUnit: JobSalaryUnit
      period: PayPeriod
      maxCapacity: Int
      active: Boolean
    }

    input ApplyForJobInput {
      jobId: ID!
      applicationText: String!
      qualifications: String
      availability: String
    }

    type Mutation {
      # auth
      signUp(input: SignUpInput!): AuthPayload!
      login(email: String!, password: String!): AuthPayload!
      oauthLogin(provider: OAuthProvider!, code: String!): AuthPayload!
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
      approvePayRequest(id: ID!, amount: Int!, comment: String): PayRequest!
      submitPayRequest(id: ID!): PayRequest!
      rebukePayRequest(id: ID!, comment: String!): PayRequest!
      denyPayRequest(id: ID!, comment: String!): PayRequest!

      # Pay request comments
      addPayRequestComment(payRequestId: ID!, content: String!): PayRequestComment!

      # Store item management
      createStoreItem(input: CreateStoreItemInput!): StoreItem!
      updateStoreItem(id: ID!, input: UpdateStoreItemInput!): StoreItem!
      deleteStoreItem(id: ID!): Boolean!

      # Purchase
      makePurchase(input: MakePurchaseInput!): [Purchase!]!
      
      # Redemption system
      createRedemptionRequest(purchaseId: ID!, studentNote: String!): RedemptionRequest!
      approveRedemption(id: ID!, teacherComment: String!): RedemptionRequest!
      denyRedemption(id: ID!, teacherComment: String!): RedemptionRequest!
      
      # Job management
      createJob(input: CreateJobInput!): Job!
      updateJob(id: ID!, input: UpdateJobInput!): Job!
      deleteJob(id: ID!): Boolean!
      
      # Job applications
      applyForJob(input: ApplyForJobInput!): JobApplication!
      approveJobApplication(id: ID!): JobApplication!
      rejectJobApplication(id: ID!, reason: String): JobApplication!
      withdrawJobApplication(id: ID!): JobApplication!
      
      # Notifications
      markNotificationAsRead(id: ID!): Notification!
      markAllNotificationsAsRead: Boolean!
      clearAllNotifications: Boolean!
    }

    type Subscription {
      # Real-time updates for pay requests
      payRequestUpdated(classId: ID!): PayRequest!
      payRequestCreated(classId: ID!): PayRequest!
      payRequestStatusChanged(classId: ID!): PayRequest!
      payRequestCommentAdded(payRequestId: ID!): PayRequestComment!
      
      # Notifications
      notificationReceived(userId: ID!): Notification!
    }
  `,
];
