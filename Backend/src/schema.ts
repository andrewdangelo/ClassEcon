import { gql } from "graphql-tag";
import { DateTimeTypeDefinition } from "graphql-scalars";

export const typeDefs = [
  DateTimeTypeDefinition,
  gql`
    scalar JSON
    # Note: DateTime is provided by DateTimeTypeDefinition; don't redeclare it here.

    enum Role {
      ADMIN
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
      BANNED
    }

    enum SubscriptionTier {
      FREE
      TRIAL
      STARTER
      PROFESSIONAL
      SCHOOL
    }

    enum SubscriptionStatus {
      ACTIVE
      TRIAL
      EXPIRED
      CANCELED
      PAST_DUE
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

    enum FineStatus {
      PENDING
      APPLIED
      WAIVED
    }

    enum PlanTier {
      FREE
      TRIAL
      STARTER
      PROFESSIONAL
      SCHOOL
    }

    enum PlanStatus {
      ACTIVE
      TRIAL
      CANCELED
      PAST_DUE
      EXPIRED
    }

    type AuthPayload {
      user: User!
      accessToken: String!
    }

    type PublicActionResult {
      success: Boolean!
      message: String
    }

    type JoinWaitlistResult {
      success: Boolean!
      message: String
      referralCode: String
      referralLink: String
      successfulReferrals: Int
      boostPoints: Int
      displayPosition: Int
    }

    input JoinWaitlistInput {
      email: String!
      name: String
      role: String
      school: String
      approximateStudents: String
      referralCode: String
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
      emailVerified: Boolean!
      createdAt: DateTime!
      updatedAt: DateTime!
      hasBetaAccess: Boolean!
      subscriptionTier: SubscriptionTier!
      subscriptionStatus: SubscriptionStatus!
      subscriptionExpiresAt: DateTime
      trialStartedAt: DateTime
      trialEndsAt: DateTime
      isFoundingMember: Boolean!
      stripeCustomerId: String
      stripeSubscriptionId: String
      # Admin-only fields
      classCount: Int
      lastLoginAt: DateTime
      banReason: String
      bannedAt: DateTime
      bannedByUserId: ID
    }

    type AdminUserResult {
      nodes: [User!]!
      totalCount: Int!
      pageInfo: PageInfo!
    }

    type PageInfo {
      hasNextPage: Boolean!
      hasPreviousPage: Boolean!
      totalPages: Int!
      currentPage: Int!
    }

    type AdminDashboardStats {
      totalUsers: Int!
      totalTeachers: Int!
      totalStudents: Int!
      totalParents: Int!
      totalAdmins: Int!
      activeUsers: Int!
      bannedUsers: Int!
      disabledUsers: Int!
      totalClasses: Int!
      activeClasses: Int!
      archivedClasses: Int!
      totalClassrooms: Int!
      totalBetaCodes: Int!
      activeBetaCodes: Int!
      totalBetaCodeUses: Int!
      newUsersToday: Int!
      newUsersThisWeek: Int!
      newUsersThisMonth: Int!
      totalWaitlistSignups: Int!
      totalWaitlistReferrals: Int!
      topWaitlistBoostPoints: Int!
    }

    type AdminWaitlistEntry {
      id: ID!
      email: String!
      name: String
      role: String
      school: String
      approximateStudents: String
      signupOrder: Int!
      referralCode: String!
      referredByCode: String
      successfulReferrals: Int!
      boostPoints: Int!
      displayPosition: Int!
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    type AdminWaitlistResult {
      nodes: [AdminWaitlistEntry!]!
      totalCount: Int!
    }

    type AuditLog {
      id: ID!
      adminUserId: ID!
      adminUser: User
      action: String!
      targetType: String!
      targetId: ID!
      details: JSON
      ipAddress: String
      userAgent: String
      createdAt: DateTime!
    }

    type AuditLogResult {
      nodes: [AuditLog!]!
      totalCount: Int!
    }

    type BetaAccessCode {
      id: ID!
      code: String!
      description: String
      maxUses: Int!
      currentUses: Int!
      expiresAt: DateTime
      isActive: Boolean!
      usedBy: [User!]!
      createdAt: DateTime!
    }

    type BetaAccessValidation {
      valid: Boolean!
      message: String!
      code: BetaAccessCode
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
      teachers: [User!]!
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

    type Fine {
      id: ID!
      studentId: ID!
      student: User!
      classId: ID!
      class: Class!
      teacherId: ID!
      teacher: User!
      amount: Int!
      reason: String!
      description: String
      transactionId: ID
      transaction: Transaction
      status: FineStatus!
      waivedReason: String
      waivedAt: DateTime
      waivedByUserId: ID
      waivedBy: User
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    # ---------- Subscription System ----------
    type PlanLimits {
      maxClasses: Int
      maxStudentsPerClass: Int
      maxStoreItems: Int
      maxJobs: Int
      customCurrency: Boolean!
      analytics: Boolean!
      exportData: Boolean!
      prioritySupport: Boolean!
    }

    type PlanInfo {
      tier: PlanTier!
      name: String!
      price: Float!
      billingPeriod: String!
      limits: PlanLimits!
      features: [String!]!
      stripePriceId: String
    }

    type SubscriptionPlan {
      id: ID!
      userId: ID!
      planTier: PlanTier!
      status: PlanStatus!
      limits: PlanLimits!
      isFoundingMember: Boolean!
      stripeCustomerId: String
      stripeSubscriptionId: String
      currentPeriodStart: DateTime
      currentPeriodEnd: DateTime
      trialEndsAt: DateTime
      cancelAtPeriodEnd: Boolean!
      cancelledAt: DateTime
      createdAt: DateTime!
      updatedAt: DateTime!
    }

    type FeatureCheckResult {
      allowed: Boolean!
      currentUsage: Int
      limit: Int
      reason: String
    }

    # ---------- Compatibility DTOs ----------
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
      """
      Machine-readable export of the signed-in user’s data (GDPR data portability / FERPA access support).
      """
      myPersonalDataExport: JSON!
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

      # Look up a teacher by email to add as co-teacher (caller must be a class teacher)
      teacherByEmailForClass(classId: ID!, email: String!): User!
      
      # Fines
      finesByClass(classId: ID!, status: FineStatus): [Fine!]!
      finesByStudent(studentId: ID!, classId: ID!): [Fine!]!
      fine(id: ID!): Fine

      # Subscription
      mySubscription: SubscriptionPlan!
      availablePlans: [PlanInfo!]!
      checkFeatureAccess(feature: String!): FeatureCheckResult!
      canCreateClass: FeatureCheckResult!
      canAddStudent(classId: ID!): FeatureCheckResult!
      
      # Billing
      upcomingInvoice: JSON
      myPaymentMethods: [JSON!]!
      getInvoices(limit: Int): [Invoice!]!
    }

    # ---------- Admin Queries (ADMIN role only) ----------
    extend type Query {
      # Dashboard stats
      adminDashboardStats: AdminDashboardStats!
      
      # User management
      adminUsers(
        search: String
        role: Role
        status: UserStatus
        limit: Int = 50
        offset: Int = 0
        sortBy: String = "createdAt"
        sortOrder: String = "desc"
      ): AdminUserResult!
      
      adminUser(id: ID!): User
      
      # All classes (including archived)
      adminClasses(
        search: String
        isArchived: Boolean
        limit: Int = 50
        offset: Int = 0
      ): [Class!]!
      
      # All classrooms
      adminClassrooms(limit: Int = 50, offset: Int = 0): [Classroom!]!
      
      # Beta codes
      adminBetaCodes(activeOnly: Boolean = false): [BetaAccessCode!]!
      
      # Audit logs
      adminAuditLogs(
        adminUserId: ID
        action: String
        targetType: String
        limit: Int = 50
        offset: Int = 0
      ): AuditLogResult!

      # Waitlist management
      adminWaitlistEntries(
        search: String
        limit: Int = 50
        offset: Int = 0
      ): AdminWaitlistResult!
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

    input IssueFineInput {
      studentId: ID!
      classId: ID!
      amount: Int!
      reason: String!
      description: String
    }

    type Mutation {
      # auth
      signUp(input: SignUpInput!): AuthPayload!
      login(email: String!, password: String!): AuthPayload!
      oauthLogin(provider: OAuthProvider!, code: String!): AuthPayload!

      # Public / email microservice
      joinWaitlist(input: JoinWaitlistInput!): JoinWaitlistResult!
      requestPasswordReset(email: String!): PublicActionResult!
      resetPassword(email: String!, token: String!, newPassword: String!): PublicActionResult!

      # Logged-in email verification (password signups)
      verifyEmailWithCode(code: String!): PublicActionResult!
      resendEmailVerificationCode: PublicActionResult!
      refreshAccessToken: String!
      logout: Boolean!

      """
      Permanently delete the signed-in user’s account when the confirmation phrase matches.
      Teachers and parents with active class or ownership assignments must resolve those first.
      """
      deleteMyAccount(confirmationPhrase: String!): PublicActionResult!

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
      
      # Fines
      issueFine(input: IssueFineInput!): Fine!
      waiveFine(id: ID!, reason: String!): Fine!
      deleteFine(id: ID!): Boolean!
      
      # Beta access
      validateBetaCode(code: String!): BetaAccessValidation!
      createBetaCode(code: String!, description: String, maxUses: Int = 1, expiresAt: DateTime): BetaAccessCode!
      deactivateBetaCode(id: ID!): BetaAccessCode!

      # Subscription management
      createCheckoutSession(planTier: PlanTier!): String!
      cancelSubscription: SubscriptionPlan!
      reactivateSubscription: SubscriptionPlan!
      
      # Payment Service Integration
      createPaymentCheckout(tier: String!, interval: String!, isFoundingMember: Boolean): PaymentCheckoutResponse!
      createBillingPortalSession(returnUrl: String): BillingPortalResponse!
      upgradeSubscription(tier: String!, interval: String): UpgradeResponse!
    }

    # Payment Response Types
    type PaymentCheckoutResponse {
      sessionId: String!
      url: String!
    }

    type BillingPortalResponse {
      url: String!
    }

    type UpgradeResponse {
      success: Boolean!
      message: String
      checkoutUrl: String
    }

    type Invoice {
      id: ID!
      number: String!
      status: String!
      amountDue: Int!
      amountPaid: Int!
      currency: String!
      periodStart: DateTime!
      periodEnd: DateTime!
      invoiceUrl: String
      invoicePdfUrl: String
      createdAt: DateTime!
    }

    # ---------- Admin Mutations (ADMIN role only) ----------
    input AdminUpdateUserInput {
      name: String
      email: String
      role: Role
      status: UserStatus
      hasBetaAccess: Boolean
      subscriptionTier: SubscriptionTier
      subscriptionStatus: SubscriptionStatus
      isFoundingMember: Boolean
    }

    input AdminUpdateClassroomInput {
      name: String
      settings: ClassroomSettingsInput
    }

    input ClassroomSettingsInput {
      currency: String
      overdraft: Int
      transferAcrossClasses: Boolean
    }

    extend type Mutation {
      # User management
      adminBanUser(userId: ID!, reason: String!): User!
      adminUnbanUser(userId: ID!): User!
      adminUpdateUser(userId: ID!, input: AdminUpdateUserInput!): User!
      adminDeleteUser(userId: ID!, hard: Boolean = false): Boolean!
      adminImpersonateUser(userId: ID!): AuthPayload!
      adminResetUserPassword(userId: ID!, newPassword: String!): Boolean!
      adminGrantBetaAccess(userId: ID!): User!
      adminRevokeBetaAccess(userId: ID!): User!
      
      # Classroom management
      adminUpdateClassroom(classroomId: ID!, input: AdminUpdateClassroomInput!): Classroom!
      adminDeleteClassroom(classroomId: ID!, hard: Boolean = false): Boolean!
      adminTransferClassroomOwnership(classroomId: ID!, newOwnerId: ID!): Classroom!
      
      # Class management
      adminForceDeleteClass(classId: ID!): Boolean!
      adminRestoreClass(classId: ID!): Class!
      
      # Subscription management (admin)
      adminUpdateSubscription(userId: ID!, input: AdminSubscriptionInput!): User!
      adminCancelSubscription(userId: ID!, immediately: Boolean = false, reason: String): User!
      adminExtendTrial(userId: ID!, days: Int!): User!
      adminGrantFoundingMember(userId: ID!): User!
      adminRevokeFoundingMember(userId: ID!): User!
      
      # System actions
      adminPurgeInactiveUsers(daysInactive: Int!): Int!
      adminSendBulkEmail(userIds: [ID!]!, subject: String!, body: String!): Boolean!
    }
    
    input AdminSubscriptionInput {
      subscriptionTier: SubscriptionTier
      subscriptionStatus: SubscriptionStatus
      isFoundingMember: Boolean
      trialEndsAt: DateTime
      subscriptionExpiresAt: DateTime
    }
    
    # Admin subscription stats
    type AdminSubscriptionStats {
      totalSubscriptions: Int!
      activeSubscriptions: Int!
      trialSubscriptions: Int!
      expiredSubscriptions: Int!
      cancelledSubscriptions: Int!
      foundingMembers: Int!
      tierBreakdown: JSON!
    }
    
    extend type Query {
      # Admin subscription queries
      adminSubscriptionStats: AdminSubscriptionStats!
      adminUserSubscription(userId: ID!): User
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
